'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/auth.store.js';
import { useUIStore } from '../../lib/store/ui.store.js';
import { api } from '../../lib/api-client.js';
import { NotificationCenter } from './notification-center.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js';
import { Avatar, AvatarFallback } from '../ui/avatar.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { Search, LogOut, User, Settings, ShieldCheck, Menu } from 'lucide-react';

export function Header() {
  const { user, clearAuth, organizations, activeOrgId } = useAuthStore();
  const { setSearchOpen, toggleSidebar } = useUIStore();
  const router = useRouter();

  const activeOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      {/* Left section: mobile toggle & search trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center justify-between rounded-lg border border-input bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-accent/50 group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Search workspace projects, tasks...</span>
          </div>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right section: actions, notifications & profile */}
      <div className="flex items-center gap-3">
        {/* Notification Popover */}
        <NotificationCenter />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9 border border-border/80">
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                <div className="pt-1.5 flex items-center gap-1.5">
                  {activeOrg?.role && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                      {activeOrg.role}
                    </Badge>
                  )}
                  {user?.isSuperAdmin && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-mono">
                      SUPER ADMIN
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/organization')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Workspace Settings</span>
            </DropdownMenuItem>
            {user?.isSuperAdmin && (
              <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer text-rose-400">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin Console</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
