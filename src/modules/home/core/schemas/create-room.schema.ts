import { z } from 'zod';

/**
 * VO de formulario de `/salas/nueva` (RC-009 §3, HU-07). Los tres campos son
 * obligatorios, sin validación de formato adicional — la HU no pide nada más
 * que "no vacío" (Escenario 2).
 */
export const createRoomSchema = z.object({
  name: z.string().min(1, 'Este campo es obligatorio'),
  subject: z.string().min(1, 'Este campo es obligatorio'),
  section: z.string().min(1, 'Este campo es obligatorio'),
});

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;
