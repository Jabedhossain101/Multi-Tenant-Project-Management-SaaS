'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { useAuthStore } from '../../../lib/store/auth.store.js';
import { useUIStore } from '../../../lib/store/ui.store.js';
import { TaskDetailModal } from '../../../components/task-detail/task-detail-modal.js';
import { Card } from '../../../components/ui/card.js';
import { Badge } from '../../../components/ui/badge.js';
import { Button } from '../../../components/ui/button.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskEventItem {
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

export default function CalendarPage() {
  const { activeOrgId } = useAuthStore();
  const { setActiveTaskId } = useUIStore();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const { data: tasksData, isLoading } = useQuery<{ items: TaskEventItem[] }>({
    queryKey: ['tasks-calendar', activeOrgId],
    queryFn: () => api.get<{ items: TaskEventItem[] }>('/tasks?limit=100'),
    enabled: !!activeOrgId,
  });

  const tasks = tasksData?.items || [];

  const tasksWithDueDate = tasks.filter((t) => !!t.dueDate);

  // Group tasks by dueDate YYYY-MM-DD
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, TaskEventItem[]>();
    tasksWithDueDate.forEach((t) => {
      if (t.dueDate) {
        const d = new Date(t.dueDate).toISOString().split('T')[0];
        if (d) {
          const list = map.get(d) || [];
          list.push(t);
          map.set(d, list);
        }
      }
    });
    return map;
  }, [tasksWithDueDate]);

  // Generate calendar days for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-purple-400" />
            Milestone & Delivery Calendar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track project deliverables, sprint deadlines, and task schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={today}>
            Today
          </Button>
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-xs font-bold font-mono min-w-[140px] text-center">
              {monthName}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      ) : (
        <Card className="p-4 shadow-xl overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-px text-center pb-2 border-b border-border/80">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-semibold uppercase text-muted-foreground font-mono py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 pt-2 min-h-[500px]">
            {blanksArray.map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] rounded-lg bg-muted/10 opacity-30" />
            ))}

            {daysArray.map((day) => {
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTasks = tasksByDate.get(dateKey) || [];
              const isToday =
                new Date().toISOString().split('T')[0] === dateKey;

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[100px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'border-primary/60 bg-primary/5 shadow-sm'
                      : 'border-border/60 bg-card/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-md h-6 w-6 flex items-center justify-center ${
                        isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 font-mono">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 mt-1.5 overflow-y-auto max-h-20">
                    {dayTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTaskId(t.id)}
                        className="w-full text-left p-1 rounded bg-secondary/80 hover:bg-primary/20 text-[10px] font-medium text-foreground truncate block transition-colors group"
                      >
                        <span className="text-muted-foreground font-mono mr-1">
                          {t.project?.key}
                        </span>
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Task Details Modal */}
      <TaskDetailModal />
    </div>
  );
}
