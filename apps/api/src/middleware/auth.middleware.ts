/* eslint-disable @typescript-eslint/no-namespace */
import type { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '@tasksaas/shared';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '@tasksaas/database';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // 2. Check Authorization Bearer header as fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AuthenticationError('Authentication token missing or invalid');
    }

    const payload = verifyAccessToken(token);

    // Validate active user in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Authenticated user no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Invalid or expired authentication token'));
    }
  }
}
