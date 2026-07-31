import { useEffect, type ReactNode } from 'react';
import { AuthRepository } from '@library/repositories/auth.repository';
import { UserRepository } from '@library/repositories/user.repository';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';

/**
 * Sincroniza `useAuthStore` con `onAuthStateChanged`, la fuente de verdad de
 * la sesión (RC-003, use case "RestoreSession"). Se suscribe una sola vez,
 * en la raíz de la app — ver `app-providers.tsx`.
 *
 * No expone un hook de contexto (a diferencia de `ThemeProvider`): el estado
 * que produce ya vive en `useAuthStore`, consumible directamente.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    setStatus(AuthStatus.Loading);

    const unsubscribe = AuthRepository.subscribeToAuthState((uid) => {
      if (!uid) {
        clearUser();
        return;
      }

      UserRepository.getById(uid)
        .then((user) => {
          // Sin documento de perfil (p. ej. sesión anónima de un alumno, o un
          // uid de ayudante sin `users/{uid}` creado): no hay identidad de
          // ayudante que restaurar. El RC no define este caso explícitamente
          // (§10, "Documento users/{uid} inexistente") — se trata como "sin
          // sesión de ayudante" en vez de dejar el store en `Loading`.
          if (user) setUser(user);
          else clearUser();
        })
        .catch(() => clearUser());
    });

    return unsubscribe; // imprescindible: evita listeners duplicados en StrictMode
  }, [setUser, clearUser, setStatus]);

  return <>{children}</>;
}
