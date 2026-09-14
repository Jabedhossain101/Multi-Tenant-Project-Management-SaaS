import Stripe from 'stripe';
import {
  NotFoundError,
  ValidationError,
  PLAN_LIMITS,
  type CreateCheckoutSessionInput,
  type CreatePortalSessionInput,
  type PlanTier,
  type SubscriptionStatus,
} from '@tasksaas/shared';
import { env } from '../../config/env.js';
import { billingRepository } from './billing.repository.js';
import { organizationRepository } from '../organizations/organization.repository.js';
import { logger } from '../../utils/logger.js';

export class BillingService {
  private stripe: Stripe | null = null;
  private processedEvents = new Set<string>();

  constructor() {
    if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.trim() !== '') {
      this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
      });
    }
  }

  async getSubscriptionDetails(organizationId: string) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization', organizationId);
    }

    let subscription = await billingRepository.findByOrganizationId(organizationId);
    if (!subscription) {
      subscription = await billingRepository.upsertSubscription({
        organizationId,
        stripeCustomerId: `cus_${organizationId.slice(0, 10)}`,
        plan: 'FREE',
        status: 'ACTIVE',
      });
    }

    const limits = PLAN_LIMITS[subscription.plan as PlanTier];

    return {
      subscription,
      limits,
    };
  }

  async createCheckoutSession(organizationId: string, input: CreateCheckoutSessionInput) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization', organizationId);
    }

    let subscription = await billingRepository.findByOrganizationId(organizationId);
    let customerId = subscription?.stripeCustomerId;

    if (this.stripe) {
      if (!customerId || customerId.startsWith('cus_trial_') || customerId.startsWith('cus_')) {
        const customer = await this.stripe.customers.create({
          name: org.name,
          metadata: { organizationId },
        });
        customerId = customer.id;
      }

      const priceId = this.resolvePriceId(input.plan, input.interval);

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${input.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: input.cancelUrl,
        metadata: {
          organizationId,
          plan: input.plan,
        },
      });

      return { checkoutUrl: session.url };
    }

    // Mock/development fallback if Stripe credentials are not supplied
    return {
      checkoutUrl: `${input.successUrl}?mock_checkout=true&plan=${input.plan}`,
    };
  }

  async createCustomerPortalSession(organizationId: string, input: CreatePortalSessionInput) {
    const subscription = await billingRepository.findByOrganizationId(organizationId);
    if (!subscription || !subscription.stripeCustomerId) {
      throw new ValidationError('No active Stripe customer found for organization');
    }

    if (this.stripe && !subscription.stripeCustomerId.startsWith('cus_trial_')) {
      const portal = await this.stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: input.returnUrl,
      });

      return { portalUrl: portal.url };
    }

    return {
      portalUrl: `${input.returnUrl}?portal_mock=true`,
    };
  }

  async handleWebhook(rawBody: Buffer | string, signature: string): Promise<{ received: boolean }> {
    if (!this.stripe || !env.STRIPE_WEBHOOK_SECRET) {
      logger.warn('Stripe webhook received but stripe secret is not configured');
      return { received: true };
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.error('Stripe webhook signature verification failed', err);
      throw new ValidationError('Invalid Stripe webhook signature');
    }

    // Idempotency check
    if (this.processedEvents.has(event.id)) {
      logger.info(`Stripe webhook event '${event.id}' already processed, skipping`);
      return { received: true };
    }
    this.processedEvents.add(event.id);

    logger.info(`Processing Stripe webhook: ${event.type} [${event.id}]`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.organizationId;
        const plan = (session.metadata?.plan || 'PRO') as PlanTier;

        if (orgId && session.customer) {
          await billingRepository.upsertSubscription({
            organizationId: orgId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: (session.subscription as string) || null,
            plan,
            status: 'ACTIVE',
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionRecord = await billingRepository.findByStripeCustomerId(sub.customer as string);

        if (subscriptionRecord) {
          const status = this.mapSubscriptionStatus(sub.status);
          const plan = this.mapPriceToPlan(sub.items.data[0]?.price.id);

          await billingRepository.upsertSubscription({
            organizationId: subscriptionRecord.organizationId,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            plan: plan || subscriptionRecord.plan,
            status,
            currentPeriodStart: (sub as unknown as { current_period_start?: number }).current_period_start
              ? new Date((sub as unknown as { current_period_start: number }).current_period_start * 1000)
              : null,
            currentPeriodEnd: (sub as unknown as { current_period_end?: number }).current_period_end
              ? new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000)
              : null,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionRecord = await billingRepository.findByStripeSubscriptionId(sub.id);

        if (subscriptionRecord) {
          await billingRepository.upsertSubscription({
            organizationId: subscriptionRecord.organizationId,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: null,
            plan: 'FREE',
            status: 'CANCELED',
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionRecord = await billingRepository.findByStripeCustomerId(invoice.customer as string);

        if (subscriptionRecord && invoice.payment_intent) {
          await billingRepository.logPayment({
            organizationId: subscriptionRecord.organizationId,
            stripePaymentId: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'SUCCEEDED',
            receiptUrl: invoice.hosted_invoice_url || null,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionRecord = await billingRepository.findByStripeCustomerId(invoice.customer as string);

        if (subscriptionRecord) {
          await billingRepository.upsertSubscription({
            organizationId: subscriptionRecord.organizationId,
            stripeCustomerId: invoice.customer as string,
            plan: subscriptionRecord.plan,
            status: 'PAST_DUE',
          });
        }
        break;
      }

      default:
        logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  async getBillingHistory(organizationId: string) {
    return billingRepository.getPayments(organizationId);
  }

  private resolvePriceId(plan: PlanTier, interval: 'month' | 'year'): string {
    if (plan === 'PRO') {
      return interval === 'year' ? env.STRIPE_PRICE_PRO_YEARLY : env.STRIPE_PRICE_PRO_MONTHLY;
    }
    return interval === 'year' ? env.STRIPE_PRICE_BUSINESS_YEARLY : env.STRIPE_PRICE_BUSINESS_MONTHLY;
  }

  private mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'trialing':
        return 'TRIALING';
      case 'past_due':
        return 'PAST_DUE';
      case 'canceled':
        return 'CANCELED';
      case 'unpaid':
        return 'UNPAID';
      case 'incomplete':
      case 'incomplete_expired':
      case 'paused':
      default:
        return 'INCOMPLETE';
    }
  }

  private mapPriceToPlan(priceId?: string): PlanTier | null {
    if (!priceId) return null;
    if (priceId === env.STRIPE_PRICE_PRO_MONTHLY || priceId === env.STRIPE_PRICE_PRO_YEARLY) {
      return 'PRO';
    }
    if (priceId === env.STRIPE_PRICE_BUSINESS_MONTHLY || priceId === env.STRIPE_PRICE_BUSINESS_YEARLY) {
      return 'BUSINESS';
    }
    return null;
  }
}

export const billingService = new BillingService();
