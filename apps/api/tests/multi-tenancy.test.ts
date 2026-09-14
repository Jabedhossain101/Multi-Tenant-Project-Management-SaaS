/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { requireTenant } from '../src/middleware/tenant.middleware.js';
import { AuthenticationError, AuthorizationError } from '@tasksaas/shared';
import { prisma } from '@tasksaas/database';

vi.mock('@tasksaas/database', () => ({
  prisma: {
    organizationMember: {
      findFirst: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Multi-Tenancy Middleware & Isolation Tests', () => {
  const mockRes = {} as Response;

  it('rejects unauthenticated requests without user', async () => {
    const req = {} as Request;
    const next = vi.fn();

    await requireTenant(req, mockRes, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
  });

  it('resolves tenant context when user is a member of the requested organization', async () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
      headers: { 'x-organization-id': 'org-acme' },
      params: {},
      query: {},
    } as unknown as Request;

    vi.mocked(prisma.organizationMember.findFirst).mockResolvedValueOnce({
      id: 'mem-1',
      userId: 'user-1',
      organizationId: 'org-acme',
      role: 'ORG_ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: {
        id: 'org-acme',
        name: 'Acme Corp',
        slug: 'acme-corp',
        isSuspended: false,
      },
    } as any);

    const next = vi.fn();
    await requireTenant(req, mockRes, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.tenant).toBeDefined();
    expect(req.tenant?.organizationId).toBe('org-acme');
    expect(req.tenant?.role).toBe('ORG_ADMIN');
  });

  it('prevents IDOR: rejects access when user is NOT a member of requested organization', async () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
      headers: { 'x-organization-id': 'org-secret-target' },
      params: {},
      query: {},
    } as unknown as Request;

    vi.mocked(prisma.organizationMember.findFirst).mockResolvedValueOnce(null);

    const next = vi.fn();
    await requireTenant(req, mockRes, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it('blocks access if organization is suspended for non-super-admins', async () => {
    const req = {
      user: { id: 'user-1', isSuperAdmin: false },
      headers: { 'x-organization-id': 'org-suspended' },
      params: {},
      query: {},
    } as unknown as Request;

    vi.mocked(prisma.organizationMember.findFirst).mockResolvedValueOnce({
      id: 'mem-2',
      userId: 'user-1',
      organizationId: 'org-suspended',
      role: 'TEAM_MEMBER',
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: {
        id: 'org-suspended',
        name: 'Suspended Org',
        slug: 'suspended-org',
        isSuspended: true,
      },
    } as any);

    const next = vi.fn();
    await requireTenant(req, mockRes, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it('allows Super Admin to access any organization context', async () => {
    const req = {
      user: { id: 'super-user', isSuperAdmin: true },
      headers: { 'x-organization-id': 'org-other' },
      params: {},
      query: {},
    } as unknown as Request;

    vi.mocked(prisma.organizationMember.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.organization.findUnique).mockResolvedValueOnce({
      id: 'org-other',
      name: 'Other Org',
      slug: 'other-org',
      isSuspended: false,
    } as any);

    const next = vi.fn();
    await requireTenant(req, mockRes, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.tenant?.organizationId).toBe('org-other');
    expect(req.tenant?.role).toBe('SUPER_ADMIN');
  });
});
