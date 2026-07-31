import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Q3CodeInput } from './q3-code-input';

describe('Q3CodeInput', () => {
  it('renderiza 6 celdas por defecto', () => {
    render(<Q3CodeInput value="" onChange={vi.fn()} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('escribir en una celda avanza el foco a la siguiente y reporta el valor completo', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Q3CodeInput value="" onChange={onChange} />);
    const cells = screen.getAllByRole('textbox');

    await userEvent.type(cells[0]!, 'A');
    expect(onChange).toHaveBeenCalledWith('A');

    rerender(<Q3CodeInput value="A" onChange={onChange} />);
    const cellsAfter = screen.getAllByRole('textbox');
    expect(cellsAfter[1]).toHaveFocus();
  });

  it('aplica el estado de error a las celdas', () => {
    render(<Q3CodeInput value="ABCDEF" onChange={vi.fn()} hasError />);
    const cells = screen.getAllByRole('textbox');
    for (const cell of cells) {
      expect(cell).toHaveAttribute('aria-invalid', 'true');
    }
  });
});
