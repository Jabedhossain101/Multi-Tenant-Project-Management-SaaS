import { Router } from 'express';
import { commentController } from './comment.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { Permission, createCommentSchema, updateCommentSchema } from '@tasksaas/shared';

const router: Router = Router();

router.use(requireAuth);
router.use(requireTenant);

router.get(
  '/',
  requirePermission(Permission.TASK_READ),
  commentController.list.bind(commentController),
);

router.post(
  '/',
  requirePermission(Permission.COMMENT_CREATE),
  validateBody(createCommentSchema),
  commentController.create.bind(commentController),
);

router.patch(
  '/:commentId',
  requirePermission(Permission.COMMENT_UPDATE),
  validateBody(updateCommentSchema),
  commentController.update.bind(commentController),
);

router.delete(
  '/:commentId',
  requirePermission(Permission.COMMENT_DELETE),
  commentController.delete.bind(commentController),
);

export default router;
