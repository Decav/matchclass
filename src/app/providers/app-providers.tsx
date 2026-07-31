import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { ThemeProvider } from '@global/providers/theme-provider';
import { AuthProvider } from '@global/providers/auth-provider';
import { queryClient } from '@library/query';
import { router } from '../router/app-router';

/**
 * PrimeReactProvider recibe solo `{ ripple: true }`. Esta versión de
 * PrimeReact (`api.d.ts` expone `unstyled`/`changeTheme`, no `theme.preset`)
 * no tiene un preset por defecto ni acepta uno vía provider — por eso Q1Button
 * y Q2InputField NO dependen de `.p-button`/`.p-inputtext` para su apariencia,
 * usan las clases `.mc-btn`/`.mc-form-input` de theme.css directamente.
 *
 * ThemeProvider aplica `data-theme` en `<html>` antes de que PrimeReact y el
 * router rendericen, para que no haya parpadeo del tema por defecto.
 *
 * AuthProvider (RC-003) va por dentro de QueryClientProvider y por fuera de
 * RouterProvider: se suscribe a `onAuthStateChanged` apenas monta la app,
 * antes de que cualquier página consulte `useAuthStore`.
 */
export function AppProviders() {
  return (
    <ThemeProvider>
      <PrimeReactProvider value={{ ripple: true }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </PrimeReactProvider>
    </ThemeProvider>
  );
}
