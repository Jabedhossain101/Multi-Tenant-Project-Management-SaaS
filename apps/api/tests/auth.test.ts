import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { generateAccessToken, verifyAccessToken } from '../src/utils/jwt.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';

describe('Authentication & JWT System', () => {
  it('generates and verifies valid JWT access token', () => {
    const payload = {
      userId: 'user-12345',
      email: 'test@tasksaas.local',
      isSuperAdmin: false,
      organizationId: 'org-12345',
      role: 'ORG_ADMIN' as const,
    };

    const token = generateAccessToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.organizationId).toBe(payload.organizationId);
  });

  it('rejects unauthenticated requests to protected route /api/v1/auth/me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects registration with invalid email or weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'invalid-email',
      password: 'weak',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('handles password reset request safely', async () => {
    vi.spyOn(authRepository, 'findByEmail').mockResolvedValueOnce(null);

    const res = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'nonexistent@tasksaas.local',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('resetToken');
  });
});
