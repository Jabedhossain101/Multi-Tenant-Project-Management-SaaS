'use client';

import * as React from 'react';
import { use, Suspense } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client.js';
import { Button } from '../../../../components/ui/button.js';
import { Badge } from '../../../../components/ui/badge.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.js';
import { SubtaskList } from '../../../../components/task-detail/subtask-list.js';
import { CommentThread } from '../../../../components/task-detail/comment-thread.js';
import { Skeleton } from '../../../../components/ui/skeleton.js';
import { formatDate } from '../../../../lib/utils.js';
import { ArrowLeft, Calendar, FolderKanban } from 'lucide-react';

function TaskDetailPageContent({ taskId }: { taskId: string }) {
  const { data: task, isLoading } = useQuery<{
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate: string | null;
    project?: { id: string; key: string; name: string };
    subtasks: Array<{ id: string; title: string; isCompleted: boolean; position: number }>;
  }>({
    queryKey: ['task', taskId],
    queryFn: () => api.get(`/tasks/${taskId}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold">Task Not Found</h2>
        <Link href="/tasks">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/tasks"
        className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Tasks
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-mono uppercase text-muted-foreground">
              {task.project?.key} • {task.project?.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">{task.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{task.status}</Badge>
          <Badge
            variant={
              task.priority === 'URGENT'
                ? 'destructive'
                : task.priority === 'HIGH'
                ? 'warning'
                : 'secondary'
            }
          >
            {task.priority}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase font-mono text-muted-foreground">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {task.description || 'No description provided.'}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <SubtaskList taskId={task.id} subtasks={task.subtasks || []} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <CommentThread taskId={task.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase font-mono text-muted-foreground">
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground">Target Due Date:</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const unwrappedParams = use(params);
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <TaskDetailPageContent taskId={unwrappedParams.taskId} />
    </Suspense>
  );
}
