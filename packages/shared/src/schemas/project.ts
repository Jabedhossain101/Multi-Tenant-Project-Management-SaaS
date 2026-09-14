import { z } from 'zod';
import { ProjectPriority, ProjectStatus } from '../constants/index.js';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key must be at most 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Project key must be uppercase alphanumeric (e.g., PROJ)'),
  description: z.string().max(2000).optional(),
  status: z
    .enum([
      ProjectStatus.PLANNING,
      ProjectStatus.ACTIVE,
      ProjectStatus.ON_HOLD,
      ProjectStatus.COMPLETED,
      ProjectStatus.ARCHIVED,
    ])
    .default(ProjectStatus.PLANNING),
  priority: z
    .enum([
      ProjectPriority.LOW,
      ProjectPriority.MEDIUM,
      ProjectPriority.HIGH,
      ProjectPriority.URGENT,
    ])
    .default(ProjectPriority.MEDIUM),
  startDate: z.string().datetime().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const addProjectMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.string().optional(),
});

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
