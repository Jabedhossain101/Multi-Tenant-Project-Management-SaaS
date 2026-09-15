'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card.js';
import { Badge } from '../../../../components/ui/badge.js';
import { Skeleton } from '../../../../components/ui/skeleton.js';
import { formatDate } from '../../../../lib/utils.js';
import { ArrowLeft, Activity } from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminAuditLogsPage() {
  const { data: logs = [], isLoading } = useQuery<AuditLogItem[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.get<AuditLogItem[]>('/admin/audit-logs'),
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Admin Console
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="h-6 w-6 text-emerald-400" />
          Platform Security Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Immutable logging of critical administrative operations and tenant boundary changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Audit Events ({logs.length})</CardTitle>
          <CardDescription className="text-xs">
            Comprehensive audit entries recorded by backend security middleware
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No security audit events recorded.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3.5 px-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                      <span className="font-semibold text-xs text-foreground font-mono">
                        {log.resource} {log.resourceId ? `[${log.resourceId.slice(0, 8)}...]` : ''}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>By: {log.user?.name || 'System / Anonymous'}</span>
                      {log.ipAddress && <span>• IP: {log.ipAddress}</span>}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
