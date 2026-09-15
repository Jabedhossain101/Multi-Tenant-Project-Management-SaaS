'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { useAuthStore } from '../../../lib/store/auth.store.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';
import { Button } from '../../../components/ui/button.js';
import { Badge } from '../../../components/ui/badge.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { formatDate } from '../../../lib/utils.js';
import { Building2, Users, ShieldCheck, CreditCard } from 'lucide-react';

interface OrgDetailsResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
  };
  _count?: {
    members: number;
    projects: number;
    tasks: number;
  };
}

export default function OrganizationPage() {
  const { activeOrgId } = useAuthStore();

  const { data: org, isLoading } = useQuery<OrgDetailsResponse>({
    queryKey: ['organization', activeOrgId],
    queryFn: () => api.get<OrgDetailsResponse>('/organizations'),
    enabled: !!activeOrgId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Workspace Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Multi-tenant organization parameters, enterprise limits, and member governance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/organization/members">
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" /> Team Members
            </Button>
          </Link>
          <Link href="/billing">
            <Button variant="gradient" size="sm">
              <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">{org?.name}</CardTitle>
              <CardDescription className="text-xs font-mono mt-1">
                Workspace Slug: <span className="text-primary font-bold">{org?.slug}</span>
              </CardDescription>
            </div>
            <Badge variant="default" className="text-xs font-mono uppercase">
              {org?.subscription?.plan || 'FREE'} TIER
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-card/60 border border-border/80 text-center">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">Team Members</span>
              <p className="text-2xl font-bold text-foreground mt-1">{org?._count?.members ?? 1}</p>
            </div>
            <div className="p-4 rounded-xl bg-card/60 border border-border/80 text-center">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">Active Projects</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">{org?._count?.projects ?? 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-card/60 border border-border/80 text-center">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">Tracked Tasks</span>
              <p className="text-2xl font-bold text-purple-400 mt-1">{org?._count?.tasks ?? 0}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Workspace Created: {formatDate(org?.createdAt)}</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" /> Strict Tenant Isolation
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
