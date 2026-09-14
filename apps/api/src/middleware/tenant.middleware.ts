/* eslint-disable @typescript-eslint/no-namespace */
import type { Request, Response, NextFunction } from 'express';
import { AuthorizationError, AuthenticationError, NotFoundError, Role } from '@tasksaas/shared';
import { prisma } from '@tasksaas/database';

export interface TenantContext {
  organizationId: string;
  role: Role;
  organizationName: string;
  organizationSlug: string;
  isSuspended: boolean;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

export async function requireTenant(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AuthenticationError('User must be authenticated before resolving tenant context');
    }

    // 1. Resolve requested organizationId from header, route params, or query
    const requestedOrgId =
      (req.headers['x-organization-id'] as string) ||
      (req.params.orgId as string) ||
      (req.params.organizationId as string) ||
      (req.query.organizationId as string);

    let member;

    if (requestedOrgId) {
      // Find membership specifically for the requested organization
      member = await prisma.organizationMember.findFirst({
        where: {
          organizationId: requestedOrgId,
          userId: req.user.id,
        },
        include: {
          organization: true,
        },
      });

      // If user is super admin and requested org exists, grant super admin tenant context
      if (!member && req.user.isSuperAdmin) {
        const org = await prisma.organization.findUnique({
          where: { id: requestedOrgId },
        });

        if (org) {
          req.tenant = {
            organizationId: org.id,
            role: Role.SUPER_ADMIN,
            organizationName: org.name,
            organizationSlug: org.slug,
            isSuspended: org.isSuspended,
          };
          return next();
        }
      }

      if (!member) {
        throw new AuthorizationError(
          'Access denied: You are not a member of the requested organization',
        );
      }
    } else {
      // Find user's first/primary organization membership
      member = await prisma.organizationMember.findFirst({
        where: { userId: req.user.id },
        include: { organization: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!member) {
        throw new NotFoundError(
          'No active organization found for user. Please create or join an organization.',
        );
      }
    }

    if (member.organization.isSuspended && !req.user.isSuperAdmin) {
      throw new AuthorizationError(
        'Organization account is currently suspended. Please contact support.',
      );
    }

    req.tenant = {
      organizationId: member.organizationId,
      role: member.role as Role,
      organizationName: member.organization.name,
      organizationSlug: member.organization.slug,
      isSuspended: member.organization.isSuspended,
    };

    next();
  } catch (error) {
    next(error);
  }
}
