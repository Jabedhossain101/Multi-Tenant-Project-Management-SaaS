import { ConflictError, AuthenticationError, NotFoundError } from '@tasksaas/shared';
import type { RegisterInput, LoginInput, ResetPasswordInput } from '@tasksaas/shared';
import { authRepository } from './auth.repository.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, type TokenPair } from '../../utils/jwt.js';

export class AuthService {
  async register(
    input: RegisterInput,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: { id: string; email: string; name: string }; tokens: TokenPair; organizationId?: string }> {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(`User with email '${input.email}' already exists`);
    }

    const passwordHash = await hashPassword(input.password);

    const { user, organizationId } = await authRepository.createUserWithOrg({
      email: input.email,
      name: input.name,
      passwordHash,
      organizationName: input.organizationName,
    });

    const tokens = await this.createSessionTokens(user.id, user.email, user.isSuperAdmin, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tokens,
      organizationId,
    };
  }

  async login(
    input: LoginInput,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: { id: string; email: string; name: string; isSuperAdmin: boolean }; tokens: TokenPair }> {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password credentials');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password credentials');
    }

    const tokens = await this.createSessionTokens(user.id, user.email, user.isSuperAdmin, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
      },
      tokens,
    };
  }

  async refreshTokens(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: { id: string; email: string; name: string }; tokens: TokenPair }> {
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required');
    }

    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const session = await authRepository.findSessionByToken(refreshToken);
    if (!session || new Date() > session.expiresAt) {
      throw new AuthenticationError('Session expired or revoked');
    }

    const user = await authRepository.findById(payload.userId);
    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    // Refresh token rotation: delete old session and issue new one
    await authRepository.deleteSessionByToken(refreshToken);

    const tokens = await this.createSessionTokens(user.id, user.email, user.isSuperAdmin, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tokens,
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await authRepository.deleteSessionByToken(refreshToken);
    }
  }

  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Return dummy token or success to avoid email enumeration
      return { resetToken: 'mock-reset-token-for-unregistered' };
    }

    const resetToken = generateRefreshToken({ userId: user.id });
    return { resetToken };
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(input.token);
    } catch {
      throw new AuthenticationError('Invalid or expired password reset token');
    }

    const user = await authRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const newHash = await hashPassword(input.password);
    await authRepository.updatePassword(user.id, newHash);
    await authRepository.deleteSessionsByUserId(user.id);
  }

  async verifyEmail(token: string): Promise<void> {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AuthenticationError('Invalid or expired email verification token');
    }

    const user = await authRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await authRepository.markEmailVerified(user.id);
  }

  private async createSessionTokens(
    userId: string,
    email: string,
    isSuperAdmin: boolean,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const accessToken = generateAccessToken({
      userId,
      email,
      isSuperAdmin,
    });

    const refreshToken = generateRefreshToken({ userId });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await authRepository.createSession({
      userId,
      token: refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
