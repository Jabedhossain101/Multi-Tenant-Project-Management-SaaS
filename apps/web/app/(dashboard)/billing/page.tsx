'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { useAuthStore } from '../../../lib/store/auth.store.js';
import { useToast } from '../../../components/ui/use-toast.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card.js';
import { Button } from '../../../components/ui/button.js';
import { Badge } from '../../../components/ui/badge.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { formatDate } from '../../../lib/utils.js';
import { CreditCard, Check, ExternalLink, Loader2 } from 'lucide-react';
import type { PlanTier } from '@tasksaas/shared';

interface SubscriptionData {
  subscription: {
    plan: PlanTier;
    status: string;
    stripeCustomerId: string;
    currentPeriodEnd: string | null;
  };
  limits: {
    maxProjects: number;
    maxMembers: number;
    maxAiRequestsPerMonth: number;
    maxStorageMb: number;
  };
}

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  receiptUrl: string | null;
}

const PLANS: Array<{
  id: PlanTier;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  popular?: boolean;
}> = [
  {
    id: 'FREE',
    name: 'Starter Free',
    priceMonthly: 0,
    description: 'Essential project management for small agile teams',
    features: [
      'Up to 3 Active Projects',
      'Up to 5 Team Members',
      '50 Gemini AI Requests / month',
      '500 MB Encrypted Storage',
      'Real-Time Kanban Boards',
    ],
  },
  {
    id: 'PRO',
    name: 'Professional',
    priceMonthly: 29,
    description: 'Advanced AI automation and high-capacity workspaces',
    popular: true,
    features: [
      'Unlimited Projects',
      'Up to 25 Team Members',
      '500 Gemini AI Requests / month',
      '10 GB Encrypted S3 Storage',
      'Velocity Analytics & Insights',
      'Priority WebSocket Sync',
    ],
  },
  {
    id: 'BUSINESS',
    name: 'Enterprise Business',
    priceMonthly: 99,
    description: 'Maximum scale, custom quotas, and enterprise governance',
    features: [
      'Unlimited Projects & Epics',
      'Unlimited Team Members',
      '2,000 Gemini AI Requests / month',
      '100 GB Dedicated Storage',
      'Full Audit Logging & RBAC',
      'Dedicated 99.9% Uptime SLA',
    ],
  },
];

export function BillingContent() {
  const { activeOrgId } = useAuthStore();
  const { toast } = useToast();
  const [interval, setInterval] = React.useState<'month' | 'year'>('month');

  const { data: subData, isLoading: subLoading } = useQuery<SubscriptionData>({
    queryKey: ['subscription', activeOrgId],
    queryFn: () => api.get<SubscriptionData>('/billing/subscription'),
    enabled: !!activeOrgId,
  });

  const { data: payments = [] } = useQuery<PaymentHistoryItem[]>({
    queryKey: ['billing-history', activeOrgId],
    queryFn: () => api.get<PaymentHistoryItem[]>('/billing/history'),
    enabled: !!activeOrgId,
  });

  const checkoutMutation = useMutation({
    mutationFn: (plan: PlanTier) =>
      api.post<{ checkoutUrl: string }>('/billing/checkout', {
        plan,
        interval,
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      }),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: () => {
      toast({
        title: 'Checkout Error',
        description: 'Failed to initiate Stripe checkout session.',
        variant: 'destructive',
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: () =>
      api.post<{ portalUrl: string }>('/billing/portal', {
        returnUrl: window.location.href,
      }),
    onSuccess: (data) => {
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    },
    onError: () => {
      toast({
        title: 'Portal Error',
        description: 'Failed to open Stripe billing customer portal.',
        variant: 'destructive',
      });
    },
  });

  const currentPlan = subData?.subscription.plan || 'FREE';

  if (subLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Billing & Subscription Tier
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage workspace capacity, Stripe subscriptions, and payment receipts
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => portalMutation.mutate()}
          disabled={portalMutation.isPending}
        >
          {portalMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="mr-2 h-4 w-4" />
          )}
          Stripe Customer Portal
        </Button>
      </div>

      {/* Current Tier Overview Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-muted-foreground">Active Tier:</span>
                <Badge variant="default" className="text-sm font-bold uppercase">
                  {currentPlan}
                </Badge>
                <Badge variant="success" className="text-xs">
                  {subData?.subscription.status || 'ACTIVE'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {subData?.subscription.currentPeriodEnd
                  ? `Current billing period renews on ${formatDate(subData.subscription.currentPeriodEnd)}`
                  : 'Free tier with standard workspace quotas.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/80">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">AI Quota</span>
                <p className="text-sm font-bold text-primary">{subData?.limits.maxAiRequestsPerMonth} req/mo</p>
              </div>
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/80">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Team Seats</span>
                <p className="text-sm font-bold text-foreground">
                  {(subData?.limits.maxMembers ?? 5) >= 9999 ? 'Unlimited' : subData?.limits.maxMembers}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Storage</span>
                <p className="text-sm font-bold text-foreground">
                  {(subData?.limits.maxStorageMb || 500) >= 1000
                    ? `${(subData?.limits.maxStorageMb || 500) / 1024} GB`
                    : `${subData?.limits.maxStorageMb || 500} MB`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Selection Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Available Workspace Plans</h2>
          <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs">
            <button
              onClick={() => setInterval('month')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                interval === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('year')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                interval === 'year' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const price =
              interval === 'year'
                ? Math.round(plan.priceMonthly * 10)
                : plan.priceMonthly;

            return (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between transition-all relative ${
                  plan.popular ? 'border-primary shadow-xl ring-1 ring-primary/40' : 'border-border/80'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] font-bold uppercase shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-xs min-h-[32px]">
                      {plan.description}
                    </CardDescription>

                    <div className="pt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-foreground">${price}</span>
                      <span className="text-xs text-muted-foreground">/{interval}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-2 border-t border-border/50">
                    <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                      Included Capabilities:
                    </span>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>

                <CardFooter className="pt-4 border-t border-border/50">
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : plan.popular ? 'gradient' : 'default'}
                    disabled={isCurrent || checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate(plan.id)}
                  >
                    {isCurrent ? (
                      'Current Active Tier'
                    ) : checkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Payment Receipts & History</CardTitle>
          <CardDescription className="text-xs">
            Past invoices processed securely through Stripe Payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No payment transactions recorded for this workspace.
            </div>
          ) : (
            <div className="divide-y divide-border/60 text-xs">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-semibold text-foreground">
                      ${(p.amount / 100).toFixed(2)} {p.currency.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground ml-2">• {formatDate(p.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-[10px]">
                      {p.status}
                    </Badge>
                    {p.receiptUrl && (
                      <a
                        href={p.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Receipt <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <BillingContent />
    </React.Suspense>
  );
}
