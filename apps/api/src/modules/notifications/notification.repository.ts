import { prisma, type Notification, type NotificationType, type Prisma } from '@tasksaas/database';

export class NotificationRepository {
  async findByUserAndOrg(userId: string, organizationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, items, unreadCount] = await Promise.all([
      prisma.notification.count({
        where: { userId, organizationId },
      }),
      prisma.notification.findMany({
        where: { userId, organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({
        where: { userId, organizationId, isRead: false },
      }),
    ]);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async getUnreadCount(userId: string, organizationId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        organizationId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string, organizationId: string): Promise<Notification> {
    return prisma.notification.update({
      where: {
        id,
        userId,
        organizationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string, organizationId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        organizationId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async create(data: {
    organizationId: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Prisma.InputJsonValue;
  }): Promise<Notification> {
    return prisma.notification.create({
      data,
    });
  }
}

export const notificationRepository = new NotificationRepository();
