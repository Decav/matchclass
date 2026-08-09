import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Q2SaveStatus } from './q2-save-status';

describe('Q2SaveStatus', () => {
  it('con state "dirty" muestra el label de cambios pendientes', () => {
    render(<Q2SaveStatus state="dirty" dirtyLabel="Cambios sin guardar" savedLabel="Respuesta guardada" />);

    expect(screen.getByRole('status')).toHaveTextContent('Cambios sin guardar');
    expect(screen.getByRole('status')).toHaveClass('mc-save-status--dirty');
  });

  it('con state "saved" muestra el label de guardado', () => {
    render(<Q2SaveStatus state="saved" dirtyLabel="Cambios sin guardar" savedLabel="Respuesta guardada" />);

    expect(screen.getByRole('status')).toHaveTextContent('Respuesta guardada');
    expect(screen.getByRole('status')).toHaveClass('mc-save-status--saved');
  });

  it('el dot es decorativo: el texto siempre está presente (el color no es el único canal)', () => {
    const { container } = render(
      <Q2SaveStatus state="dirty" dirtyLabel="Cambios sin guardar" savedLabel="Respuesta guardada" />,
    );

    expect(container.querySelector('.mc-save-status__dot')).toHaveAttribute('aria-hidden', 'true');
  });
});
