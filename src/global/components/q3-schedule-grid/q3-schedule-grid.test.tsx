import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Q3ScheduleGrid, type Q3ScheduleGridRow } from './q3-schedule-grid';

const ROWS: Q3ScheduleGridRow[] = [
  { label: '08:15', sublabel: '09:25' },
  { label: 'Vespertino' },
];
const COLUMNS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

describe('Q3ScheduleGrid', () => {
  it('calcula la celda 1-based fila×columnas+columna+1 al hacer clic (Escenario 4)', () => {
    const onToggle = vi.fn();
    render(<Q3ScheduleGrid rows={ROWS} columns={COLUMNS} selected={new Set()} onToggle={onToggle} />);

    // Fila 0 (08:15–09:25), columna 2 (Miércoles) → celda 0*5 + 2 + 1 = 3.
    screen.getByRole('button', { name: 'Miércoles, 08:15 – 09:25' }).click();
    expect(onToggle).toHaveBeenCalledWith(3);

    // Fila 1 (Vespertino), columna 4 (Viernes) → celda 1*5 + 4 + 1 = 10.
    screen.getByRole('button', { name: 'Viernes, Vespertino' }).click();
    expect(onToggle).toHaveBeenCalledWith(10);
  });

  it('una celda en `selected` se renderiza ocupada (icono + aria-pressed) y una libre no', () => {
    render(
      <Q3ScheduleGrid rows={ROWS} columns={COLUMNS} selected={new Set([3])} onToggle={vi.fn()} />,
    );

    const occupied = screen.getByRole('button', { name: 'Miércoles, 08:15 – 09:25' });
    expect(occupied).toHaveAttribute('aria-pressed', 'true');
    expect(occupied.querySelector('svg')).toBeInTheDocument();

    const free = screen.getByRole('button', { name: 'Lunes, 08:15 – 09:25' });
    expect(free).toHaveAttribute('aria-pressed', 'false');
    expect(free.querySelector('svg')).not.toBeInTheDocument();
  });

  it('clic de nuevo en una celda ocupada la vuelve a libre (Escenario 4, vía el padre controlando `selected`)', () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <Q3ScheduleGrid rows={ROWS} columns={COLUMNS} selected={new Set([3])} onToggle={onToggle} />,
    );

    screen.getByRole('button', { name: 'Miércoles, 08:15 – 09:25' }).click();
    expect(onToggle).toHaveBeenCalledWith(3);

    rerender(<Q3ScheduleGrid rows={ROWS} columns={COLUMNS} selected={new Set()} onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: 'Miércoles, 08:15 – 09:25' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('con disabled: true ninguna celda dispara onToggle', () => {
    const onToggle = vi.fn();
    render(<Q3ScheduleGrid rows={ROWS} columns={COLUMNS} selected={new Set()} onToggle={onToggle} disabled />);

    screen.getByRole('button', { name: 'Lunes, 08:15 – 09:25' }).click();
    expect(onToggle).not.toHaveBeenCalled();
  });
});
