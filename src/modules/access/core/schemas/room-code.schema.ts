import { z } from 'zod';

/**
 * VO de formulario del tab Alumno — paso código. Exactamente 6 caracteres
 * (HU-01 Escenario 12). La normalización a mayúsculas ocurre en
 * `RoomRepository.findByCode`, no aquí (Firestore no hace match
 * case-insensitive — ver seed/06-auth-integration.md).
 */
export const roomCodeSchema = z.object({
  code: z.string().length(6, 'El código debe tener 6 caracteres'),
});

export type RoomCodeFormValues = z.infer<typeof roomCodeSchema>;
