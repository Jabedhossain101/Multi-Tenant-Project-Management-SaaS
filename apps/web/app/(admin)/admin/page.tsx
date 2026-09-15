'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';
import { StatCard } from '../../../components/dashboard/stat-card.js';
import { Button } from '../../../components/ui/button.js';
import { Badge } from '../../../components/ui/badge.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckSquare,
  Sparkles,
  Activity,
} from 'lucide-react';

interface AdminStatsResponse {
  totalUsers: number;
  totalOrganizations: number;
  totalProjects: number;
  totalTasks: number;
  activeSubscriptions: number;
}

interface AIAdminUsage {
  totalRequests: number;
  totalTokens: number;
  recentRequests: unknown[];
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStatsResponse>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<AdminStatsResponse>('/admin/stats'),
  });

  const { data: aiUsage, isLoading: aiLoading } = useQuery<AIAdminUsage>({
    queryKey: ['admin-ai-usage'],
    queryFn: () => api.get<AIAdminUsage>('/admin/ai-usage'),
  });

  const isLoading = statsLoading || aiLoading;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase text-rose-400">
              Platform Master Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Super Administrator Control Plane
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Global multi-tenant governance, organization suspensions, and token consumption metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/organizations">
            <Button variant="outline" size="sm">
              <Building2 className="mr-2 h-4 w-4" /> Organizations
            </Button>
          </Link>
          <Link href="/admin/audit-logs">
            <Button variant="outline" size="sm">
              <Activity className="mr-2 h-4 w-4" /> Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tenants"
            value={stats?.totalOrganizations ?? 0}
            change="Multi-tenant orgs"
            trend="up"
            icon={Building2}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Platform Users"
            value={stats?.totalUsers ?? 0}
            change="Registered accounts"
            trend="up"
            icon={Users}
            iconColor="text-purple-400"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions ?? 0}
            change="Stripe Active"
            trend="up"
            icon={Activity}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Total Tasks"
            value={stats?.totalTasks ?? 0}
            change="Across all projects"
            trend="neutral"
            icon={CheckSquare}
            iconColor="text-amber-400"
          />
        </div>
      )}

      {/* AI Token Consumption Card */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-card to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-base font-bold">Platform AI Token Consumption</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-purple-300 border-purple-500/30">
              Gemini 2.5 Flash
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Aggregated tokens and inference requests across all tenant organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background/60 border border-border/80">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">Total Requests</span>
              <p className="text-3xl font-extrabold text-foreground mt-1">
                {aiUsage?.totalRequests ?? 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border/80">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">Total Tokens Synthesized</span>
              <p className="text-3xl font-extrabold text-purple-400 mt-1">
                {(aiUsage?.totalTokens ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
