import type { HeatmapStatus } from '@resources/enums/heatmap-status.enum';

/**
 * Disponibilidad de una celda día+bloque (RC-014 §3, `docs/tech-document.md`
 * §2.3.1). VO de UI: no persiste en Firestore — se calcula en memoria con
 * `buildRoomResult` a partir de las respuestas de la sala.
 *
 * `percentage` va sin redondear (`91.428…`): los umbrales se evalúan sobre
 * ese valor y el redondeo es de presentación. Redondear antes movería una
 * celda de 69.5% a `high`.
 */
export interface HeatmapEntry {
  /** Celda 1–50 (`fila × 5 + columna + 1`). */
  block: number;
  day: string;
  /** `"08:15 – 09:25"`, o `"Vespertino"` en los bloques sin horario. */
  timeRange: string;
  /** Nombre corto del bloque para el ranking: `"9-10"`. */
  blockLabel: string;
  /** Alumnos que NO tienen esta celda en `occupiedBlocks`. */
  available: number;
  total: number;
  percentage: number;
  status: HeatmapStatus;
}
