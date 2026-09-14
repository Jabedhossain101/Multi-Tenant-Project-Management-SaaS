import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authLimiter } from '../../middleware/rate-limit.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@tasksaas/shared';

const router: Router = Router();

router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  authController.register.bind(authController),
);

router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  authController.login.bind(authController),
);

router.post(
  '/refresh',
  authController.refresh.bind(authController),
);

router.post(
  '/logout',
  authController.logout.bind(authController),
);

router.get(
  '/me',
  requireAuth,
  authController.me.bind(authController),
);

router.post(
  '/forgot-password',
  authLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword.bind(authController),
);

router.post(
  '/reset-password',
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword.bind(authController),
);

router.post(
  '/verify-email',
  authLimiter,
  validateBody(verifyEmailSchema),
  authController.verifyEmail.bind(authController),
);

export default router;
