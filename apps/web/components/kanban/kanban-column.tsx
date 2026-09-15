'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard, type KanbanTaskItem } from './kanban-card.js';
import { Badge } from '../ui/badge.js';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  title: string;
  tasks: KanbanTaskItem[];
  color: string;
  onAddTask?: (status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED') => void;
  onTaskClick?: (taskId: string) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  color,
  onAddTask,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const taskIds = React.useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div className="flex flex-col rounded-2xl bg-card/40 border border-border/70 p-3 min-w-[280px] sm:min-w-[300px] flex-1 min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {title}
          </span>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
            {tasks.length}
          </Badge>
        </div>

        {onAddTask && (
          <button
            onClick={() => onAddTask(id)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors"
            title="Add task in this column"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Task Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto pt-3 space-y-3 rounded-xl transition-colors min-h-[400px] ${
          isOver ? 'bg-primary/5 ring-1 ring-primary/30' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-32 flex items-center justify-center border border-dashed border-border/50 rounded-xl text-[11px] text-muted-foreground/60 select-none">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
