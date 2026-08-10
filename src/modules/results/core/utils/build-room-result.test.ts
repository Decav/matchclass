import { describe, it, expect } from 'vitest';
import type { Response } from '@resources/entities/response.entity';
import { buildRoomResult } from './build-room-result';

function makeResponse(occupiedBlocks: number[], index = 0): Response {
  return {
    id: `uid-${index}`,
    roomId: 'room-1',
    studentName: `Alumno ${index}`,
    occupiedBlocks,
    createdByUid: `uid-${index}`,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

/** N respuestas que ocupan `occupiedBlocks`, más `free` respuestas sin nada ocupado. */
function makeResponses(occupying: number, occupiedBlocks: number[], free: number): Response[] {
  return [
    ...Array.from({ length: occupying }, (_, i) => makeResponse(occupiedBlocks, i)),
    ...Array.from({ length: free }, (_, i) => makeResponse([], occupying + i)),
  ];
}

function entry(result: ReturnType<typeof buildRoomResult>, block: number) {
  const found = result.heatmap.find((e) => e.block === block);
  if (!found) throw new Error(`La celda ${block} no está en el heatmap`);
  return found;
}

describe('buildRoomResult', () => {
  it('cuenta como disponibles a los alumnos que NO tienen la celda ocupada (Escenario 1)', () => {
    // 10 alumnos ocupan la celda 7, 25 la tienen libre → 25/35.
    const result = buildRoomResult(makeResponses(10, [7], 25), []);

    expect(result.totalResponses).toBe(35);
    expect(result.heatmap).toHaveLength(50);
    expect(entry(result, 7).available).toBe(25);
    expect(entry(result, 7).total).toBe(35);
    expect(entry(result, 7).percentage).toBeCloseTo(71.43, 2);
  });

  it('las celdas de helperBlockedSlots quedan blocked aunque estén al 100% (Escenario 1)', () => {
    const result = buildRoomResult(makeResponses(0, [], 35), [4, 23, 33]);

    for (const cell of [4, 23, 33]) {
      expect(entry(result, cell).status).toBe('blocked');
      // El porcentaje real se conserva; lo que cambia es la categoría.
      expect(entry(result, cell).percentage).toBe(100);
    }
    expect(result.heatmap.filter((e) => e.status === 'blocked')).toHaveLength(3);
  });

  it('aplica los umbrales exactos sobre el porcentaje sin redondear', () => {
    // 1000 respuestas para poder fabricar porcentajes con un decimal.
    const cases: [number, string][] = [
      [700, 'high'], // 70.0%
      [699, 'medium'], // 69.9%
      [400, 'medium'], // 40.0%
      [399, 'low'], // 39.9%
      [100, 'low'], // 10.0%
      [99, 'conflict'], // 9.9%
    ];

    for (const [available, expected] of cases) {
      const result = buildRoomResult(makeResponses(1000 - available, [1], available), []);
      expect(`${available} → ${entry(result, 1).status}`).toBe(`${available} → ${expected}`);
    }
  });

  it('una celda que nadie ocupa da 100% y high (Escenario 5)', () => {
    const result = buildRoomResult(makeResponses(0, [], 12), []);

    expect(entry(result, 42).percentage).toBe(100);
    expect(entry(result, 42).status).toBe('high');
  });

  it('una celda que todos ocupan da 0% y conflict (Escenario 6)', () => {
    const result = buildRoomResult(makeResponses(12, [42], 0), []);

    expect(entry(result, 42).percentage).toBe(0);
    expect(entry(result, 42).status).toBe('conflict');
  });

  it('el ranking excluye las bloqueadas aunque tengan el porcentaje más alto (Escenario 2)', () => {
    // La celda 1 está libre para todos (100%) pero bloqueada por el ayudante.
    const responses = [makeResponse([2, 3, 4], 0), makeResponse([2, 3], 1)];
    const result = buildRoomResult(responses, [1]);

    expect(result.ranking.map((e) => e.block)).not.toContain(1);
    expect(result.ranking).toHaveLength(3);
  });

  it('ordena el ranking por porcentaje DESC y desempata por celda ASC', () => {
    // Celda 5 ocupada por los 2; celda 3 ocupada por 1; el resto libre.
    const responses = [makeResponse([5, 3], 0), makeResponse([5], 1)];
    const result = buildRoomResult(responses, []);

    // Todas las libres empatan en 100% → ganan las de menor número (1, 2, 4).
    expect(result.ranking.map((e) => e.block)).toEqual([1, 2, 4]);
    expect(result.ranking.every((e) => e.percentage === 100)).toBe(true);
  });

  it('con menos de 3 celdas no bloqueadas devuelve las que haya, sin rellenar', () => {
    const blocked = Array.from({ length: 48 }, (_, i) => i + 3); // bloquea 3..50
    const result = buildRoomResult(makeResponses(0, [], 5), blocked);

    expect(result.ranking.map((e) => e.block)).toEqual([1, 2]);
  });

  it('sin respuestas devuelve todo vacío, sin dividir por cero (Escenario 3)', () => {
    const result = buildRoomResult([], [1, 2]);

    expect(result).toEqual({ totalResponses: 0, heatmap: [], ranking: [] });
  });

  it('cada celda trae el día, el horario y el label de bloque de USM_SCHEDULE_BLOCKS', () => {
    const result = buildRoomResult(makeResponses(0, [], 1), []);

    expect(entry(result, 1)).toMatchObject({
      day: 'Lunes',
      timeRange: '08:15 – 09:25',
      blockLabel: '1-2',
    });
    // Celda 23 → fila 4 (14:40–15:50), columna 2 (Miércoles).
    expect(entry(result, 23)).toMatchObject({ day: 'Miércoles', timeRange: '14:40 – 15:50' });
    // Celda 50 → última fila (vespertina), columna 4 (Viernes).
    expect(entry(result, 50)).toMatchObject({
      day: 'Viernes',
      timeRange: 'Vespertino',
      blockLabel: '19-20',
    });
  });

  it('ignora valores de occupiedBlocks fuera del rango 1–50 sin romper el cálculo', () => {
    const result = buildRoomResult([makeResponse([0, 51, 999, 1])], []);

    expect(entry(result, 1).available).toBe(0);
    expect(result.heatmap).toHaveLength(50);
  });
});
