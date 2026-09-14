import { z } from 'zod';

export const createCommentSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
  mentions: z.array(z.string().uuid()).default([]),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
  mentions: z.array(z.string().uuid()).optional(),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
