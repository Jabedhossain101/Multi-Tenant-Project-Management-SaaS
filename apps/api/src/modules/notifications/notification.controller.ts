import type { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service.js';
import { sendSuccess } from '../../utils/response.js';

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { page = '1', limit = '20' } = req.query;

      const result = await notificationService.getNotifications(
        req.user!.id,
        orgId,
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );

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

  async unreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const count = await notificationService.getUnreadCount(req.user!.id, orgId);
      sendSuccess(res, { unreadCount: count });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { notificationId } = req.params;
      const notification = await notificationService.markAsRead(notificationId!, req.user!.id, orgId);
      sendSuccess(res, notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      await notificationService.markAllAsRead(req.user!.id, orgId);
      sendSuccess(res, { message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
