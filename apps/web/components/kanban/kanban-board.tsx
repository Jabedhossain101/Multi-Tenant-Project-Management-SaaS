'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column.js';
import { KanbanCard, type KanbanTaskItem } from './kanban-card.js';
import { api } from '../../lib/api-client.js';
import { queryClient } from '../../lib/query-client.js';
import { useToast } from '../ui/use-toast.js';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

interface KanbanBoardProps {
  initialTasks: KanbanTaskItem[];
  onAddTask?: (status: TaskStatus) => void;
  onTaskClick?: (taskId: string) => void;
}

const COLUMNS: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: 'TODO', title: 'To Do', color: 'bg-blue-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-amber-400' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-purple-400' },
  { id: 'COMPLETED', title: 'Completed', color: 'bg-emerald-400' },
];

export function KanbanBoard({ initialTasks, onAddTask, onTaskClick }: KanbanBoardProps) {
  const [tasks, setTasks] = React.useState<KanbanTaskItem[]>(initialTasks);
  const [activeTask, setActiveTask] = React.useState<KanbanTaskItem | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );

  const tasksByColumn = React.useMemo(() => {
    const acc: Record<TaskStatus, KanbanTaskItem[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      COMPLETED: [],
    };
    tasks.forEach((task) => {
      if (acc[task.status]) {
        acc[task.status].push(task);
      }
    });
    // Sort by position
    Object.keys(acc).forEach((col) => {
      acc[col as TaskStatus].sort((a, b) => a.position - b.position);
    });
    return acc;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    const isOverAColumn = COLUMNS.some((col) => col.id === overId);

    // Dropping over another column directly
    if (isOverAColumn && activeTaskObj.status !== overId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: overId as TaskStatus } : t)),
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    let destinationStatus: TaskStatus = activeTaskObj.status;
    let newPosition = activeTaskObj.position;

    const isOverAColumn = COLUMNS.some((col) => col.id === overId);

    if (isOverAColumn) {
      destinationStatus = overId as TaskStatus;
      const columnTasks = tasksByColumn[destinationStatus];
      newPosition = columnTasks.length > 0 ? Math.max(...columnTasks.map((t) => t.position)) + 1000 : 1000;
    } else {
      const overTaskObj = tasks.find((t) => t.id === overId);
      if (overTaskObj) {
        destinationStatus = overTaskObj.status;
        const columnTasks = tasksByColumn[destinationStatus];
        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(columnTasks, oldIndex, newIndex);
          newPosition = (newIndex + 1) * 1000;
          setTasks((prev) => [
            ...prev.filter((t) => t.status !== destinationStatus),
            ...reordered.map((t, idx) => ({ ...t, position: (idx + 1) * 1000, status: destinationStatus })),
          ]);
        }
      }
    }

    // Synchronize reorder with backend API
    try {
      await api.post('/tasks/reorder', {
        taskId: activeId,
        newStatus: destinationStatus,
        newPosition,
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch {
      toast({
        title: 'Reorder Sync Failed',
        description: 'Failed to update task position on server.',
        variant: 'destructive',
      });
      setTasks(initialTasks);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            tasks={tasksByColumn[col.id]}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
