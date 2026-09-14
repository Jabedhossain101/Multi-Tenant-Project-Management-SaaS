import type { Request, Response, NextFunction } from 'express';
import { projectService } from './project.service.js';
import { sendSuccess } from '../../utils/response.js';
import type { ProjectStatus, ProjectPriority } from '@tasksaas/shared';

export class ProjectController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const {
        status,
        priority,
        search,
        isArchived,
        page = '1',
        limit = '20',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const result = await projectService.getProjects({
        organizationId: orgId,
        status: status as ProjectStatus,
        priority: priority as ProjectPriority,
        search: search as string,
        isArchived: isArchived === 'true',
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as 'name' | 'createdAt' | 'deadline' | 'priority',
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      sendSuccess(res, result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { projectId } = req.params;
      const project = await projectService.getProject(projectId!, orgId);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const project = await projectService.createProject(orgId, req.body);
      sendSuccess(res, project, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { projectId } = req.params;
      const updated = await projectService.updateProject(projectId!, orgId, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { projectId } = req.params;
      const updated = await projectService.archiveProject(projectId!, orgId);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { projectId } = req.params;
      const updated = await projectService.restoreProject(projectId!, orgId);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { projectId } = req.params;
      await projectService.deleteProject(projectId!, orgId);
      sendSuccess(res, { message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { projectId } = req.params;
      const { userId, role } = req.body;
      await projectService.addProjectMember(projectId!, orgId, userId, role);
      sendSuccess(res, { message: 'Project member added successfully' }, 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { projectId, userId } = req.params;
      await projectService.removeProjectMember(projectId!, orgId, userId!);
      sendSuccess(res, { message: 'Project member removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { projectId } = req.params;
      const analytics = await projectService.getProjectAnalytics(projectId!, orgId);
      sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
