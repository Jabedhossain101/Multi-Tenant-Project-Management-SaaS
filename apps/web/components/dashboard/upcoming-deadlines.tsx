import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';
import { Calendar, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export interface UpcomingTaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project?: {
    id: string;
    key: string;
    name: string;
  };
}

interface UpcomingDeadlinesProps {
  tasks: UpcomingTaskItem[];
}

export function UpcomingDeadlines({ tasks }: UpcomingDeadlinesProps) {
  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-base font-bold">Upcoming Deadlines</CardTitle>
        </div>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No pending tasks with approaching due dates.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {tasks.slice(0, 4).map((task) => {
              const overdue = isOverdue(task.dueDate) && task.status !== 'COMPLETED';
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between py-3 hover:bg-accent/40 px-2 rounded-lg transition-colors group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{task.project?.name || 'General Project'}</span>
                      <span>•</span>
                      <span className={`flex items-center gap-1 ${overdue ? 'text-rose-400 font-semibold' : ''}`}>
                        {overdue ? <AlertTriangle className="h-3 w-3 text-rose-400" /> : <Clock className="h-3 w-3" />}
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={overdue ? 'destructive' : 'outline'}
                      className="text-[10px]"
                    >
                      {overdue ? 'Overdue' : task.priority}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
