import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Firestore ya notifica los cambios via onSnapshot donde importa;
      // refetchear al enfocar la ventana solo agrega lecturas facturables.
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
