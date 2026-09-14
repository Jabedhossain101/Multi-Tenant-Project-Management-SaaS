import { z } from 'zod';
import { PlanTier } from '../constants/plans.js';

export const createCheckoutSessionSchema = z.object({
  plan: z.enum([PlanTier.PRO, PlanTier.BUSINESS]),
  interval: z.enum(['month', 'year']).default('month'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;

export const createPortalSessionSchema = z.object({
  returnUrl: z.string().url(),
});

export type CreatePortalSessionInput = z.infer<typeof createPortalSessionSchema>;
