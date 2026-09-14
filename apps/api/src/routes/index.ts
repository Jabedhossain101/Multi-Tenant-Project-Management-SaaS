import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import organizationRoutes from '../modules/organizations/organization.routes.js';
import projectRoutes from '../modules/projects/project.routes.js';
import taskRoutes from '../modules/tasks/task.routes.js';
import commentRoutes from '../modules/comments/comment.routes.js';
import fileRoutes from '../modules/files/file.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import aiRoutes from '../modules/ai/ai.routes.js';
import billingRoutes from '../modules/billing/billing.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';

const apiRouter: Router = Router();

apiRouter.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Multi-Tenant AI Project Management SaaS API',
    version: '1.0.0',
    status: 'active',
    modules: [
      'auth',
      'organizations',
      'projects',
      'tasks',
      'comments',
      'files',
      'notifications',
      'ai',
      'billing',
      'admin',
    ],
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/organizations', organizationRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/comments', commentRoutes);
apiRouter.use('/files', fileRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/billing', billingRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
