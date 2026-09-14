import { Redis } from 'ioredis';
import { env } from './env.js';

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        if (times > 3) {
          return null; // Stop retrying if Redis is not running
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
    });

    redisInstance.on('error', (err) => {
      // Suppress noisy crash logs in test/dev when redis is optional
      if (env.NODE_ENV !== 'test') {
        console.warn('⚠️ Redis Connection Notice:', err.message);
      }
    });
  }

  return redisInstance;
}

export const redis = getRedisClient();
