'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { useAuthStore } from '../../../lib/store/auth.store.js';
import { StatCard } from '../../../components/dashboard/stat-card.js';
import { ProjectSummaryCard, type ProjectSummaryItem } from '../../../components/dashboard/project-summary-card.js';
import { UpcomingDeadlines, type UpcomingTaskItem } from '../../../components/dashboard/upcoming-deadlines.js';
import { AIInsightsWidget } from '../../../components/dashboard/ai-insights-widget.js';
import { Button } from '../../../components/ui/button.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Plus, LayoutGrid } from 'lucide-react';

interface ProjectsResponse {
  items: ProjectSummaryItem[];
  total: number;
}

interface TasksResponse {
  items: UpcomingTaskItem[];
  total: number;
}

export default function DashboardPage() {
  const { user, organizations, activeOrgId } = useAuthStore();
  const activeOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];

  const { data: projectsData, isLoading: projectsLoading } = useQuery<ProjectsResponse>({
    queryKey: ['projects', activeOrgId],
    queryFn: () => api.get<ProjectsResponse>('/projects?limit=10'),
    enabled: !!activeOrgId,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery<TasksResponse>({
    queryKey: ['tasks', activeOrgId],
    queryFn: () => api.get<TasksResponse>('/tasks?limit=50'),
    enabled: !!activeOrgId,
  });

  const isLoading = projectsLoading || tasksLoading;

  const projects = projectsData?.items || [];
  const tasks = tasksData?.items || [];

  const totalProjects = projectsData?.total || projects.length;
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE' || p.status === 'PLANNING').length;
  const totalTasks = tasksData?.total || tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < Date.now() && t.status !== 'COMPLETED',
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{user?.name || 'Architect'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Active workspace: <span className="font-semibold text-foreground">{activeOrg?.name || 'Default Workspace'}</span> • Real-time synchronization active
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              <LayoutGrid className="mr-2 h-4 w-4 text-primary" /> Kanban Board
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="gradient" size="sm">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Summary Metrics Cards */}
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
            title="Total Projects"
            value={totalProjects}
            change={`${activeProjects} active`}
            trend="neutral"
            icon={FolderKanban}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            change={`${completedTasks} closed`}
            trend="up"
            icon={CheckSquare}
            iconColor="text-purple-400"
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            change="Across active sprints"
            trend="up"
            icon={TrendingUp}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Overdue Tasks"
            value={overdueTasks}
            change={overdueTasks > 0 ? 'Requires attention' : 'All on schedule'}
            trend={overdueTasks > 0 ? 'down' : 'up'}
            icon={Clock}
            iconColor="text-rose-400"
          />
        </div>
      )}

      {/* AI Cognitive Assistant Insights Card */}
      <AIInsightsWidget />

      {/* Projects & Upcoming Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectSummaryCard projects={projects} />
        <UpcomingDeadlines tasks={tasks} />
      </div>
    </div>
  );
}
