import type { NotificationType, Prisma } from '@tasksaas/database';
import { notificationRepository } from './notification.repository.js';

export class NotificationService {
  async getNotifications(userId: string, organizationId: string, page = 1, limit = 20) {
    return notificationRepository.findByUserAndOrg(userId, organizationId, page, limit);
  }

  async getUnreadCount(userId: string, organizationId: string) {
    return notificationRepository.getUnreadCount(userId, organizationId);
  }

  async markAsRead(notificationId: string, userId: string, organizationId: string) {
    return notificationRepository.markAsRead(notificationId, userId, organizationId);
  }

  async markAllAsRead(userId: string, organizationId: string) {
    await notificationRepository.markAllAsRead(userId, organizationId);
  }

  async createNotification(
    organizationId: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Prisma.InputJsonValue,
  ) {
    return notificationRepository.create({
      organizationId,
      userId,
      type,
      title,
      message,
      data,
    });
  }
}

export const notificationService = new NotificationService();
