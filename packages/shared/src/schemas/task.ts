import { z } from 'zod';
import { TaskPriority, TaskStatus } from '../constants/index.js';

export const createTaskSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(10000).optional(),
  status: z
    .enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.COMPLETED])
    .default(TaskStatus.TODO),
  priority: z
    .enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT])
    .default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  order: z.number().int().default(0),
  labels: z.array(z.string().max(50)).default([]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const reorderTaskSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum([
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.COMPLETED,
  ]),
  newOrder: z.number().int().min(0),
});

export type ReorderTaskInput = z.infer<typeof reorderTaskSchema>;

export const createSubtaskSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  title: z.string().min(1, 'Title is required').max(255),
  assigneeId: z.string().uuid().optional().nullable(),
  order: z.number().int().default(0),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  isCompleted: z.boolean().optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  order: z.number().int().optional(),
});

export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
