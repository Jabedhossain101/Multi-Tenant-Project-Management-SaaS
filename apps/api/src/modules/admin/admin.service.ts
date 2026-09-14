import { adminRepository } from './admin.repository.js';
import { prisma } from '@tasksaas/database';

export class AdminService {
  async getDashboardStats() {
    return adminRepository.getPlatformStats();
  }

  async getOrganizations(page = 1, limit = 20) {
    return adminRepository.listOrganizations(page, limit);
  }

  async suspendOrganization(organizationId: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const org = await adminRepository.setOrganizationSuspension(organizationId, true);

    await adminRepository.logAudit({
      userId: adminUserId,
      organizationId,
      action: 'ORGANIZATION_SUSPENDED',
      targetType: 'ORGANIZATION',
      targetId: organizationId,
      ipAddress,
      userAgent,
    });

    return org;
  }

  async reactivateOrganization(organizationId: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const org = await adminRepository.setOrganizationSuspension(organizationId, false);

    await adminRepository.logAudit({
      userId: adminUserId,
      organizationId,
      action: 'ORGANIZATION_REACTIVATED',
      targetType: 'ORGANIZATION',
      targetId: organizationId,
      ipAddress,
      userAgent,
    });

    return org;
  }

  async getUsers(page = 1, limit = 20) {
    return adminRepository.listUsers(page, limit);
  }

  async getAuditLogs(page = 1, limit = 50) {
    return adminRepository.listAuditLogs(page, limit);
  }

  async getAIUsage(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.aIRequest.count(),
      prisma.aIRequest.findMany({
        skip,
        take: limit,
        include: {
          organization: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
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
    };
  }
}

export const adminService = new AdminService();
