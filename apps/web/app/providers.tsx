'use client';

import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client.js';
import { useAuthStore } from '../lib/store/auth.store.js';
import { api } from '../lib/api-client.js';
import { initSocket, joinOrganizationRoom } from '../lib/socket.js';
import { Toaster } from '../components/ui/toaster.js';
import type { Role, PlanTier } from '@tasksaas/shared';

interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    name: string;
    isSuperAdmin: boolean;
    isEmailVerified: boolean;
  };
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: Role;
    plan: PlanTier;
    isSuspended?: boolean;
  }>;
}

function AuthSocketSync({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading, activeOrgId } = useAuthStore();

  React.useEffect(() => {
    let isMounted = true;

    async function loadAuth() {
      try {
        const data = await api.get<AuthMeResponse>('/auth/me');
        if (isMounted && data && data.user) {
          setAuth(data.user, data.organizations);
        }
      } catch {
        if (isMounted) {
          useAuthStore.getState().clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAuth();

    return () => {
      isMounted = false;
    };
  }, [setAuth, setLoading]);

  React.useEffect(() => {
    if (activeOrgId) {
      initSocket();
      joinOrganizationRoom(activeOrgId);
    }
  }, [activeOrgId]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSocketSync>
        {children}
        <Toaster />
      </AuthSocketSync>
    </QueryClientProvider>
  );
}
