'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api-client.js';
import { queryClient } from '../../lib/query-client.js';
import { formatTimeAgo } from '../../lib/utils.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { Bell, Check, Sparkles, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const { data: countData } = useQuery<{ unreadCount: number }>({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.get<{ unreadCount: number }>('/notifications/unread-count'),
    refetchInterval: 30000,
  });

  const { data: notificationsData } = useQuery<{ items: NotificationItem[] }>({
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

  const unreadCount = countData?.unreadCount || 0;
  const items = notificationsData?.items || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'COMMENT_MENTION':
      case 'TASK_COMMENT':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'AI_ANALYSIS_READY':
        return <Sparkles className="h-4 w-4 text-purple-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] h-5 px-1.5">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => markAllMutation.mutate()}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No notifications yet. You&apos;re all caught up!
            </div>
          ) : (
            items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => !item.isRead && markOneMutation.mutate(item.id)}
                className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                  !item.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${!item.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
