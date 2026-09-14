import { prisma } from '@tasksaas/database';

export class AdminRepository {
  async getPlatformStats() {
    const [
      totalOrganizations,
      totalUsers,
      totalProjects,
      totalTasks,
      totalAiRequests,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.aIRequest.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalOrganizations,
      totalUsers,
      totalProjects,
      totalTasks,
      totalAiRequests,
      activeSubscriptions,
    };
  }

  async listOrganizations(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.findMany({
        skip,
        take: limit,
        include: {
          subscription: true,
          _count: {
            select: {
              members: true,
              projects: true,
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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

  async setOrganizationSuspension(organizationId: string, isSuspended: boolean) {
    return prisma.organization.update({
      where: { id: organizationId },
      data: { isSuspended },
    });
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          isEmailVerified: true,
          isSuperAdmin: true,
          createdAt: true,
          _count: {
            select: { memberships: true },
          },
        },
        orderBy: { createdAt: 'desc' },
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

  async listAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        include: {
          organization: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
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

  async logAudit(data: {
    userId: string;
    organizationId?: string | null;
    action: string;
    targetType: string;
    targetId?: string | null;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        metadata: data.metadata as unknown as undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}

export const adminRepository = new AdminRepository();
