import { prisma, type Task, type Subtask, type TaskStatus, type TaskPriority, type Prisma } from '@tasksaas/database';

export interface TaskFilterParams {
  organizationId: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'order' | 'createdAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export class TaskRepository {
  async findMany(params: TaskFilterParams) {
    const {
      organizationId,
      projectId,
      status,
      priority,
      assigneeId,
      search,
      page = 1,
      limit = 50,
      sortBy = 'order',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      organizationId,
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sortBy]: sortOrder }, { createdAt: 'desc' }],
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          creator: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          subtasks: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
              subtasks: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async findByIdAndOrg(id: string, organizationId: string): Promise<Task | null> {
    return prisma.task.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        subtasks: {
          orderBy: { order: 'asc' },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          include: { file: true },
        },
      },
    });
  }

  async create(data: {
    organizationId: string;
    projectId: string;
    creatorId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
    assigneeId?: string | null;
    order?: number;
    labels?: string[];
  }): Promise<Task> {
    return prisma.task.create({
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async update(id: string, organizationId: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return prisma.task.update({
      where: {
        id,
        organizationId,
      },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        subtasks: true,
      },
    });
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await prisma.task.delete({
      where: {
        id,
        organizationId,
      },
    });
  }

  async reorder(taskId: string, organizationId: string, status: TaskStatus, newOrder: number): Promise<Task> {
    return prisma.task.update({
      where: {
        id: taskId,
        organizationId,
      },
      data: {
        status,
        order: newOrder,
      },
    });
  }

  // Subtask operations
  async createSubtask(data: {
    organizationId: string;
    taskId: string;
    title: string;
    assigneeId?: string | null;
    order?: number;
  }): Promise<Subtask> {
    return prisma.subtask.create({
      data,
    });
  }

  async updateSubtask(
    subtaskId: string,
    organizationId: string,
    data: { title?: string; isCompleted?: boolean; assigneeId?: string | null; order?: number },
  ): Promise<Subtask> {
    return prisma.subtask.update({
      where: {
        id: subtaskId,
        organizationId,
      },
      data,
    });
  }

  async deleteSubtask(subtaskId: string, organizationId: string): Promise<void> {
    await prisma.subtask.delete({
      where: {
        id: subtaskId,
        organizationId,
      },
    });
  }
}

export const taskRepository = new TaskRepository();
