import { prisma, type Project, type ProjectStatus, type ProjectPriority, type Prisma } from '@tasksaas/database';

export interface ProjectFilterParams {
  organizationId: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  search?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'deadline' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export class ProjectRepository {
  async findMany(params: ProjectFilterParams) {
    const {
      organizationId,
      status,
      priority,
      search,
      isArchived = false,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      organizationId,
      isArchived,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { key: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              files: true,
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

  async findByIdAndOrg(id: string, organizationId: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { tasks: true, files: true },
        },
      },
    });
  }

  async findByKeyAndOrg(key: string, organizationId: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: {
        organizationId_key: {
          organizationId,
          key,
        },
      },
    });
  }

  async countByOrg(organizationId: string): Promise<number> {
    return prisma.project.count({
      where: {
        organizationId,
        isArchived: false,
      },
    });
  }

  async create(data: {
    organizationId: string;
    name: string;
    key: string;
    description?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    startDate?: Date | null;
    deadline?: Date | null;
    managerId?: string | null;
  }): Promise<Project> {
    return prisma.project.create({
      data,
    });
  }

  async update(id: string, organizationId: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return prisma.project.update({
      where: {
        id,
        organizationId,
      },
      data,
    });
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await prisma.project.delete({
      where: {
        id,
        organizationId,
      },
    });
  }

  async addMember(projectId: string, userId: string, role?: string): Promise<void> {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: { projectId, userId },
      },
      update: { role },
      create: { projectId, userId, role },
    });
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }

  async getAnalytics(projectId: string, organizationId: string) {
    const [taskCounts, priorityCounts] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId, organizationId },
        _count: { id: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { projectId, organizationId },
        _count: { id: true },
      }),
    ]);

    return {
      taskCounts: Object.fromEntries(taskCounts.map((t) => [t.status, t._count.id])),
      priorityCounts: Object.fromEntries(priorityCounts.map((p) => [p.priority, p._count.id])),
    };
  }
}

export const projectRepository = new ProjectRepository();
