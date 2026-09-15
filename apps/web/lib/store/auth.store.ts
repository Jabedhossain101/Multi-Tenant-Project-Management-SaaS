import { create } from 'zustand';
import type { Role, PlanTier } from '@tasksaas/shared';

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: Role;
  plan: PlanTier;
  isSuspended?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  organizations: UserOrganization[];
  activeOrgId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, organizations: UserOrganization[], activeOrgId?: string) => void;
  setActiveOrgId: (orgId: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organizations: [],
  activeOrgId: typeof window !== 'undefined' ? localStorage.getItem('tasksaas_active_org_id') : null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, organizations, activeOrgId) => {
    let resolvedOrgId: string | null = activeOrgId || null;
    if (!resolvedOrgId && organizations.length > 0) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('tasksaas_active_org_id') : null;
      resolvedOrgId = organizations.find((o) => o.id === stored)?.id || organizations[0]?.id || null;
    }

    if (resolvedOrgId && typeof window !== 'undefined') {
      localStorage.setItem('tasksaas_active_org_id', resolvedOrgId);
    }

    set({
      user,
      organizations,
      activeOrgId: resolvedOrgId,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setActiveOrgId: (orgId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasksaas_active_org_id', orgId);
    }
    set({ activeOrgId: orgId });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tasksaas_active_org_id');
    }
    set({
      user: null,
      organizations: [],
      activeOrgId: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
