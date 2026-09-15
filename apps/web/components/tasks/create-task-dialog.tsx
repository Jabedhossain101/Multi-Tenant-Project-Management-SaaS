'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createTaskSchema, type CreateTaskInput } from '@tasksaas/shared';
import { api } from '../../lib/api-client.js';
import { useAuthStore } from '../../lib/store/auth.store.js';
import { queryClient } from '../../lib/query-client.js';
import { useToast } from '../ui/use-toast.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Textarea } from '../ui/textarea.js';
import { Label } from '../ui/label.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.js';
import { Plus, Sparkles, Loader2 } from 'lucide-react';

interface CreateTaskDialogProps {
  defaultStatus?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  defaultProjectId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface ProjectOption {
  id: string;
  name: string;
  key: string;
}

interface AITaskAssistantResult {
  description: string;
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  suggestedDeadlineDays: number;
  acceptanceCriteria: string[];
  suggestedSubtasks: Array<{ title: string }>;
}

export function CreateTaskDialog({
  defaultStatus = 'TODO',
  defaultProjectId,
  trigger,
  onSuccess,
}: CreateTaskDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { activeOrgId } = useAuthStore();
  const { toast } = useToast();

  const { data: projectsData } = useQuery<{ items: ProjectOption[] }>({
    queryKey: ['projects-select', activeOrgId],
    queryFn: () => api.get<{ items: ProjectOption[] }>('/projects?limit=50'),
    enabled: !!activeOrgId && open,
  });

  const projects = projectsData?.items || [];
  const initialProjectId = defaultProjectId || (projects[0]?.id ?? '');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: initialProjectId,
      status: defaultStatus,
      priority: 'MEDIUM',
    },
  });

  React.useEffect(() => {
    if (initialProjectId) {
      setValue('projectId', initialProjectId);
    }
  }, [initialProjectId, setValue]);

  const selectedProjectId = watch('projectId');
  const taskTitle = watch('title');

  // AI Task Assistant Mutation
  const aiAssistMutation = useMutation({
    mutationFn: () =>
      api.post<AITaskAssistantResult>('/ai/task-assistant', {
        projectId: selectedProjectId,
        taskTitle,
      }),
    onSuccess: (result) => {
      if (result.description) {
        setValue('description', result.description);
      }
      if (result.suggestedPriority) {
        setValue('priority', result.suggestedPriority);
      }
      toast({
        title: '✨ AI Generated Details',
        description: 'Task description & priority auto-populated by Gemini.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'AI Generation Failed',
        description: 'Please ensure project and title are specified.',
        variant: 'destructive',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskInput) => api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Task Created',
        description: 'New task added to board.',
        variant: 'success',
      });
      reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create task.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateTaskInput) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="gradient" size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new deliverable to your project board with real-time sync.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g. Implement OAuth2 Refresh Rotation"
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectSelect">Project</Label>
              <Select
                value={selectedProjectId}
                onValueChange={(val) => setValue('projectId', val)}
              >
                <SelectTrigger id="projectSelect">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-xs text-destructive">{errors.projectId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioritySelect">Priority</Label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(val: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => setValue('priority', val)}
              >
                <SelectTrigger id="prioritySelect">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-blue-400 hover:text-blue-300 h-6 px-2"
                onClick={() => aiAssistMutation.mutate()}
                disabled={aiAssistMutation.isPending || !taskTitle.trim()}
              >
                {aiAssistMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1 h-3 w-3 text-blue-400" /> ✨ AI Auto-Fill
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              placeholder="Describe acceptance criteria, tech specs, or click ✨ AI Auto-Fill..."
              rows={4}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="statusSelect">Initial Column</Label>
              <Select
                defaultValue={defaultStatus}
                onValueChange={(val: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED') =>
                  setValue('status', val)
                }
              >
                <SelectTrigger id="statusSelect">
                  <SelectValue placeholder="Column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDueDate">Due Date (Optional)</Label>
              <Input
                id="taskDueDate"
                type="date"
                {...register('dueDate', {
                  setValueAs: (v) => (v ? new Date(v).toISOString() : undefined),
                })}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
