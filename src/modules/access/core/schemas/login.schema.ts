import { z } from 'zod';

/**
 * VO de formulario del tab Ayudante. Mensajes literales de HU-01 Escenario 3.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Este campo es obligatorio').email('Ingresa un email válido'),
  password: z.string().min(1, 'Este campo es obligatorio'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
