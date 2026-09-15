'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client.js';
import { queryClient } from '../../../../lib/query-client.js';
import { useToast } from '../../../../components/ui/use-toast.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card.js';
import { Button } from '../../../../components/ui/button.js';
import { Badge } from '../../../../components/ui/badge.js';
import { Skeleton } from '../../../../components/ui/skeleton.js';
import { formatDate } from '../../../../lib/utils.js';
import { Building2, ArrowLeft, Ban, CheckCircle2 } from 'lucide-react';

interface AdminOrgItem {
  id: string;
  name: string;
  slug: string;
  isSuspended: boolean;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
  };
  _count?: {
    members: number;
    projects: number;
  };
}

export default function AdminOrganizationsPage() {
  const { toast } = useToast();

  const { data: orgs = [], isLoading } = useQuery<AdminOrgItem[]>({
    queryKey: ['admin-organizations'],
    queryFn: () => api.get<AdminOrgItem[]>('/admin/organizations'),
  });

  const suspendMutation = useMutation({
    mutationFn: (orgId: string) => api.patch(`/admin/organizations/${orgId}/suspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      toast({ title: 'Organization Suspended', variant: 'destructive' });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (orgId: string) => api.patch(`/admin/organizations/${orgId}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      toast({ title: 'Organization Reactivated', variant: 'success' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-rose-400" />
            Global Organization Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Super Administrator controls for workspace management and account suspension
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Tenants ({orgs.length})</CardTitle>
          <CardDescription className="text-xs">
            All active and suspended organizations across the cluster
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {orgs.map((org) => (
                <div key={org.id} className="flex items-center justify-between py-4 px-2 hover:bg-accent/30 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{org.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">({org.slug})</span>
                      <Badge variant={org.isSuspended ? 'destructive' : 'outline'} className="text-[10px]">
                        {org.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                        {org.subscription?.plan || 'FREE'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{org._count?.members ?? 0} members</span>
                      <span>•</span>
                      <span>{org._count?.projects ?? 0} projects</span>
                      <span>•</span>
                      <span>Created {formatDate(org.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    {org.isSuspended ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => reactivateMutation.mutate(org.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Reactivate
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-rose-400 hover:bg-rose-500/10"
                        onClick={() => suspendMutation.mutate(org.id)}
                      >
                        <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
