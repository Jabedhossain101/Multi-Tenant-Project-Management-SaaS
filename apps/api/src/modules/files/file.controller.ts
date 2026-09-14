import type { Request, Response, NextFunction } from 'express';
import { fileService } from './file.service.js';
import { sendSuccess } from '../../utils/response.js';

export class FileController {
  async getUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const result = await fileService.getUploadUrl(orgId, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const file = await fileService.confirmUpload(orgId, req.user!.id, req.body);
      sendSuccess(res, file, 201);
    } catch (error) {
      next(error);
    }
  }

  async getDownloadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { fileId } = req.params;
      const result = await fileService.getDownloadUrl(fileId!, orgId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { fileId } = req.params;
      await fileService.deleteFile(fileId!, orgId);
      sendSuccess(res, { message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const fileController = new FileController();
