import type { Request, Response, NextFunction } from 'express';
import { AuthorizationError, ROLE_PERMISSIONS, type Permission, type Role } from '@tasksaas/shared';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (req.user?.isSuperAdmin) {
        return next();
      }

      if (!req.tenant) {
        throw new AuthorizationError('Tenant context required for role verification');
      }

      const userRole = req.tenant.role;
      if (!allowedRoles.includes(userRole)) {
        throw new AuthorizationError(
          `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${userRole}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (req.user?.isSuperAdmin) {
        return next();
      }

      if (!req.tenant) {
        throw new AuthorizationError('Tenant context required for permission check');
      }

      const userRole = req.tenant.role;
      const rolePermissions = (ROLE_PERMISSIONS[userRole] as readonly Permission[]) || [];

      const hasAllPermissions = requiredPermissions.every((perm) =>
        rolePermissions.includes(perm),
      );

      if (!hasAllPermissions) {
        throw new AuthorizationError(
          `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  try {
    if (!req.user || !req.user.isSuperAdmin) {
      throw new AuthorizationError('Access denied: Requires Platform Super Administrator privileges');
    }
    next();
  } catch (error) {
    next(error);
  }
}
