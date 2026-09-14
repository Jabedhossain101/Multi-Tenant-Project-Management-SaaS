import { prisma, type AIRequest, type AIFeature, type AIRequestStatus } from '@tasksaas/database';

export class AIRepository {
  async logRequest(data: {
    organizationId: string;
    userId: string;
    feature: AIFeature;
    model: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    status: AIRequestStatus;
    errorMessage?: string | null;
  }): Promise<AIRequest> {
    return prisma.aIRequest.create({
      data,
    });
  }

  async countRequestsThisMonth(organizationId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return prisma.aIRequest.count({
      where: {
        organizationId,
        createdAt: {
          gte: startOfMonth,
        },
        status: 'SUCCESS',
      },
    });
  }

  async getUsageStats(organizationId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthlyCount, featureBreakdown, recentRequests] = await Promise.all([
      prisma.aIRequest.count({
        where: {
          organizationId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.aIRequest.groupBy({
        by: ['feature'],
        where: { organizationId, createdAt: { gte: startOfMonth } },
        _count: { id: true },
      }),
      prisma.aIRequest.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      currentMonthRequests: monthlyCount,
      featureBreakdown: Object.fromEntries(featureBreakdown.map((f) => [f.feature, f._count.id])),
      recentRequests,
    };
  }
}

export const aiRepository = new AIRepository();
