import type { HeatmapEntry } from '@resources/types/heatmap-entry.type';

/**
 * Resultado del matching de una sala (RC-014 §3, `docs/tech-document.md`
 * §2.3). VO en memoria: HU-12 calcula el matching del lado cliente, así que
 * —a diferencia de lo que describe el tech-document— esto no se persiste en
 * `roomResults/{roomId}`, que sigue sin usarse.
 *
 * `ranking` reusa las mismas entradas de `heatmap` (tech-document §2.3.2:
 * "mismos campos que HeatmapEntry"), filtradas y ordenadas.
 */
export interface RoomResult {
  totalResponses: number;
  /** Las 50 celdas, en orden de celda ascendente. Vacío si nadie respondió. */
  heatmap: HeatmapEntry[];
  /** Top 3 sin celdas bloqueadas, por disponibilidad descendente. */
  ranking: HeatmapEntry[];
}
