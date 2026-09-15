'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { queryClient } from '../../../lib/query-client.js';
import { Card, CardContent } from '../../../components/ui/card.js';
import { Button } from '../../../components/ui/button.js';
import { Badge } from '../../../components/ui/badge.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { formatTimeAgo } from '../../../lib/utils.js';
import { Bell, Check, Sparkles, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [filter, setFilter] = React.useState<'ALL' | 'UNREAD'>('ALL');

  const { data, isLoading } = useQuery<{ items: NotificationItem[] }>({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ items: NotificationItem[] }>('/notifications'),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const allItems = data?.items || [];
  const items = filter === 'UNREAD' ? allItems.filter((i) => !i.isRead) : allItems;
  const unreadCount = allItems.filter((i) => !i.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'COMMENT_MENTION':
      case 'TASK_COMMENT':
        return <MessageSquare className="h-5 w-5 text-blue-400" />;
      case 'AI_ANALYSIS_READY':
        return <Sparkles className="h-5 w-5 text-purple-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time mentions, task assignments, and AI velocity alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button
              variant={filter === 'ALL' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-7"
              onClick={() => setFilter('ALL')}
            >
              All ({allItems.length})
            </Button>
            <Button
              variant={filter === 'UNREAD' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-7"
              onClick={() => setFilter('UNREAD')}
            >
              Unread ({unreadCount})
            </Button>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List Card */}
      <Card>
        <CardContent className="p-0 divide-y divide-border/60">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No notifications to display.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.isRead && markOneMutation.mutate(item.id)}
                className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  !item.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${!item.isRead ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <Badge variant="default" className="text-[9px] h-4 px-1.5">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                      {item.message}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap shrink-0">
                  {formatTimeAgo(item.createdAt)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
