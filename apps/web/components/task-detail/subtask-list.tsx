'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api-client.js';
import { queryClient } from '../../lib/query-client.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Plus, Trash2, CheckSquare } from 'lucide-react';

export interface SubtaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
}

interface SubtaskListProps {
  taskId: string;
  subtasks: SubtaskItem[];
}

export function SubtaskList({ taskId, subtasks }: SubtaskListProps) {
  const [newTitle, setNewTitle] = React.useState('');

  const addMutation = useMutation({
    mutationFn: (title: string) => api.post(`/tasks/${taskId}/subtasks`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTitle('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ subtaskId, isCompleted }: { subtaskId: string; isCompleted: boolean }) =>
      api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (subtaskId: string) => api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMutation.mutate(newTitle.trim());
  };

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          <CheckSquare className="h-4 w-4 text-purple-400" />
          Subtasks ({completedCount}/{subtasks.length})
        </div>
        {subtasks.length > 0 && (
          <span className="text-xs font-mono font-bold text-muted-foreground">
            {progressPercent}%
          </span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-purple-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="space-y-1.5">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/60 group hover:border-border transition-colors"
          >
            <label className="flex items-center gap-2.5 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={subtask.isCompleted}
                onChange={(e) =>
                  toggleMutation.mutate({ subtaskId: subtask.id, isCompleted: e.target.checked })
                }
                className="h-4 w-4 rounded border-border bg-transparent text-primary focus:ring-0 cursor-pointer"
              />
              <span
                className={`text-xs ${
                  subtask.isCompleted
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground font-medium'
                }`}
              >
                {subtask.title}
              </span>
            </label>

            <button
              onClick={() => deleteMutation.mutate(subtask.id)}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive p-1 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a subtask checklist item..."
          className="h-8 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!newTitle.trim() || addMutation.isPending}
          className="h-8 px-3 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </form>
    </div>
  );
}
