import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'matchclass-theme';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  // Sin preferencia guardada: se deriva de prefers-color-scheme del sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export interface UseThemeResult {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setLight: () => void;
  setDark: () => void;
}

/**
 * Aplica y persiste el tema claro/oscuro de MatchClass.
 *
 * InitializeTheme: al montar, lee `matchclass-theme` de localStorage; si no
 * existe, usa `prefers-color-scheme`.
 * ToggleTheme: invierte el valor, lo aplica como `data-theme` en `<html>` y
 * lo persiste en localStorage.
 */
export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLight = () => setTheme('light');
  const setDark = () => setTheme('dark');

  return { theme, toggleTheme, setLight, setDark, isDark: theme === 'dark' };
}
