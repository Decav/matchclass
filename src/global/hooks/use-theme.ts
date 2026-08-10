import { useLayoutEffect, useState } from 'react';

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
 * InitializeTheme: el script inline de `index.html` ya dejó `data-theme`
 * aplicado antes del primer pintado (RC-016 D1). Al montar, este hook resuelve
 * el mismo valor con la misma lógica — lee `matchclass-theme` de localStorage
 * y, si no existe, usa `prefers-color-scheme` — así que el efecto de abajo es
 * un no-op en la primera pasada: sincroniza el estado de React con el DOM que
 * ya está aplicado, no se pelea con él.
 *
 * ToggleTheme: invierte el valor, lo aplica como `data-theme` en `<html>` y
 * lo persiste en localStorage.
 */
export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // `useLayoutEffect` y no `useEffect` (RC-016 D1): corre antes del pintado,
  // así un cambio de tema tampoco muestra un frame con el valor anterior.
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /**
   * La persistencia vive en los setters, no en el efecto (RC-016 D2): montar
   * la app no debe escribir en localStorage. En la primera visita el tema sale
   * de `prefers-color-scheme` y no queda congelado, así que si el usuario
   * cambia el modo de su sistema operativo la app lo sigue — hasta que elija
   * uno manualmente con el toggle.
   */
  const selectTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  };

  const toggleTheme = () => {
    selectTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setLight = () => selectTheme('light');
  const setDark = () => selectTheme('dark');

  return { theme, toggleTheme, setLight, setDark, isDark: theme === 'dark' };
}
