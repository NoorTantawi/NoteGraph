/**
 * React hook for theme management in NoteGraph.
 *
 * Reads the current theme from the settings store and applies it to
 * `document.documentElement.dataset.theme`. When the theme is set to
 * "system", it listens for OS-level color scheme changes via
 * `matchMedia` and updates accordingly.
 *
 * @returns The current theme setting, the resolved theme, and a setter.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import type { ThemeMode } from '../types/settings';

interface UseThemeReturn {
  /** The raw theme setting: 'light' | 'dark' | 'system' */
  theme: ThemeMode;
  /** The resolved theme after evaluating system preference: 'light' | 'dark' */
  resolvedTheme: 'dark' | 'light';
  /** Update the theme setting */
  setTheme: (theme: ThemeMode) => void;
}

export function useTheme(): UseThemeReturn {
  const theme = useSettingsStore((s) => s.theme);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const getResolvedTheme = useSettingsStore((s) => s.getResolvedTheme);

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(
    getResolvedTheme(),
  );

  /** Apply a resolved theme to the DOM */
  const applyTheme = useCallback((resolved: 'dark' | 'light') => {
    document.documentElement.dataset.theme = resolved;
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    /* Resolve and apply immediately */
    const resolved = getResolvedTheme();
    applyTheme(resolved);

    /* If 'system', listen for OS preference changes */
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, applyTheme, getResolvedTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      updateSetting('theme', newTheme);
    },
    [updateSetting],
  );

  return { theme, resolvedTheme, setTheme };
}
