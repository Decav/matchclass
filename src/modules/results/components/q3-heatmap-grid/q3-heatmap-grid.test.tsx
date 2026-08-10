import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buildRoomResult } from '../../core/utils/build-room-result';
import type { Response } from '@resources/entities/response.entity';
import { Q3HeatmapGrid } from './q3-heatmap-grid';

function makeResponses(occupiedBlocks: number[], count: number): Response[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `uid-${i}`,
    roomId: 'room-1',
    studentName: `Alumno ${i}`,
    occupiedBlocks,
    createdByUid: `uid-${i}`,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }));
}

describe('Q3HeatmapGrid', () => {
  it('renderiza las 50 celdas con su porcentaje como texto (el color no es el único canal)', () => {
    const { heatmap } = buildRoomResult(makeResponses([], 10), []);
    const { container } = render(<Q3HeatmapGrid heatmap={heatmap} />);

    expect(container.querySelectorAll('.mc-heatmap__cell')).toHaveLength(50);
    expect(screen.getAllByText('100%')).toHaveLength(50);
  });

  it('las celdas bloqueadas muestran un guion y la clase de bloqueado, no su porcentaje', () => {
    const { heatmap } = buildRoomResult(makeResponses([], 10), [4, 23, 33]);
    const { container } = render(<Q3HeatmapGrid heatmap={heatmap} />);

    expect(screen.getAllByText('—')).toHaveLength(3);
    expect(container.querySelectorAll('.mc-heatmap__cell--blocked')).toHaveLength(3);
    expect(screen.getAllByText('100%')).toHaveLength(47);
  });

  it('cada celda lleva un aria-label con día, horario y disponibilidad', () => {
    const { heatmap } = buildRoomResult(makeResponses([1], 4), []);
    render(<Q3HeatmapGrid heatmap={heatmap} />);

    expect(
      screen.getByLabelText('Lunes, 08:15 – 09:25: 0% disponible, 0 de 4 alumnos'),
    ).toBeInTheDocument();
  });

  it('la celda bloqueada anuncia "bloqueado" en vez de un porcentaje', () => {
    const { heatmap } = buildRoomResult(makeResponses([], 4), [1]);
    render(<Q3HeatmapGrid heatmap={heatmap} />);

    expect(screen.getByLabelText('Lunes, 08:15 – 09:25: bloqueado')).toBeInTheDocument();
  });

  it('pinta cada celda con la clase de su categoría', () => {
    // 1 de 4 alumnos ocupa la celda 1 → 75% (high); todos ocupan la 2 → 0% (conflict).
    const responses: Response[] = [
      ...makeResponses([1, 2], 1),
      ...makeResponses([2], 3),
    ];
    const { heatmap } = buildRoomResult(responses, []);
    const { container } = render(<Q3HeatmapGrid heatmap={heatmap} />);

    const cells = container.querySelectorAll('.mc-heatmap__cell');
    expect(cells[0]).toHaveClass('mc-heatmap__cell--high');
    expect(cells[1]).toHaveClass('mc-heatmap__cell--conflict');
  });

  it('la leyenda lista los cinco estados con sus umbrales', () => {
    const { heatmap } = buildRoomResult(makeResponses([], 1), []);
    render(<Q3HeatmapGrid heatmap={heatmap} />);

    for (const label of ['≥70% disponible', '40-69%', '10-39%', '<10% conflicto', 'Bloqueado']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renderiza las cabeceras de día y la columna de horarios USM', () => {
    const { heatmap } = buildRoomResult(makeResponses([], 1), []);
    render(<Q3HeatmapGrid heatmap={heatmap} />);

    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Viernes')).toBeInTheDocument();
    expect(screen.getByText('08:15')).toBeInTheDocument();
    // Los dos últimos bloques no tienen horario: se rotulan "Vespertino".
    expect(screen.getAllByText('Vespertino')).toHaveLength(2);
  });
});
