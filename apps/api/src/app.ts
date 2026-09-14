import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestLogger } from './middleware/logging.middleware.js';
import { standardApiLimiter } from './middleware/rate-limit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // 1. Security & Logging middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(requestLogger);

  // 2. Health check route
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // 3. Body parsers (JSON & urlencoded, preserving raw body for webhooks)
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: Request, _res, buf) => {
        if (req.originalUrl.includes('/billing/webhook')) {
          (req as unknown as { rawBody?: Buffer }).rawBody = buf;
        }
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  // 4. Rate limiting for API routes
  app.use('/api/v1', standardApiLimiter);

  // 5. Mount Versioned REST API Router
  app.use('/api/v1', apiRouter);

  // 6. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
