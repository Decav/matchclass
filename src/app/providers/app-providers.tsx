import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { ThemeProvider } from '@global/providers/theme-provider';
import { queryClient } from '@library/query';
import { router } from '../router/app-router';

/**
 * PrimeReactProvider recibe solo `{ ripple: true }`: los overrides de tema se
 * hacen via CSS variables en theme.css, no con un objeto de tema.
 *
 * ThemeProvider aplica `data-theme` en `<html>` antes de que PrimeReact y el
 * router rendericen, para que no haya parpadeo del tema por defecto.
 * AuthProvider se agrega en RC-003.
 */
export function AppProviders() {
  return (
    <ThemeProvider>
      <PrimeReactProvider value={{ ripple: true }}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </PrimeReactProvider>
    </ThemeProvider>
  );
}
