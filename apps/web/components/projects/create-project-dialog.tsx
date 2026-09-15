'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createProjectSchema, type CreateProjectInput } from '@tasksaas/shared';
import { api } from '../../lib/api-client.js';
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
import { Plus, Loader2 } from 'lucide-react';

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateProjectDialog({ trigger, onSuccess }: CreateProjectDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
      priority: 'MEDIUM',
    },
  });

  const nameVal = watch('name');

  React.useEffect(() => {
    if (nameVal && !watch('key')) {
      const generatedKey = nameVal
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 4)
        .toUpperCase();
      if (generatedKey.length >= 2) {
        setValue('key', generatedKey);
      }
    }
  }, [nameVal, setValue, watch]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectInput) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Project Created',
        description: 'New project workspace is ready.',
        variant: 'success',
      });
      reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create project. Please verify project key is unique.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateProjectInput) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Organize tasks, assign team members, and track real-time delivery milestones.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="projName">Project Name</Label>
            <Input
              id="projName"
              placeholder="e.g. Mobile App Redesign, Cloud Migration"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projKey">Project Key</Label>
              <Input
                id="projKey"
                placeholder="PROJ"
                maxLength={10}
                className="uppercase font-mono"
                {...register('key', {
                  onChange: (e) => (e.target.value = e.target.value.toUpperCase()),
                })}
              />
              {errors.key && <p className="text-xs text-destructive">{errors.key.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(val: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => setValue('priority', val)}
              >
                <SelectTrigger>
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
            <Label htmlFor="projDesc">Description (Optional)</Label>
            <Textarea
              id="projDesc"
              placeholder="Outline project goals and architectural requirements..."
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Target Due Date (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              {...register('deadline', {
                setValueAs: (v) => (v ? new Date(v).toISOString() : undefined),
              })}
            />
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
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
