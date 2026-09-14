import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { requireRole, requirePermission, requireSuperAdmin } from '../src/middleware/rbac.middleware.js';
import { Role, Permission, AuthorizationError } from '@tasksaas/shared';

describe('RBAC Middleware & Authorization Tests', () => {
  const mockRes = {} as Response;

  it('allows Super Admin to bypass tenant role checks in requireRole', () => {
    const req = {
      user: { id: 'super-1', isSuperAdmin: true },
    } as unknown as Request;

    const next = vi.fn();
    requireRole(Role.ORG_ADMIN)(req, mockRes, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects user without tenant context in requireRole', () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
    } as unknown as Request;

    const next = vi.fn();
    requireRole(Role.ORG_ADMIN)(req, mockRes, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it('allows user with matching role in requireRole', () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
      tenant: {
        organizationId: 'org-1',
        role: Role.ORG_ADMIN,
        organizationName: 'Acme',
        organizationSlug: 'acme',
        isSuspended: false,
      },
    } as unknown as Request;

    const next = vi.fn();
    requireRole(Role.ORG_ADMIN, Role.PROJECT_MANAGER)(req, mockRes, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects user with insufficient role in requireRole', () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
      tenant: {
        organizationId: 'org-1',
        role: Role.TEAM_MEMBER,
        organizationName: 'Acme',
        organizationSlug: 'acme',
        isSuspended: false,
      },
    } as unknown as Request;

    const next = vi.fn();
    requireRole(Role.ORG_ADMIN, Role.PROJECT_MANAGER)(req, mockRes, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it('allows user with required permission in requirePermission', () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
      tenant: {
        organizationId: 'org-1',
        role: Role.ORG_ADMIN,
        organizationName: 'Acme',
        organizationSlug: 'acme',
        isSuspended: false,
      },
    } as unknown as Request;

    const next = vi.fn();
    requirePermission(Permission.ORG_INVITE_MEMBER)(req, mockRes, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects team member attempting task deletion when role lacks permission', () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
      tenant: {
        organizationId: 'org-1',
        role: Role.TEAM_MEMBER,
        organizationName: 'Acme',
        organizationSlug: 'acme',
        isSuspended: false,
      },
    } as unknown as Request;

    const next = vi.fn();
    requirePermission(Permission.TASK_DELETE)(req, mockRes, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it('allows super admin in requireSuperAdmin', () => {
    const req = {
      user: { id: 'super-1', isSuperAdmin: true },
    } as unknown as Request;

    const next = vi.fn();
    requireSuperAdmin(req, mockRes, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects non-super admin in requireSuperAdmin', () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
    } as unknown as Request;

    const next = vi.fn();
    requireSuperAdmin(req, mockRes, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });
});
