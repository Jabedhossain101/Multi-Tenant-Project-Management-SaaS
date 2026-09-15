import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  activeTaskId: string | null;
  activeProjectId: string | null;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setActiveTaskId: (taskId: string | null) => void;
  setActiveProjectId: (projectId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  searchOpen: false,
  activeTaskId: null,
  activeProjectId: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setActiveTaskId: (taskId) => set({ activeTaskId: taskId }),
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
}));
