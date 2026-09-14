import type { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AIController {
  async taskAssistant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const result = await aiService.generateTaskAssistant(orgId, req.user!.id, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async projectSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const result = await aiService.generateProjectSummary(orgId, req.user!.id, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async productivityReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const result = await aiService.generateProductivityReport(orgId, req.user!.id, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const usage = await aiService.getUsage(orgId);
      sendSuccess(res, usage);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
