import { Router } from 'express';
import { projectController } from './project.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import {
  Permission,
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
} from '@tasksaas/shared';

const router: Router = Router();

router.use(requireAuth);
router.use(requireTenant);

router.get(
  '/',
  requirePermission(Permission.PROJECT_READ),
  projectController.list.bind(projectController),
);

router.post(
  '/',
  requirePermission(Permission.PROJECT_CREATE),
  validateBody(createProjectSchema),
  projectController.create.bind(projectController),
);

router.get(
  '/:projectId',
  requirePermission(Permission.PROJECT_READ),
  projectController.getOne.bind(projectController),
);

router.patch(
  '/:projectId',
  requirePermission(Permission.PROJECT_UPDATE),
  validateBody(updateProjectSchema),
  projectController.update.bind(projectController),
);

router.post(
  '/:projectId/archive',
  requirePermission(Permission.PROJECT_ARCHIVE),
  projectController.archive.bind(projectController),
);

router.post(
  '/:projectId/restore',
  requirePermission(Permission.PROJECT_ARCHIVE),
  projectController.restore.bind(projectController),
);

router.delete(
  '/:projectId',
  requirePermission(Permission.PROJECT_DELETE),
  projectController.delete.bind(projectController),
);

router.post(
  '/:projectId/members',
  requirePermission(Permission.PROJECT_MANAGE_MEMBERS),
  validateBody(addProjectMemberSchema),
  projectController.addMember.bind(projectController),
);

router.delete(
  '/:projectId/members/:userId',
  requirePermission(Permission.PROJECT_MANAGE_MEMBERS),
  projectController.removeMember.bind(projectController),
);

router.get(
  '/:projectId/analytics',
  requirePermission(Permission.PROJECT_READ),
  projectController.getAnalytics.bind(projectController),
);

export default router;
