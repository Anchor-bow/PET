import { create } from 'zustand';
import { fetchApps, type AppSummary } from '../api/apps';

interface AppState {
  apps: AppSummary[];
  isLoading: boolean;
  error: string | null;
  loadApps: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  apps: [],
  isLoading: false,
  error: null,
  loadApps: async () => {
    set({ isLoading: true, error: null });
    try {
      const apps = await fetchApps();
      set({ apps, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      set({ error: message, isLoading: false, apps: [] });
    }
  },
}));
