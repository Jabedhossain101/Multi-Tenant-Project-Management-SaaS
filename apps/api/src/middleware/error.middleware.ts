import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorCode } from '@tasksaas/shared';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. Handled AppError
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message}`, {
      requestId: req.id,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
      path: req.originalUrl,
    });

    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.format();
    const details = { issues: err.issues };

    logger.warn(`Validation Error: ${req.originalUrl}`, {
      requestId: req.id,
      details: formattedErrors,
    });

    sendError(
      res,
      ErrorCode.VALIDATION_ERROR,
      'Request input validation failed',
      400,
      details,
    );
    return;
  }

  // 3. Unhandled Internal Server Errors
  logger.error('Unhandled Internal Server Exception', err, {
    requestId: req.id,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
  });

  const isProd = env.NODE_ENV === 'production';
  const message = isProd
    ? 'An unexpected internal server error occurred'
    : err instanceof Error
      ? err.message
      : 'Unknown Error';

  const details = isProd
    ? undefined
    : err instanceof Error
      ? { stack: err.stack }
      : undefined;

  sendError(res, ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details);
}
