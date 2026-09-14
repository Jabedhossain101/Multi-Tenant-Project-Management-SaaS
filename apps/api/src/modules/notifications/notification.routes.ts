import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';

const router: Router = Router();

router.use(requireAuth);
router.use(requireTenant);

router.get(
  '/',
  notificationController.list.bind(notificationController),
);

router.get(
  '/unread-count',
  notificationController.unreadCount.bind(notificationController),
);

router.patch(
  '/read-all',
  notificationController.markAllAsRead.bind(notificationController),
);

router.patch(
  '/:notificationId/read',
  notificationController.markAsRead.bind(notificationController),
);

export default router;
