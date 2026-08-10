import { USM_SCHEDULE_BLOCKS, USM_SCHEDULE_DAYS } from '@resources/constants/usm-schedule';
import { HeatmapStatus } from '@resources/enums/heatmap-status.enum';
import type { Response } from '@resources/entities/response.entity';
import type { HeatmapEntry } from '@resources/types/heatmap-entry.type';
import type { RoomResult } from '@resources/types/room-result.type';

const TOTAL_CELLS = USM_SCHEDULE_BLOCKS.length * USM_SCHEDULE_DAYS.length;
const RANKING_SIZE = 3;

const HIGH_THRESHOLD = 70;
const MEDIUM_THRESHOLD = 40;
const LOW_THRESHOLD = 10;

/**
 * Categoría por porcentaje (HU-12 §Especificaciones). Se evalúa sobre el
 * valor sin redondear: con 69.5% redondeado antes, la celda pasaría a
 * `high` sin cumplir el umbral.
 */
function toStatus(percentage: number): HeatmapStatus {
  if (percentage >= HIGH_THRESHOLD) return HeatmapStatus.High;
  if (percentage >= MEDIUM_THRESHOLD) return HeatmapStatus.Medium;
  if (percentage >= LOW_THRESHOLD) return HeatmapStatus.Low;
  return HeatmapStatus.Conflict;
}

/**
 * Algoritmo de matching de HU-12, completo y sin dependencias (RC-014 §6):
 * ni React, ni Firebase, ni el cache de queries. Función pura — mismas
 * entradas, mismo resultado — para poder testear los umbrales y el ranking
 * sin montar nada.
 *
 * Inversión de carga: el alumno marca dónde **no** puede, así que un alumno
 * está disponible en una celda cuando esa celda no está en su
 * `occupiedBlocks`.
 *
 * Sin respuestas devuelve heatmap y ranking vacíos (Escenario 3): la
 * pantalla muestra el empty state y nunca se divide por cero.
 */
export function buildRoomResult(responses: Response[], blockedSlots: number[]): RoomResult {
  const total = responses.length;
  if (total === 0) return { totalResponses: 0, heatmap: [], ranking: [] };

  const blocked = new Set(blockedSlots);

  // Un solo recorrido de las respuestas: `occupied[celda]` = cuántos alumnos
  // tienen esa celda ocupada. Evita recorrer las N respuestas 50 veces.
  const occupied = new Array<number>(TOTAL_CELLS + 1).fill(0);
  for (const response of responses) {
    for (const cell of response.occupiedBlocks) {
      if (cell >= 1 && cell <= TOTAL_CELLS) occupied[cell] = (occupied[cell] ?? 0) + 1;
    }
  }

  const heatmap: HeatmapEntry[] = [];
  for (let cell = 1; cell <= TOTAL_CELLS; cell += 1) {
    const rowIndex = Math.floor((cell - 1) / USM_SCHEDULE_DAYS.length);
    const columnIndex = (cell - 1) % USM_SCHEDULE_DAYS.length;
    const block = USM_SCHEDULE_BLOCKS[rowIndex];
    const day = USM_SCHEDULE_DAYS[columnIndex] ?? '';

    const available = total - (occupied[cell] ?? 0);
    const percentage = (available / total) * 100;

    heatmap.push({
      block: cell,
      day,
      timeRange:
        block && !block.isVespertine && block.startTime && block.endTime
          ? `${block.startTime} – ${block.endTime}`
          : 'Vespertino',
      blockLabel: block?.displayName.replace('Bloque ', '') ?? '',
      available,
      total,
      // `blocked` gana sobre cualquier porcentaje (HU-12 Escenario 1): es una
      // restricción del ayudante, no un tramo de la escala de disponibilidad.
      percentage,
      status: blocked.has(cell) ? HeatmapStatus.Blocked : toStatus(percentage),
    });
  }

  const ranking = heatmap
    .filter((entry) => entry.status !== HeatmapStatus.Blocked)
    // Desempate por número de celda: sin él, dos celdas con el mismo
    // porcentaje podrían intercambiarse entre renders y el top 3 "bailaría".
    .sort((a, b) => b.percentage - a.percentage || a.block - b.block)
    .slice(0, RANKING_SIZE);

  return { totalResponses: total, heatmap, ranking };
}
