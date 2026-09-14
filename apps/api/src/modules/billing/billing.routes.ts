import { Router, raw } from 'express';
import { billingController } from './billing.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { Permission, createCheckoutSessionSchema, createPortalSessionSchema } from '@tasksaas/shared';

const router: Router = Router();

// Stripe Webhook Endpoint (Requires raw body and NO auth middleware)
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  billingController.webhook.bind(billingController),
);

// Protected tenant billing routes
router.get(
  '/subscription',
  requireAuth,
  requireTenant,
  requirePermission(Permission.ORG_MANAGE_BILLING),
  billingController.getSubscription.bind(billingController),
);

router.post(
  '/checkout',
  requireAuth,
  requireTenant,
  requirePermission(Permission.ORG_MANAGE_BILLING),
  validateBody(createCheckoutSessionSchema),
  billingController.createCheckout.bind(billingController),
);

router.post(
  '/portal',
  requireAuth,
  requireTenant,
  requirePermission(Permission.ORG_MANAGE_BILLING),
  validateBody(createPortalSessionSchema),
  billingController.createPortal.bind(billingController),
);

router.get(
  '/history',
  requireAuth,
  requireTenant,
  requirePermission(Permission.ORG_MANAGE_BILLING),
  billingController.getHistory.bind(billingController),
);

export default router;
