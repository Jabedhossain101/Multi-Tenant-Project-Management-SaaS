import { prisma, type Comment } from '@tasksaas/database';

export class CommentRepository {
  async findByTaskId(taskId: string, organizationId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: {
        taskId,
        organizationId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByIdAndOrg(id: string, organizationId: string): Promise<Comment | null> {
    return prisma.comment.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async create(data: {
    organizationId: string;
    taskId: string;
    userId: string;
    content: string;
    mentions?: string[];
  }): Promise<Comment> {
    return prisma.comment.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async update(id: string, organizationId: string, content: string, mentions?: string[]): Promise<Comment> {
    return prisma.comment.update({
      where: {
        id,
        organizationId,
      },
      data: {
        content,
        ...(mentions && { mentions }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await prisma.comment.delete({
      where: {
        id,
        organizationId,
      },
    });
  }
}

export const commentRepository = new CommentRepository();
