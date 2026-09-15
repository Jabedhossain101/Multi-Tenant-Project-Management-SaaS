import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../lib/store/auth.store.js';
import { useUIStore } from '../lib/store/ui.store.js';

describe('Zustand Stores', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useUIStore.getState().setActiveTaskId(null);
  });

  it('manages auth store state and active organization', () => {
    const mockUser = {
      id: 'usr_1',
      email: 'alex@taskpulse.io',
      name: 'Alex Johnson',
      isSuperAdmin: false,
      isEmailVerified: true,
    };

    const mockOrg = {
      id: 'org_1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'PRO' as const,
      role: 'ORG_ADMIN' as const,
    };

    useAuthStore.getState().setAuth(mockUser, [mockOrg], mockOrg.id);

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('alex@taskpulse.io');
    expect(state.organizations.length).toBe(1);
    expect(state.activeOrgId).toBe('org_1');
    expect(state.isAuthenticated).toBe(true);

    useAuthStore.getState().clearAuth();
    const logoutState = useAuthStore.getState();
    expect(logoutState.user).toBeNull();
    expect(logoutState.isAuthenticated).toBe(false);
  });

  it('manages UI store task modals and global search', () => {
    const store = useUIStore.getState();
    expect(store.searchOpen).toBe(false);
    expect(store.sidebarOpen).toBe(true);

    store.setSearchOpen(true);
    expect(useUIStore.getState().searchOpen).toBe(true);

    store.setActiveTaskId('task_123');
    expect(useUIStore.getState().activeTaskId).toBe('task_123');

    store.toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });
});
