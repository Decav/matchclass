import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '@library/repositories/auth.repository';
import { UserRepository } from '@library/repositories/user.repository';
import { useAuthStore } from '@global/store/auth.store';
import type { User } from '@resources/entities/user.entity';
import type { RegisterFormValues } from '../schemas/register.schema';

/**
 * Use case "RegisterAyudante" (RC-004 §6): crea la cuenta en Firebase Auth,
 * escribe `users/{uid}` con `role: 'helper'` fijo y actualiza `useAuthStore`
 * explícitamente antes de navegar — mismo patrón que `useLoginMutation`
 * (RC-003): `AuthProvider` también lo hará vía `onAuthStateChanged`, pero
 * setearlo aquí evita depender de esa segunda vuelta asíncrona.
 */
export function useRegisterMutation() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<User, unknown, RegisterFormValues>({
    mutationFn: async ({ displayName, email, password }) => {
      const { uid } = await AuthRepository.registerWithEmail(email, password);
      const createdAt = new Date();
      const role: User['role'] = 'helper';

      await UserRepository.create(uid, { displayName, email, role, createdAt });

      return { id: uid, displayName, email, role, createdAt };
    },
    onSuccess: (user) => {
      setUser(user);
      void navigate('/dashboard');
    },
  });
}
