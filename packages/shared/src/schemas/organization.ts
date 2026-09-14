import { z } from 'zod';
import { Role } from '../constants/roles.js';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
    .optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
    .optional(),
  logoUrl: z.string().url().optional().nullable(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  role: z.enum([Role.ORG_ADMIN, Role.PROJECT_MANAGER, Role.TEAM_MEMBER]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum([Role.ORG_ADMIN, Role.PROJECT_MANAGER, Role.TEAM_MEMBER]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
