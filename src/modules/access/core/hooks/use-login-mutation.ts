import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '@library/repositories/auth.repository';
import { UserRepository } from '@library/repositories/user.repository';
import { useAuthStore } from '@global/store/auth.store';
import type { User } from '@resources/entities/user.entity';
import type { LoginFormValues } from '../schemas/login.schema';

/**
 * Use case "LoginAyudante" (RC-003 §6): valida credenciales, lee
 * `users/{uid}` y actualiza `useAuthStore` explícitamente antes de navegar.
 *
 * `AuthProvider` también actualizará el store vía `onAuthStateChanged` (es la
 * fuente de verdad canónica), pero setearlo aquí evita depender de esa
 * segunda vuelta asíncrona para cumplir el paso 4 del use case y redirigir
 * sin parpadeo.
 */
export function useLoginMutation() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<User, unknown, LoginFormValues>({
    mutationFn: async ({ email, password }) => {
      const { uid } = await AuthRepository.loginWithEmail(email, password);
      const user = await UserRepository.getById(uid);
      if (!user) {
        throw new Error('No se encontró el perfil del ayudante.');
      }
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      void navigate('/dashboard');
    },
  });
}
