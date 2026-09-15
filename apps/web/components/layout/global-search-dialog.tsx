'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../lib/store/ui.store.js';
import { api } from '../../lib/api-client.js';
import { Dialog, DialogContent } from '../ui/dialog.js';
import { Input } from '../ui/input.js';
import { Badge } from '../ui/badge.js';
import { Search, FolderKanban, CheckSquare, Loader2, ArrowRight } from 'lucide-react';

interface SearchResultProject {
  id: string;
  name: string;
  key: string;
  status: string;
}

interface SearchResultTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  project?: {
    id: string;
    key: string;
    name: string;
  };
}

export function GlobalSearchDialog() {
  const { searchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [projects, setProjects] = React.useState<SearchResultProject[]>([]);
  const [tasks, setTasks] = React.useState<SearchResultTask[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  React.useEffect(() => {
    if (!query.trim()) {
      setProjects([]);
      setTasks([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [projRes, taskRes] = await Promise.all([
          api.get<{ items: SearchResultProject[] }>(`/projects?search=${encodeURIComponent(query)}&limit=5`),
          api.get<{ items: SearchResultTask[] }>(`/tasks?search=${encodeURIComponent(query)}&limit=5`),
        ]);

        setProjects(projRes.items || []);
        setTasks(taskRes.items || []);
      } catch {
        setProjects([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProject = (projectId: string) => {
    setSearchOpen(false);
    router.push(`/projects/${projectId}`);
  };

  const handleSelectTask = (taskId: string) => {
    setSearchOpen(false);
    useUIStore.getState().setActiveTaskId(taskId);
    router.push(`/tasks/${taskId}`);
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="p-0 max-w-xl overflow-hidden border-border bg-card/98 backdrop-blur-xl">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, or press Esc to exit..."
            className="border-0 shadow-none focus-visible:ring-0 text-base bg-transparent px-0"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
        </div>

        <div className="max-h-80 overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="text-xs text-muted-foreground text-center py-6">
              Type to search across active workspace projects and tasks...
            </div>
          )}

          {query.trim() && !loading && projects.length === 0 && tasks.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-2">Projects</div>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{project.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{project.key}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{project.status}</Badge>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {tasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-2">Tasks</div>
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleSelectTask(task.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{task.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {task.project ? `${task.project.key} • ` : ''}Priority: {task.priority}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
