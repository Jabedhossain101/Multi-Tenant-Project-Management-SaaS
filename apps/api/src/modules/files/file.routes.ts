import { Router } from 'express';
import { fileController } from './file.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { Permission, getPresignedUploadUrlSchema, confirmFileUploadSchema } from '@tasksaas/shared';

const router: Router = Router();

router.use(requireAuth);
router.use(requireTenant);

router.post(
  '/upload-url',
  requirePermission(Permission.FILE_UPLOAD),
  validateBody(getPresignedUploadUrlSchema),
  fileController.getUploadUrl.bind(fileController),
);

router.post(
  '/confirm',
  requirePermission(Permission.FILE_UPLOAD),
  validateBody(confirmFileUploadSchema),
  fileController.confirm.bind(fileController),
);

router.get(
  '/:fileId/download-url',
  requirePermission(Permission.FILE_READ),
  fileController.getDownloadUrl.bind(fileController),
);

router.delete(
  '/:fileId',
  requirePermission(Permission.FILE_DELETE),
  fileController.delete.bind(fileController),
);

export default router;
