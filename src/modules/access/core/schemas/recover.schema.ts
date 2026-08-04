import { z } from 'zod';

/**
 * VO de formulario de `/recuperar` (RC-007, HU-05). Mismos mensajes
 * literales que `loginSchema` (RC-003) — comparten el mismo contrato de
 * validación de email.
 */
export const recoverSchema = z.object({
  email: z.string().min(1, 'Este campo es obligatorio').email('Ingresa un email válido'),
});

export type RecoverFormValues = z.infer<typeof recoverSchema>;
