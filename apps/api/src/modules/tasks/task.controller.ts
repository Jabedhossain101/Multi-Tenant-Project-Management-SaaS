import type { Request, Response, NextFunction } from 'express';
import { taskService } from './task.service.js';
import { sendSuccess } from '../../utils/response.js';
import type { TaskStatus, TaskPriority } from '@tasksaas/shared';

export class TaskController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const {
        projectId,
        status,
        priority,
        assigneeId,
        search,
        page = '1',
        limit = '50',
        sortBy = 'order',
        sortOrder = 'asc',
      } = req.query;

      const result = await taskService.getTasks({
        organizationId: orgId,
        projectId: projectId as string,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        assigneeId: assigneeId as string,
        search: search as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as 'order' | 'createdAt' | 'dueDate' | 'priority',
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      sendSuccess(res, result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { taskId } = req.params;
      const task = await taskService.getTask(taskId!, orgId);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const task = await taskService.createTask(orgId, req.user!.id, req.body);
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { taskId } = req.params;
      const updated = await taskService.updateTask(taskId!, orgId, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { taskId } = req.params;
      await taskService.deleteTask(taskId!, orgId);
      sendSuccess(res, { message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const updated = await taskService.reorderTask(orgId, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  // Subtasks
  async createSubtask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const subtask = await taskService.createSubtask(orgId, req.body);
      sendSuccess(res, subtask, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSubtask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { subtaskId } = req.params;
      const updated = await taskService.updateSubtask(subtaskId!, orgId, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubtask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { subtaskId } = req.params;
      await taskService.deleteSubtask(subtaskId!, orgId);
      sendSuccess(res, { message: 'Subtask deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
