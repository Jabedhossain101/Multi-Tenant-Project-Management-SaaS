import { Worker, type Job } from 'bullmq';
import { redis } from '../../config/redis.js';
import { prisma, type NotificationType } from '@tasksaas/database';
import { emitToOrganization } from '../../sockets/socket.server.js';
import { logger } from '../../utils/logger.js';

export function startNotificationWorker(): Worker {
  const worker = new Worker(
    'notifications',
    async (job: Job) => {
      const { organizationId, userId, type, title, message, metadata } = job.data;

      // Persist notification in database with strict tenant binding
      const notification = await prisma.notification.create({
        data: {
          organizationId,
          userId,
          type: type as NotificationType,
          title,
          message,
          data: metadata,
        },
      });

      // Broadcast real-time notification to tenant room
      emitToOrganization(organizationId, 'notification:received', {
        userId,
        notification,
      });

      logger.info(`Notification job completed: ${notification.id} for user ${userId}`);
    },
    { connection: redis, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    logger.error(`Notification job ${job?.id} failed:`, err);
  });

  return worker;
}
