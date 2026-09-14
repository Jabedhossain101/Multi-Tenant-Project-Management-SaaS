import { z } from 'zod';

export const getPresignedUploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024), // Max 50MB
  taskId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export type GetPresignedUploadUrlInput = z.infer<typeof getPresignedUploadUrlSchema>;

export const confirmFileUploadSchema = z.object({
  key: z.string().min(1),
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().int().positive(),
  taskId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export type ConfirmFileUploadInput = z.infer<typeof confirmFileUploadSchema>;
