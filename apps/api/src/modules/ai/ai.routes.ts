import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { aiLimiter } from '../../middleware/rate-limit.middleware.js';
import {
  Permission,
  generateTaskAssistantSchema,
  generateProjectSummarySchema,
  generateProductivityReportSchema,
} from '@tasksaas/shared';

const router: Router = Router();

router.use(requireAuth);
router.use(requireTenant);
router.use(aiLimiter);

router.post(
  '/task-assistant',
  requirePermission(Permission.AI_USE),
  validateBody(generateTaskAssistantSchema),
  aiController.taskAssistant.bind(aiController),
);

router.post(
  '/project-summary',
  requirePermission(Permission.AI_USE),
  validateBody(generateProjectSummarySchema),
  aiController.projectSummary.bind(aiController),
);

router.post(
  '/productivity-report',
  requirePermission(Permission.AI_USE),
  validateBody(generateProductivityReportSchema),
  aiController.productivityReport.bind(aiController),
);

router.get(
  '/usage',
  requirePermission(Permission.AI_USE),
  aiController.getUsage.bind(aiController),
);

export default router;
