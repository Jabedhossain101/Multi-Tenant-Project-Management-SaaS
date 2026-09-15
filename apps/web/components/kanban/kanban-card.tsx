'use client';

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '../ui/badge.js';
import { formatDate } from '../../lib/utils.js';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';

export interface KanbanTaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  position: number;
  dueDate?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  project?: {
    id: string;
    key: string;
    name: string;
  };
  _count?: {
    subtasks: number;
    comments: number;
  };
}

interface KanbanCardProps {
  task: KanbanTaskItem;
  onClick?: () => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < Date.now() && task.status !== 'COMPLETED';

  const priorityColor: 'destructive' | 'warning' | 'secondary' | 'outline' =
    task.priority === 'URGENT'
      ? 'destructive'
      : task.priority === 'HIGH'
      ? 'warning'
      : task.priority === 'LOW'
      ? 'secondary'
      : 'outline';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`rounded-xl border border-border/80 bg-card p-3.5 shadow-sm transition-all cursor-grab active:cursor-grabbing hover:border-primary/50 group select-none space-y-2.5 ${
        isDragging ? 'opacity-40 ring-2 ring-primary rotate-1 scale-105 shadow-xl' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        {task.project?.key && (
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
            {task.project.key}
          </span>
        )}
        <Badge variant={priorityColor} className="text-[9px] px-1.5 py-0">
          {task.priority}
        </Badge>
      </div>

      <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          {task._count && task._count.subtasks > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <CheckSquare className="h-3 w-3 text-muted-foreground" />
              {task._count.subtasks}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-[10px] ${
                isOverdue ? 'text-rose-400 font-semibold' : ''
              }`}
            >
              {isOverdue ? <AlertTriangle className="h-3 w-3 text-rose-400" /> : <Clock className="h-3 w-3" />}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {task.assignee ? (
          <div
            className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px] border border-primary/30"
            title={task.assignee.name}
          >
            {task.assignee.name[0]?.toUpperCase()}
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground/60 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
}
