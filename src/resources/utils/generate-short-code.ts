const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DEFAULT_LENGTH = 6;

/**
 * Generador de códigos cortos alfanuméricos en mayúsculas, agnóstico de
 * dominio (RC-009 §5) — no sabe qué es una "sala": quien lo llama
 * (`RoomService.createRoom`) es quien le da ese significado y decide qué
 * hacer si el código colisiona con uno existente.
 *
 * Vive en `resources/` (no en `global/utils/` como sugiere la convención
 * general de `01-layers.md`) porque `eslint.config.js` prohíbe que
 * `src/library/**` importe `@global/*` ("no depende de capas superiores") —
 * `RoomService.createRoom` (`library/services/`) necesita llamarlo
 * directamente. Al ser una función pura sin dependencias, `resources/` (la
 * única capa que `library` puede importar además de sí misma) es un lugar
 * válido y no rompe la regla de agnosticismo de esa capa.
 */
export function generateShortCode(length: number = DEFAULT_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHANUMERIC_CHARS[Math.floor(Math.random() * ALPHANUMERIC_CHARS.length)];
  }
  return code;
}
