const ALUMNO_ACCESS_PATH = '/acceso?tipo=alumno&codigo=';

/**
 * Enlace directo al tab Alumno de `/acceso` con el código de sala
 * precargado (RC-011 §5, HU-09 Escenario 3). Pura, sin conocer dominio —
 * igual criterio que `generateShortCode` (`generate-short-code.ts`): vive en
 * `resources/` por ser una función pura sin dependencias de otras capas.
 *
 * `origin` es opcional solo para poder testear sin `window` real; en
 * producción siempre se omite y se usa `window.location.origin`.
 */
export function buildAlumnoAccessLink(code: string, origin?: string): string {
  const base = origin ?? window.location.origin;
  return `${base}${ALUMNO_ACCESS_PATH}${code}`;
}
