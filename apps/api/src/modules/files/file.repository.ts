import { prisma, type File, type Attachment } from '@tasksaas/database';

export class FileRepository {
  async findByIdAndOrg(id: string, organizationId: string): Promise<File | null> {
    return prisma.file.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        attachments: true,
      },
    });
  }

  async create(data: {
    organizationId: string;
    projectId?: string | null;
    filename: string;
    fileSize: number;
    mimeType: string;
    s3Key: string;
    uploadedById: string;
  }): Promise<File> {
    return prisma.file.create({
      data,
    });
  }

  async attachToTask(taskId: string, fileId: string): Promise<Attachment> {
    return prisma.attachment.upsert({
      where: {
        taskId_fileId: { taskId, fileId },
      },
      update: {},
      create: { taskId, fileId },
    });
  }

  async getTotalStorageBytes(organizationId: string): Promise<number> {
    const aggregate = await prisma.file.aggregate({
      where: { organizationId },
      _sum: { fileSize: true },
    });
    return aggregate._sum.fileSize || 0;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await prisma.file.delete({
      where: {
        id,
        organizationId,
      },
    });
  }
}

export const fileRepository = new FileRepository();
