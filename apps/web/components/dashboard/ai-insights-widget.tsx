'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api-client.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { Sparkles, Loader2, RefreshCw, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

interface AIUsageData {
  plan: string;
  maxMonthlyQuota: number;
  usedThisMonth: number;
  remainingQuota: number;
}

interface ProductivityReport {
  timeframe: string;
  metrics: {
    tasksCompleted: number;
    tasksCreated: number;
    activeTeamMembers: number;
    completionRate: number;
  };
  insights: string[];
  focusAreas: string[];
}

export function AIInsightsWidget() {
  const [report, setReport] = React.useState<ProductivityReport | null>(null);

  const { data: usage, refetch: refetchUsage } = useQuery<AIUsageData>({
    queryKey: ['ai-usage'],
    queryFn: () => api.get<AIUsageData>('/ai/usage'),
  });

  const generateReportMutation = useMutation({
    mutationFn: () =>
      api.post<ProductivityReport>('/ai/productivity-report', {
        timeframe: 'last_7_days',
      }),
    onSuccess: (data) => {
      setReport(data);
      refetchUsage();
    },
  });

  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-card via-card to-blue-950/20 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">Gemini AI Intelligence</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Automated workspace analytics and cognitive workflow synthesis
          </CardDescription>
        </div>

        {usage && (
          <Badge variant="outline" className="text-[11px] font-mono border-blue-500/30 bg-blue-500/10 text-blue-300">
            {usage.usedThisMonth} / {usage.maxMonthlyQuota} requests used
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!report && (
          <div className="rounded-xl border border-border/80 bg-background/40 p-4 space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate instant 7-day velocity breakdown, completion rates, and cognitive workload recommendations powered by Gemini 2.5.
            </p>
            <Button
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending}
              variant="gradient"
              size="sm"
            >
              {generateReportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Synthesizing Insights...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Generate 7-Day Velocity Report
                </>
              )}
            </Button>
          </div>
        )}

        {report && (
          <div className="space-y-4 animate-in fade-in-50">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/80 text-center">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Completed</span>
                <p className="text-lg font-bold text-emerald-400">{report.metrics.tasksCompleted}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/80 text-center">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Created</span>
                <p className="text-lg font-bold text-blue-400">{report.metrics.tasksCreated}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/80 text-center">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Team Active</span>
                <p className="text-lg font-bold text-purple-400">{report.metrics.activeTeamMembers}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/80 text-center">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Velocity Rate</span>
                <p className="text-lg font-bold text-amber-400">{report.metrics.completionRate}%</p>
              </div>
            </div>

            {/* AI Insights and Focus Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                  <TrendingUp className="h-3.5 w-3.5" /> Key Insights
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {report.insights.map((ins, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                  <AlertCircle className="h-3.5 w-3.5" /> Focus Areas
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {report.focusAreas.map((focus, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => generateReportMutation.mutate()}
                disabled={generateReportMutation.isPending}
              >
                <RefreshCw className={`mr-1.5 h-3 w-3 ${generateReportMutation.isPending ? 'animate-spin' : ''}`} />
                Regenerate Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
