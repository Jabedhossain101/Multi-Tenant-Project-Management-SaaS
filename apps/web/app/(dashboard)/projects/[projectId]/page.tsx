'use client';

import * as React from 'react';
import { use, Suspense } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client.js';
import { useAuthStore } from '../../../../lib/store/auth.store.js';
import { joinProjectRoom } from '../../../../lib/socket.js';
import { queryClient } from '../../../../lib/query-client.js';
import { useToast } from '../../../../components/ui/use-toast.js';
import { Button } from '../../../../components/ui/button.js';
import { Badge } from '../../../../components/ui/badge.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs.js';
import { Skeleton } from '../../../../components/ui/skeleton.js';
import { formatDate } from '../../../../lib/utils.js';
import {
  FolderKanban,
  ArrowLeft,
  Calendar,
  Sparkles,
  Loader2,
  TrendingUp,
  AlertTriangle,
  LayoutGrid,
} from 'lucide-react';

interface ProjectDetailData {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  _count?: {
    tasks: number;
    members: number;
  };
}

interface ProjectAnalyticsData {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  overdueTasks: number;
}

interface AISummaryResult {
  summary: string;
  healthScore: number;
  riskAnalysis: string[];
  potentialBlockers: string[];
  recommendedNextActions: string[];
}

function ProjectDetailContent({ projectId }: { projectId: string }) {
  const { activeOrgId } = useAuthStore();
  const { toast } = useToast();
  const [aiSummary, setAiSummary] = React.useState<AISummaryResult | null>(null);

  React.useEffect(() => {
    if (activeOrgId && projectId) {
      joinProjectRoom(projectId, activeOrgId);
    }
  }, [projectId, activeOrgId]);

  const { data: project, isLoading: projectLoading } = useQuery<ProjectDetailData>({
    queryKey: ['project', projectId],
    queryFn: () => api.get<ProjectDetailData>(`/projects/${projectId}`),
  });

  const { data: analytics } = useQuery<ProjectAnalyticsData>({
    queryKey: ['project-analytics', projectId],
    queryFn: () => api.get<ProjectAnalyticsData>(`/projects/${projectId}/analytics`),
  });

  const generateSummaryMutation = useMutation({
    mutationFn: () => api.post<AISummaryResult>('/ai/project-summary', { projectId }),
    onSuccess: (data) => {
      setAiSummary(data);
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
      toast({
        title: 'Summary Generated',
        description: 'Gemini 2.5 analysis generated.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate AI executive summary.',
        variant: 'destructive',
      });
    },
  });

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold">Project Not Found</h2>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          href="/projects"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to all projects
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
                <Badge variant="outline" className="font-mono text-xs uppercase">
                  {project.key}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {project.status}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/tasks?projectId=${project.id}`}>
              <Button variant="gradient" size="sm">
                <LayoutGrid className="mr-2 h-4 w-4" /> Open Kanban Board
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card/80 border border-border/80">
          <TabsTrigger value="overview">Overview & Metrics</TabsTrigger>
          <TabsTrigger value="members">Team Members ({project.members?.length || 0})</TabsTrigger>
          <TabsTrigger value="ai-summary">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
            AI Executive Summary
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Total Tasks</span>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {analytics?.totalTasks ?? project._count?.tasks ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Completion Rate</span>
                <p className="text-2xl font-bold mt-1 text-emerald-400">
                  {analytics?.completionRate ?? 0}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">In Progress</span>
                <p className="text-2xl font-bold mt-1 text-blue-400">
                  {analytics?.inProgressTasks ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Target Due Date</span>
                <p className="text-sm font-semibold mt-2 text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(project.dueDate)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Project Team Members</CardTitle>
              <CardDescription className="text-xs">
                Members with explicit access permissions to this project workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.members && project.members.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {project.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {m.user.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{m.user.name}</div>
                          <div className="text-xs text-muted-foreground">{m.user.email}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {m.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  All organization members have access based on global workspace role.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Executive Summary Tab */}
        <TabsContent value="ai-summary">
          <Card className="border-blue-500/30 bg-gradient-to-br from-card to-blue-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  Gemini Project Executive Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-synthesized risk analysis, blocker detection, and priority recommendations
                </CardDescription>
              </div>

              <Button
                onClick={() => generateSummaryMutation.mutate()}
                disabled={generateSummaryMutation.isPending}
                variant="gradient"
                size="sm"
              >
                {generateSummaryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Synthesize Summary'
                )}
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {!aiSummary ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  Click &ldquo;Synthesize Summary&rdquo; to analyze active task velocity and generate an executive briefing.
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-muted-foreground font-mono">
                        Executive Overview
                      </span>
                      <Badge variant="success" className="text-[10px]">
                        Health Score: {aiSummary.healthScore}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{aiSummary.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Risk Analysis
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {aiSummary.riskAnalysis.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                      <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Potential Blockers
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {aiSummary.potentialBlockers.map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Next Actions
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {aiSummary.recommendedNextActions.map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const unwrappedParams = use(params);
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <ProjectDetailContent projectId={unwrappedParams.projectId} />
    </Suspense>
  );
}
