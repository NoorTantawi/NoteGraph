import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from '../types/settings';
import type { Settings } from '../types/settings';

interface SettingsState extends Settings {
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
  getResolvedTheme: () => 'dark' | 'light';
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      updateSetting: (key, value) => set({ [key]: value }),
      
      resetSettings: () => set(DEFAULT_SETTINGS),
      
      getResolvedTheme: () => {
        const theme = get().theme;
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      }
    }),
    {
      name: 'notegraph-settings',
    }
  )
);

// Listen to changes and apply theme
useSettingsStore.subscribe((state) => {
  const resolvedTheme = state.getResolvedTheme();
  document.documentElement.dataset.theme = resolvedTheme;
});
