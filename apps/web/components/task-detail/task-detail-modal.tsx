'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api-client.js';
import { queryClient } from '../../lib/query-client.js';
import { useUIStore } from '../../lib/store/ui.store.js';
import { useToast } from '../ui/use-toast.js';
import { Dialog, DialogContent } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Textarea } from '../ui/textarea.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.js';
import { SubtaskList, type SubtaskItem } from './subtask-list.js';
import { CommentThread } from './comment-thread.js';
import { Skeleton } from '../ui/skeleton.js';
import { formatDate } from '../../lib/utils.js';
import { Calendar, Trash2, FolderKanban } from 'lucide-react';

interface TaskDetailResponse {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  projectId: string;
  project?: {
    id: string;
    key: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  subtasks: SubtaskItem[];
}

export function TaskDetailModal() {
  const { activeTaskId, setActiveTaskId } = useUIStore();
  const { toast } = useToast();
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [editingDesc, setEditingDesc] = React.useState(false);
  const [description, setDescription] = React.useState('');

  const { data: task, isLoading } = useQuery<TaskDetailResponse>({
    queryKey: ['task', activeTaskId],
    queryFn: () => api.get<TaskDetailResponse>(`/tasks/${activeTaskId}`),
    enabled: !!activeTaskId,
  });

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<TaskDetailResponse>) =>
      api.patch(`/tasks/${activeTaskId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', activeTaskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditingTitle(false);
      setEditingDesc(false);
      toast({ title: 'Task Updated', variant: 'success' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${activeTaskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setActiveTaskId(null);
      toast({ title: 'Task Deleted', variant: 'success' });
    },
  });

  const isOpen = !!activeTaskId;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setActiveTaskId(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        {isLoading || !task ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            {/* Header: Project Badge, Actions */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                  {task.project?.key} • {task.project?.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  className="text-xs text-destructive hover:bg-destructive/10 h-8 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>

            {/* Title Section */}
            <div className="space-y-2">
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="font-bold text-base"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => updateMutation.mutate({ title })}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTitle(task.title);
                      setEditingTitle(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <h2
                  onClick={() => setEditingTitle(true)}
                  className="text-xl font-bold tracking-tight text-foreground hover:text-primary cursor-pointer transition-colors"
                  title="Click to edit title"
                >
                  {task.title}
                </h2>
              )}
            </div>

            {/* Status & Priority Controls Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-card/60 rounded-xl border border-border/80">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Status</span>
                <Select
                  value={task.status}
                  onValueChange={(val: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED') =>
                    updateMutation.mutate({ status: val })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Priority</span>
                <Select
                  value={task.priority}
                  onValueChange={(val: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') =>
                    updateMutation.mutate({ priority: val })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Due Date</span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground h-8 px-2 rounded-md border border-input bg-background/50">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Description
              </span>
              {editingDesc ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="text-xs"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDescription(task.description || '');
                        setEditingDesc(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => updateMutation.mutate({ description })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground leading-relaxed cursor-pointer hover:border-primary/40 transition-colors min-h-[60px] whitespace-pre-wrap"
                  title="Click to edit description"
                >
                  {task.description || 'Add a detailed description for this task...'}
                </div>
              )}
            </div>

            {/* Subtasks Checklist */}
            <div className="pt-2 border-t border-border/60">
              <SubtaskList taskId={task.id} subtasks={task.subtasks || []} />
            </div>

            {/* Activity & Comments Thread */}
            <div className="pt-2 border-t border-border/60">
              <CommentThread taskId={task.id} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
