import type { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AdminController {
  async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async listOrganizations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20' } = req.query;
      const result = await adminService.getOrganizations(
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );
      sendSuccess(res, result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async suspendOrg(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId } = req.params;
      const org = await adminService.suspendOrganization(
        orgId!,
        req.user!.id,
        req.ip,
        req.headers['user-agent'],
      );
      sendSuccess(res, org);
    } catch (error) {
      next(error);
    }
  }

  async reactivateOrg(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId } = req.params;
      const org = await adminService.reactivateOrganization(
        orgId!,
        req.user!.id,
        req.ip,
        req.headers['user-agent'],
      );
      sendSuccess(res, org);
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20' } = req.query;
      const result = await adminService.getUsers(
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );
      sendSuccess(res, result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async auditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '50' } = req.query;
      const result = await adminService.getAuditLogs(
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );
      sendSuccess(res, result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async aiUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '50' } = req.query;
      const result = await adminService.getAIUsage(
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );
      sendSuccess(res, result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
