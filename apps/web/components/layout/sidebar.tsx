'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/store/auth.store.js';
import { useUIStore } from '../../lib/store/ui.store.js';
import { OrgSwitcher } from './org-switcher.js';
import { cn } from '../../lib/utils.js';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart3,
  Sparkles,
  Files,
  Bell,
  CreditCard,
  Building,
  Users,
  Settings,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isSuperAdminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks & Board', href: '/tasks', icon: CheckSquare },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Files & Assets', href: '/files', icon: Files },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

const workspaceNavItems: NavItem[] = [
  { label: 'Organization', href: '/organization', icon: Building },
  { label: 'Team Members', href: '/organization/members', icon: Users },
  { label: 'Billing & Plans', href: '/billing', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Super Admin', href: '/admin', icon: ShieldCheck, isSuperAdminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen border-r border-border bg-card/95 backdrop-blur-md transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20',
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/80">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                TaskPulse <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-[11px] font-extrabold uppercase">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Enterprise SaaS</span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Organization Switcher */}
      <div className="p-3 border-b border-border/60">
        {sidebarOpen ? (
          <OrgSwitcher />
        ) : (
          <div className="flex justify-center">
            <Building className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          {sidebarOpen && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Workspace
            </div>
          )}
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  !sidebarOpen && 'justify-center px-2',
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {isActive && !sidebarOpen && (
                  <div className="absolute right-1 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Management Section */}
        <div className="space-y-1">
          {sidebarOpen && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Management
            </div>
          )}
          {workspaceNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  !sidebarOpen && 'justify-center px-2',
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Super Admin Section */}
        {user?.isSuperAdmin && (
          <div className="space-y-1 pt-2 border-t border-border/60">
            {sidebarOpen && (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Platform Control
              </div>
            )}
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith('/admin');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all group relative',
                    isActive
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300',
                    !sidebarOpen && 'justify-center px-2',
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0 text-rose-400" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Assistant Callout Footer */}
      {sidebarOpen && (
        <div className="p-3 m-3 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-indigo-950/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Gemini 2.5 Active
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            AI-driven auto task breakdown & velocity summaries enabled.
          </p>
        </div>
      )}
    </aside>
  );
}
