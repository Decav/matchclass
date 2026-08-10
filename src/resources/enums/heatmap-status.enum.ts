/**
 * Categoría de disponibilidad de una celda del heatmap (RC-014 §3,
 * `docs/tech-document.md` §2.3.1).
 *
 * `Blocked` no es un tramo de la escala: significa "el ayudante no puede
 * dictar acá" (`helperBlockedSlots`) y gana sobre cualquier porcentaje.
 *
 * `as const` en vez de `enum`: mejor tree-shaking, sin código JS extra
 * (ver SKILL.md, anti-patrones TypeScript).
 */
export const HeatmapStatus = {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
  Conflict: 'conflict',
  Blocked: 'blocked',
} as const;

export type HeatmapStatus = (typeof HeatmapStatus)[keyof typeof HeatmapStatus];
