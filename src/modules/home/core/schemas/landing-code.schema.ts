import { z } from 'zod';

/**
 * Código de sala escrito en la barra de la landing (RC-015 §5). Duplica a
 * propósito el `roomCodeSchema` del módulo `access`: los módulos no se
 * importan entre sí, y las dos pantallas pueden divergir sin arrastrarse
 * (allá son seis celdas de un carácter, acá un campo suelto).
 */
export const landingCodeSchema = z.object({
  code: z.string().length(6, 'El código debe tener 6 caracteres'),
});

export type LandingCodeFormValues = z.infer<typeof landingCodeSchema>;
