import { Router } from 'express';
import { taskController } from './task.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import {
  Permission,
  createTaskSchema,
  updateTaskSchema,
  reorderTaskSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
} from '@tasksaas/shared';

const router: Router = Router();

router.use(requireAuth);
router.use(requireTenant);

router.get(
  '/',
  requirePermission(Permission.TASK_READ),
  taskController.list.bind(taskController),
);

router.post(
  '/',
  requirePermission(Permission.TASK_CREATE),
  validateBody(createTaskSchema),
  taskController.create.bind(taskController),
);

router.post(
  '/reorder',
  requirePermission(Permission.TASK_UPDATE),
  validateBody(reorderTaskSchema),
  taskController.reorder.bind(taskController),
);

router.get(
  '/:taskId',
  requirePermission(Permission.TASK_READ),
  taskController.getOne.bind(taskController),
);

router.patch(
  '/:taskId',
  requirePermission(Permission.TASK_UPDATE),
  validateBody(updateTaskSchema),
  taskController.update.bind(taskController),
);

router.delete(
  '/:taskId',
  requirePermission(Permission.TASK_DELETE),
  taskController.delete.bind(taskController),
);

// Subtasks routes
router.post(
  '/:taskId/subtasks',
  requirePermission(Permission.TASK_UPDATE),
  validateBody(createSubtaskSchema.omit({ taskId: true })),
  (req, res, next) => {
    req.body.taskId = req.params.taskId;
    taskController.createSubtask(req, res, next);
  },
);

router.patch(
  '/:taskId/subtasks/:subtaskId',
  requirePermission(Permission.TASK_UPDATE),
  validateBody(updateSubtaskSchema),
  taskController.updateSubtask.bind(taskController),
);

router.delete(
  '/:taskId/subtasks/:subtaskId',
  requirePermission(Permission.TASK_UPDATE),
  taskController.deleteSubtask.bind(taskController),
);

export default router;
