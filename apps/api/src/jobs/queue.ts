import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

export const notificationQueue = new Queue('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  },
});

export const deadlineReminderQueue = new Queue('deadline-reminders', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: true,
  },
});

export const reportQueue = new Queue('productivity-reports', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: true,
  },
});

export async function addNotificationJob(data: {
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await notificationQueue.add('send-notification', data);
  } catch (err) {
    logger.warn('Failed to queue notification job (Redis may be offline in dev/test):', {
      error: err instanceof Error ? err.message : err,
    });
  }
}
