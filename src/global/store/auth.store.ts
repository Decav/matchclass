import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from '@resources/entities/user.entity';
import { AuthStatus } from '@resources/enums/auth-status.enum';

/**
 * Identidad del **ayudante** autenticado con cuenta. La sesión anónima del
 * alumno no pasa por este store — se maneja como estado local del módulo
 * `access` (ver RC-003 §10, "Sesión anónima fuera de useAuthStore").
 */
interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User) => void;
  clearUser: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      status: AuthStatus.Idle,

      setUser: (user) => set({ user, status: AuthStatus.Authenticated }, false, 'auth/setUser'),

      clearUser: () =>
        set({ user: null, status: AuthStatus.Unauthenticated }, false, 'auth/clearUser'),

      setStatus: (status) => set({ status }, false, 'auth/setStatus'),
    }),
    { name: 'AuthStore' },
  ),
);

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.status === AuthStatus.Authenticated;
