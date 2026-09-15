'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { useAuthStore } from '../../../lib/store/auth.store.js';
import { useUIStore } from '../../../lib/store/ui.store.js';
import { KanbanBoard } from '../../../components/kanban/kanban-board.js';
import { type KanbanTaskItem } from '../../../components/kanban/kanban-card.js';
import { CreateTaskDialog } from '../../../components/tasks/create-task-dialog.js';
import { TaskDetailModal } from '../../../components/task-detail/task-detail-modal.js';
import { Input } from '../../../components/ui/input.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select.js';
import { Badge } from '../../../components/ui/badge.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { formatDate } from '../../../lib/utils.js';
import {
  CheckSquare,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';

interface TasksApiResponse {
  items: KanbanTaskItem[];
  total: number;
}

interface ProjectItem {
  id: string;
  name: string;
  key: string;
}

function TasksContent() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || 'ALL';
  const { activeOrgId } = useAuthStore();
  const { setActiveTaskId } = useUIStore();

  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = React.useState('');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(initialProjectId);
  const [priorityFilter, setPriorityFilter] = React.useState<string>('ALL');

  const { data: projectsData } = useQuery<{ items: ProjectItem[] }>({
    queryKey: ['projects-filter', activeOrgId],
    queryFn: () => api.get<{ items: ProjectItem[] }>('/projects?limit=50'),
    enabled: !!activeOrgId,
  });

  const { data: tasksData, isLoading } = useQuery<TasksApiResponse>({
    queryKey: ['tasks', activeOrgId, selectedProjectId, search, priorityFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedProjectId !== 'ALL') params.set('projectId', selectedProjectId);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      params.set('limit', '100');
      return api.get<TasksApiResponse>(`/tasks?${params.toString()}`);
    },
    enabled: !!activeOrgId,
  });

  const projects = projectsData?.items || [];
  const tasks = tasksData?.items || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-purple-400" />
            Task Management & Board
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Drag-and-drop Kanban workflow with real-time state synchronization
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-card/60 p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <CreateTaskDialog
            defaultProjectId={selectedProjectId !== 'ALL' ? selectedProjectId : undefined}
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card/60 p-3 rounded-xl border border-border/80">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full sm:w-44 h-9">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          initialTasks={tasks}
          onTaskClick={(taskId) => setActiveTaskId(taskId)}
        />
      ) : (
        /* List / Table View */
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No tasks found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className="flex items-center justify-between p-4 hover:bg-accent/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground uppercase">
                      {task.project?.key}
                    </span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {task.status}
                    </Badge>
                    <Badge
                      variant={
                        task.priority === 'URGENT'
                          ? 'destructive'
                          : task.priority === 'HIGH'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-muted-foreground hidden sm:inline">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Global Task Detail Modal */}
      <TaskDetailModal />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <TasksContent />
    </Suspense>
  );
}
