'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/auth.store.js';
import { useUIStore } from '../../lib/store/ui.store.js';
import { Sidebar } from './sidebar.js';
import { Header } from './header.js';
import { GlobalSearchDialog } from './global-search-dialog.js';
import { Skeleton } from '../ui/skeleton.js';
import { cn } from '../../lib/utils.js';

interface AppShellProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function AppShell({ children, requireSuperAdmin = false }: AppShellProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && requireSuperAdmin && !user?.isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, requireSuperAdmin, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="w-64 border-r border-border p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b border-border p-4 flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <div className="p-8 space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-3 gap-6">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireSuperAdmin && !user?.isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-w-0',
          sidebarOpen ? 'md:pl-64' : 'md:pl-20',
        )}
      >
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-300">
          {children}
        </main>
      </div>

      {/* Global Cmd+K Search Dialog */}
      <GlobalSearchDialog />
    </div>
  );
}
