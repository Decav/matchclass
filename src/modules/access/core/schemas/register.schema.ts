import { z } from 'zod';

/**
 * VO de formulario `/registro` (RC-004 §3). Mensajes literales de HU-02.
 * `confirmPassword` valida primero que no esté vacío y luego, a nivel de
 * objeto, que coincida con `password` (Escenario 5).
 */
export const registerSchema = z
  .object({
    displayName: z.string().min(1, 'Este campo es obligatorio'),
    email: z.string().min(1, 'Este campo es obligatorio').email('Ingresa un email válido'),
    password: z
      .string()
      .min(1, 'Este campo es obligatorio')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Este campo es obligatorio'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
