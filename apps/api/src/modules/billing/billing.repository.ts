import { prisma, type Subscription, type Payment, type PlanTier, type SubscriptionStatus } from '@tasksaas/database';

export class BillingRepository {
  async findByOrganizationId(organizationId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { organizationId },
    });
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { stripeCustomerId },
    });
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });
  }

  async upsertSubscription(data: {
    organizationId: string;
    stripeCustomerId: string;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
    plan: PlanTier;
    status: SubscriptionStatus;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }): Promise<Subscription> {
    return prisma.subscription.upsert({
      where: { organizationId: data.organizationId },
      update: {
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId: data.stripePriceId,
        plan: data.plan,
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      },
      create: {
        organizationId: data.organizationId,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId: data.stripePriceId,
        plan: data.plan,
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      },
    });
  }

  async logPayment(data: {
    organizationId: string;
    stripePaymentId: string;
    amount: number;
    currency: string;
    status: string;
    receiptUrl?: string | null;
  }): Promise<Payment> {
    return prisma.payment.upsert({
      where: { stripePaymentId: data.stripePaymentId },
      update: {
        status: data.status,
        receiptUrl: data.receiptUrl,
      },
      create: data,
    });
  }

  async getPayments(organizationId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const billingRepository = new BillingRepository();
