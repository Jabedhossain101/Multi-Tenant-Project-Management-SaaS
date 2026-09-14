import crypto from 'crypto';
import {
  NotFoundError,
  PlanLimitError,
  PLAN_LIMITS,
  type PlanTier,
  type GetPresignedUploadUrlInput,
  type ConfirmFileUploadInput,
} from '@tasksaas/shared';
import { fileRepository } from './file.repository.js';
import { organizationRepository } from '../organizations/organization.repository.js';
import { createPresignedUploadUrl, createPresignedDownloadUrl, deleteS3Object } from '../../utils/s3.js';

export class FileService {
  async getUploadUrl(organizationId: string, input: GetPresignedUploadUrlInput) {
    // 1. Enforce Plan Storage Quota
    const org = await organizationRepository.findById(organizationId);
    const plan = ((org as unknown as { subscription?: { plan: PlanTier } }).subscription?.plan || 'FREE') as PlanTier;
    const currentStorageBytes = await fileRepository.getTotalStorageBytes(organizationId);

    const limits = PLAN_LIMITS[plan];
    if (currentStorageBytes + input.fileSize > limits.maxStorageBytes) {
      throw new PlanLimitError(
        `Storage quota exceeded (${Math.round(limits.maxStorageBytes / (1024 * 1024))} MB limit). Upgrade plan to upload more files.`,
      );
    }

    const uniqueId = crypto.randomUUID();
    const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `orgs/${organizationId}/${uniqueId}-${sanitizedFilename}`;

    const { uploadUrl, key } = await createPresignedUploadUrl(s3Key, input.mimeType);

    return {
      uploadUrl,
      key,
      maxSizeBytes: 50 * 1024 * 1024,
    };
  }

  async confirmUpload(organizationId: string, userId: string, input: ConfirmFileUploadInput) {
    const file = await fileRepository.create({
      organizationId,
      projectId: input.projectId,
      filename: input.filename,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      s3Key: input.key,
      uploadedById: userId,
    });

    if (input.taskId) {
      await fileRepository.attachToTask(input.taskId, file.id);
    }

    return file;
  }

  async getDownloadUrl(fileId: string, organizationId: string) {
    const file = await fileRepository.findByIdAndOrg(fileId, organizationId);
    if (!file) {
      throw new NotFoundError('File', fileId);
    }

    const downloadUrl = await createPresignedDownloadUrl(file.s3Key);
    return {
      downloadUrl,
      filename: file.filename,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
    };
  }

  async deleteFile(fileId: string, organizationId: string) {
    const file = await fileRepository.findByIdAndOrg(fileId, organizationId);
    if (!file) {
      throw new NotFoundError('File', fileId);
    }

    await deleteS3Object(file.s3Key);
    await fileRepository.delete(fileId, organizationId);
  }
}

export const fileService = new FileService();
