import { createContext, useContext, type ReactNode } from 'react';
import { useTheme, type UseThemeResult } from '@global/hooks/use-theme';

type ThemeContextType = UseThemeResult;

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Expone `useTheme` vía contexto para evitar prop drilling. Debe montarse
 * una sola vez, en `app-providers.tsx`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext debe usarse dentro de ThemeProvider');
  return ctx;
}
