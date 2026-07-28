import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { queryClient } from '@library/query';
import { router } from '../router/app-router';

/**
 * PrimeReactProvider recibe solo `{ ripple: true }`: los overrides de tema se
 * hacen via CSS variables en theme.css, no con un objeto de tema.
 *
 * ThemeProvider y AuthProvider se agregan en RC-002 y RC-003.
 */
export function AppProviders() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </PrimeReactProvider>
  );
}
