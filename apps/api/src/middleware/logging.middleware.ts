/* eslint-disable @typescript-eslint/no-namespace */
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: number;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = reqId;
  req.startTime = Date.now();

  res.setHeader('X-Request-Id', reqId);

  res.on('finish', () => {
    const durationMs = Date.now() - req.startTime;

    logger.info(`HTTP ${req.method} ${req.originalUrl}`, {
      requestId: req.id,
      userId: req.user?.id,
      organizationId: req.tenant?.organizationId,
      path: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
