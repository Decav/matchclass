import { useMutation } from '@tanstack/react-query';
import { AuthRepository } from '@library/repositories/auth.repository';
import { classifyFirebaseError } from '@library/firebase';
import type { RecoverFormValues } from '../schemas/recover.schema';

export interface UseRecoverPasswordMutationOptions {
  onSuccess?: () => void;
}

/**
 * Use case "RecoverPassword" (RC-007 §6, HU-05). Envía el link de
 * restablecimiento y decide cuándo pasar al estado de confirmación.
 *
 * Punto crítico de seguridad (§10 de la HU, "seguridad por no-verificación"):
 * si Firebase responde `auth/user-not-found`, se trata como éxito silencioso
 * (Escenario 2) — nunca se revela si el email tiene o no una cuenta asociada.
 * Esta decisión vive acá, no en `AuthRepository` (que deja pasar el error tal
 * cual): es una regla de producto de esta HU, no una traducción genérica de
 * errores de Firebase.
 */
export function useRecoverPasswordMutation(options?: UseRecoverPasswordMutationOptions) {
  return useMutation<void, unknown, RecoverFormValues>({
    mutationFn: async ({ email }) => {
      try {
        await AuthRepository.sendPasswordResetEmail(email);
      } catch (error) {
        if (classifyFirebaseError(error).isUserNotFound) return;
        throw error;
      }
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });
}
