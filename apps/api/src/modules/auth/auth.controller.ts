import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { setAuthCookies, clearAuthCookies } from '../../utils/jwt.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.register(req.body, userAgent, ipAddress);
      setAuthCookies(res, result.tokens);

      sendSuccess(res, {
        user: result.user,
        organizationId: result.organizationId,
        accessToken: result.tokens.accessToken,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.login(req.body, userAgent, ipAddress);
      setAuthCookies(res, result.tokens);

      sendSuccess(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.refreshTokens(refreshToken, userAgent, ipAddress);
      setAuthCookies(res, result.tokens);

      sendSuccess(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      await authService.logout(refreshToken);
      clearAuthCookies(res);

      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, { user: req.user });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body.email);
      sendSuccess(res, {
        message: 'Password reset link generated',
        resetToken: result.resetToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body);
      sendSuccess(res, { message: 'Password reset successful. Please login with your new password.' });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.verifyEmail(req.body.token);
      sendSuccess(res, { message: 'Email address successfully verified.' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
