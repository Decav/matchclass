import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Q2RoomActionsMenu } from './q2-room-actions-menu';

const onSelect = vi.fn();

function renderMenu(status: 'active' | 'closed') {
  return render(<Q2RoomActionsMenu status={status} roomName="Cálculo I" onSelect={onSelect} />);
}

describe('Q2RoomActionsMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('arranca cerrado: el menú no está en el DOM', () => {
    renderMenu('active');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acciones de Cálculo I' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('sala activa ofrece "Cerrar sala" y "Eliminar sala", nunca "Reabrir sala"', async () => {
    const user = userEvent.setup();
    renderMenu('active');

    await user.click(screen.getByRole('button', { name: 'Acciones de Cálculo I' }));

    expect(screen.getByRole('menuitem', { name: 'Cerrar sala' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Eliminar sala' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Reabrir sala' })).not.toBeInTheDocument();
  });

  it('sala cerrada ofrece "Reabrir sala" y "Eliminar sala", nunca "Cerrar sala"', async () => {
    const user = userEvent.setup();
    renderMenu('closed');

    await user.click(screen.getByRole('button', { name: 'Acciones de Cálculo I' }));

    expect(screen.getByRole('menuitem', { name: 'Reabrir sala' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Eliminar sala' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Cerrar sala' })).not.toBeInTheDocument();
  });

  it('elegir una opción reporta la acción y cierra el menú', async () => {
    const user = userEvent.setup();
    renderMenu('closed');

    await user.click(screen.getByRole('button', { name: 'Acciones de Cálculo I' }));
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar sala' }));

    expect(onSelect).toHaveBeenCalledWith('delete');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('un clic fuera cierra el menú sin reportar ninguna acción', async () => {
    const user = userEvent.setup();
    renderMenu('active');

    await user.click(screen.getByRole('button', { name: 'Acciones de Cálculo I' }));
    await user.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('Escape cierra el menú sin reportar ninguna acción', async () => {
    const user = userEvent.setup();
    renderMenu('active');

    await user.click(screen.getByRole('button', { name: 'Acciones de Cálculo I' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
