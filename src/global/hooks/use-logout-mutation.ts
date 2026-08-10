import { useMutation } from '@tanstack/react-query';
import { AuthRepository } from '@library/repositories/auth.repository';
import { useAuthStore } from '@global/store/auth.store';

/**
 * Use case "LogoutAyudante" (RC-006 §6). Solo invoca `AuthRepository.logout`
 * y limpia `useAuthStore` explícitamente — mismo criterio ya usado en
 * `useLoginMutation` (RC-003): `AuthProvider`/`onAuthStateChanged` también
 * lo hará un instante después, pero no hay que esperar esa segunda vuelta.
 *
 * No navega: `Q5ProtectedRoute` (RC-005) ya redirige a `/acceso` en cuanto
 * detecta `status === 'unauthenticated'` — agregar un `navigate()` propio
 * sería una segunda fuente de la misma redirección (RC-006 §6, paso 3).
 */
export function useLogoutMutation() {
  const clearUser = useAuthStore((s) => s.clearUser);

  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      await AuthRepository.logout();
    },
    onSuccess: () => {
      clearUser();
    },
  });
}
