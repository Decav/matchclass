import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatmapStatus } from '@resources/enums/heatmap-status.enum';
import type { HeatmapEntry } from '@resources/types/heatmap-entry.type';
import { Q2RankingItem } from './q2-ranking-item';

function makeEntry(overrides: Partial<HeatmapEntry> = {}): HeatmapEntry {
  return {
    block: 23,
    day: 'Martes',
    timeRange: '14:40 – 15:50',
    blockLabel: '9-10',
    available: 32,
    total: 35,
    percentage: 91.428,
    status: HeatmapStatus.High,
    ...overrides,
  };
}

describe('Q2RankingItem', () => {
  it('muestra posición, día + bloque, horario, alumnos y porcentaje redondeado', () => {
    render(<Q2RankingItem entry={makeEntry()} position={1} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Martes 9-10')).toBeInTheDocument();
    expect(screen.getByText('14:40 – 15:50 · 32/35 alumnos')).toBeInTheDocument();
    expect(screen.getByText('91%')).toBeInTheDocument();
  });

  it('el badge de posición y el de porcentaje toman el color del status, no del puesto (D4)', () => {
    const { container } = render(
      <Q2RankingItem entry={makeEntry({ percentage: 80, status: HeatmapStatus.High })} position={3} />,
    );

    // 80% ≥ 70% ⇒ high (verde), aunque el frame dibuje el #3 en ámbar.
    expect(container.querySelector('.mc-ranking-item__rank')).toHaveClass('mc-ranking-item__rank--high');
    expect(container.querySelector('.mc-ranking-item__pct')).toHaveClass('mc-ranking-item__pct--high');
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('un slot de categoría media se pinta con las clases de medium', () => {
    const { container } = render(
      <Q2RankingItem entry={makeEntry({ percentage: 55, status: HeatmapStatus.Medium })} position={2} />,
    );

    expect(container.querySelector('.mc-ranking-item__rank')).toHaveClass('mc-ranking-item__rank--medium');
    expect(screen.getByText('55%')).toBeInTheDocument();
  });

  it('los bloques vespertinos muestran "Vespertino" como horario', () => {
    render(<Q2RankingItem entry={makeEntry({ timeRange: 'Vespertino', blockLabel: '19-20' })} position={1} />);

    expect(screen.getByText('Vespertino · 32/35 alumnos')).toBeInTheDocument();
  });
});
