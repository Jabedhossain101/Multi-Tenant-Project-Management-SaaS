import { z } from 'zod';

export const generateTaskAssistantSchema = z.object({
  projectId: z.string().uuid(),
  taskTitle: z.string().min(2).max(255),
  context: z.string().max(2000).optional(),
});

export type GenerateTaskAssistantInput = z.infer<typeof generateTaskAssistantSchema>;

export const generateProjectSummarySchema = z.object({
  projectId: z.string().uuid(),
});

export type GenerateProjectSummaryInput = z.infer<typeof generateProjectSummarySchema>;

export const generateProductivityReportSchema = z.object({
  timeframe: z.enum(['last_7_days', 'last_30_days']).default('last_7_days'),
});

export type GenerateProductivityReportInput = z.infer<typeof generateProductivityReportSchema>;
