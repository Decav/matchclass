/**
 * Bloque horario de la matriz USM (docs/tech-document.md §2.4).
 *
 * Configuración estática, día-independiente: `blockNumber` identifica el par
 * de módulos (1–10), no una celda de la grilla. La celda final día+bloque
 * (1–50) la calcula quien combina estos 10 bloques con los 5 días
 * (`celda = fila × 5 + columna + 1`) — ver `src/resources/constants/usm-schedule.ts`
 * y `Q3ScheduleGrid`. No persiste en Firestore.
 */
export interface ScheduleBlock {
  blockNumber: number;
  displayName: string;
  modules: string;
  startTime: string | null;
  endTime: string | null;
  isVespertine: boolean;
}
