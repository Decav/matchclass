import type { ScheduleBlock } from '@resources/entities/schedule-block.entity';

/**
 * Matriz de horarios USM (docs/tech-document.md §2.4, tabla completa).
 * 10 bloques, aplican igual todos los días Lunes–Viernes. Diferida desde
 * RC-001 por la contradicción de rango entre `tech-document.md` (20×5) y
 * HU-08 (10×5), ya resuelta antes de RC-010: el rango real es 1–50.
 *
 * El bloque 11-12 (`blockNumber: 6`) es el único con horario más corto
 * (16:15–17:15, 60 min) que el resto (70 min) — así está en la tabla fuente,
 * no es un error de transcripción.
 */
export const USM_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  {
    blockNumber: 1,
    displayName: 'Bloque 1-2',
    modules: 'Módulos 1 y 2',
    startTime: '08:15',
    endTime: '09:25',
    isVespertine: false,
  },
  {
    blockNumber: 2,
    displayName: 'Bloque 3-4',
    modules: 'Módulos 3 y 4',
    startTime: '09:40',
    endTime: '10:50',
    isVespertine: false,
  },
  {
    blockNumber: 3,
    displayName: 'Bloque 5-6',
    modules: 'Módulos 5 y 6',
    startTime: '11:05',
    endTime: '12:15',
    isVespertine: false,
  },
  {
    blockNumber: 4,
    displayName: 'Bloque 7-8',
    modules: 'Módulos 7 y 8',
    startTime: '12:30',
    endTime: '13:40',
    isVespertine: false,
  },
  {
    blockNumber: 5,
    displayName: 'Bloque 9-10',
    modules: 'Módulos 9 y 10',
    startTime: '14:40',
    endTime: '15:50',
    isVespertine: false,
  },
  {
    blockNumber: 6,
    displayName: 'Bloque 11-12',
    modules: 'Módulos 11 y 12',
    startTime: '16:15',
    endTime: '17:15',
    isVespertine: false,
  },
  {
    blockNumber: 7,
    displayName: 'Bloque 13-14',
    modules: 'Módulos 13 y 14',
    startTime: '17:30',
    endTime: '18:40',
    isVespertine: false,
  },
  {
    blockNumber: 8,
    displayName: 'Bloque 15-16',
    modules: 'Módulos 15 y 16',
    startTime: '18:50',
    endTime: '20:00',
    isVespertine: false,
  },
  {
    blockNumber: 9,
    displayName: 'Bloque 17-18',
    modules: 'Módulos 17 y 18',
    startTime: null,
    endTime: null,
    isVespertine: true,
  },
  {
    blockNumber: 10,
    displayName: 'Bloque 19-20',
    modules: 'Módulos 19 y 20',
    startTime: null,
    endTime: null,
    isVespertine: true,
  },
];

/** Días de la matriz, en orden de columna (columna 0 = Lunes ... 4 = Viernes). */
export const USM_SCHEDULE_DAYS: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
