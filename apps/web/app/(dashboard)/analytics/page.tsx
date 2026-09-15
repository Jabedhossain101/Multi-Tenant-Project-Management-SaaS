'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { useAuthStore } from '../../../lib/store/auth.store.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';
import { StatCard } from '../../../components/dashboard/stat-card.js';
import { Button } from '../../../components/ui/button.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { BarChart3, TrendingUp, CheckSquare, Users, Sparkles, Activity } from 'lucide-react';

interface TaskAnalyticsItem {
  id: string;
  status: string;
  priority: string;
  dueDate: string | null;
}

export default function AnalyticsPage() {
  const { activeOrgId } = useAuthStore();
  const [timeframe, setTimeframe] = React.useState<'last_7_days' | 'last_30_days'>('last_7_days');

  const { data: tasksData, isLoading: tasksLoading } = useQuery<{ items: TaskAnalyticsItem[] }>({
    queryKey: ['analytics-tasks', activeOrgId],
    queryFn: () => api.get<{ items: TaskAnalyticsItem[] }>('/tasks?limit=100'),
    enabled: !!activeOrgId,
  });

  const { data: productivityReport, isLoading: reportLoading } = useQuery<{
    timeframe: string;
    metrics: {
      tasksCompleted: number;
      tasksCreated: number;
      activeTeamMembers: number;
      completionRate: number;
    };
    insights: string[];
    focusAreas: string[];
  }>({
    queryKey: ['productivity-report', activeOrgId, timeframe],
    queryFn: () =>
      api.post('/ai/productivity-report', {
        timeframe,
      }),
    enabled: !!activeOrgId,
  });

  const tasks = tasksData?.items || [];
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewCount = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const urgentCount = tasks.filter((t) => t.priority === 'URGENT').length;
  const highCount = tasks.filter((t) => t.priority === 'HIGH').length;
  const mediumCount = tasks.filter((t) => t.priority === 'MEDIUM').length;
  const lowCount = tasks.filter((t) => t.priority === 'LOW').length;

  const isLoading = tasksLoading || reportLoading;

  return (
    <div className="space-y-8">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            Performance & Velocity Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time throughput metrics, status distribution, and AI-driven workload trends
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-border bg-card p-1">
          <Button
            variant={timeframe === 'last_7_days' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs h-7"
            onClick={() => setTimeframe('last_7_days')}
          >
            Last 7 Days
          </Button>
          <Button
            variant={timeframe === 'last_30_days' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs h-7"
            onClick={() => setTimeframe('last_30_days')}
          >
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
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
            title="Tasks Completed"
            value={productivityReport?.metrics.tasksCompleted ?? completedCount}
            change="Across active sprints"
            trend="up"
            icon={CheckSquare}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Velocity Rate"
            value={`${productivityReport?.metrics.completionRate ?? 0}%`}
            change="Completion efficiency"
            trend="up"
            icon={TrendingUp}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Active Contributors"
            value={productivityReport?.metrics.activeTeamMembers ?? 1}
            change="Team members"
            trend="neutral"
            icon={Users}
            iconColor="text-purple-400"
          />
          <StatCard
            title="In-Flight Tasks"
            value={inProgressCount + inReviewCount}
            change="Active execution"
            trend="neutral"
            icon={Activity}
            iconColor="text-amber-400"
          />
        </div>
      )}

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Task Status Distribution</CardTitle>
            <CardDescription className="text-xs">
              Current lifecycle distribution across all projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>To Do</span>
                <span className="text-muted-foreground">{todoCount}</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${tasks.length ? (todoCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>In Progress</span>
                <span className="text-muted-foreground">{inProgressCount}</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${tasks.length ? (inProgressCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>In Review</span>
                <span className="text-muted-foreground">{inReviewCount}</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${tasks.length ? (inReviewCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Completed</span>
                <span className="text-muted-foreground">{completedCount}</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Task Priority Distribution</CardTitle>
            <CardDescription className="text-xs">
              Criticality and urgency allocation across the workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-rose-400">Urgent</span>
                <span className="text-muted-foreground">{urgentCount}</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${tasks.length ? (urgentCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-400">High</span>
                <span className="text-muted-foreground">{highCount}</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${tasks.length ? (highCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-blue-400">Medium</span>
                <span className="text-muted-foreground">{mediumCount}</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${tasks.length ? (mediumCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Low</span>
                <span className="text-muted-foreground">{lowCount}</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-500 h-full rounded-full"
                  style={{ width: `${tasks.length ? (lowCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Velocity Insights */}
      {productivityReport && (
        <Card className="border-blue-500/30 bg-gradient-to-br from-card to-blue-950/20">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Gemini Productivity Synthesis
            </CardTitle>
            <CardDescription className="text-xs">
              AI analysis of velocity and recommended team focus areas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-2">
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Performance Highlights
              </span>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {productivityReport.insights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-2">
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" /> Recommended Focus Areas
              </span>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {productivityReport.focusAreas.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
