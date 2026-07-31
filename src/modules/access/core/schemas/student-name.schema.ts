import { z } from 'zod';

/**
 * VO de formulario del tab Alumno — paso nombre. Mínimo 2 caracteres tras
 * `trim` (HU-01 Escenario 15).
 */
export const studentNameSchema = z.object({
  studentName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export type StudentNameFormValues = z.infer<typeof studentNameSchema>;
