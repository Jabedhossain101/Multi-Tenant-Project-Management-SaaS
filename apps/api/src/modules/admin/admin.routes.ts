import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../middleware/rbac.middleware.js';

const router: Router = Router();

router.use(requireAuth);
router.use(requireSuperAdmin);

router.get('/stats', adminController.stats.bind(adminController));
router.get('/organizations', adminController.listOrganizations.bind(adminController));
router.patch('/organizations/:orgId/suspend', adminController.suspendOrg.bind(adminController));
router.patch('/organizations/:orgId/reactivate', adminController.reactivateOrg.bind(adminController));
router.get('/users', adminController.listUsers.bind(adminController));
router.get('/audit-logs', adminController.auditLogs.bind(adminController));
router.get('/ai-usage', adminController.aiUsage.bind(adminController));

export default router;
