import type { Request, Response, NextFunction } from 'express';
import { commentService } from './comment.service.js';
import { sendSuccess } from '../../utils/response.js';
import { Role } from '@tasksaas/shared';

export class CommentController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { taskId } = req.query;
      const comments = await commentService.getComments(taskId as string, orgId);
      sendSuccess(res, comments);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const comment = await commentService.createComment(orgId, req.user!.id, req.body);
      sendSuccess(res, comment, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { commentId } = req.params;
      const updated = await commentService.updateComment(commentId!, orgId, req.user!.id, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { commentId } = req.params;
      const isOrgAdmin = req.tenant!.role === Role.ORG_ADMIN || !!req.user!.isSuperAdmin;
      await commentService.deleteComment(commentId!, orgId, req.user!.id, isOrgAdmin);
      sendSuccess(res, { message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
