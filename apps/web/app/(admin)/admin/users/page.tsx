'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card.js';
import { Badge } from '../../../../components/ui/badge.js';
import { Skeleton } from '../../../../components/ui/skeleton.js';
import { formatDate } from '../../../../lib/utils.js';
import { Users, ArrowLeft, Mail } from 'lucide-react';

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  memberships: Array<{
    id: string;
    role: string;
    organization: {
      id: string;
      name: string;
    };
  }>;
}

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useQuery<AdminUserItem[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get<AdminUserItem[]>('/admin/users'),
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
          <Users className="h-6 w-6 text-purple-400" />
          Global User Directory
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Complete cross-tenant account registry and privilege status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Registered Users ({users.length})</CardTitle>
          <CardDescription className="text-xs">
            Users across all organizations and administrative roles
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
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3.5 px-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{u.name}</span>
                      {u.isSuperAdmin && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-mono">
                          SUPER ADMIN
                        </Badge>
                      )}
                      {u.isEmailVerified && (
                        <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/20">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {u.email}
                    </span>
                  </div>

                  <div className="text-right text-xs text-muted-foreground">
                    <div>{u.memberships?.length || 0} org memberships</div>
                    <span className="text-[10px] font-mono">Joined {formatDate(u.createdAt)}</span>
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
