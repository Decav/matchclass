import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Q2ConfirmDialog } from './q2-confirm-dialog';

const onConfirm = vi.fn();
const onCancel = vi.fn();

function renderDialog(props: Partial<Parameters<typeof Q2ConfirmDialog>[0]> = {}) {
  return render(
    <Q2ConfirmDialog
      open
      title="¿Eliminar esta sala?"
      message="Esta acción no se puede deshacer"
      confirmLabel="Eliminar"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
}

describe('Q2ConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con open: false no renderiza nada', () => {
    renderDialog({ open: false });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renderiza título, mensaje y ambos botones según las props', () => {
    renderDialog();

    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('¿Eliminar esta sala?');
    expect(screen.getByText('Esta acción no se puede deshacer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('"Cancelar" llama a onCancel y no a onConfirm', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('el botón de acción llama a onConfirm', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('confirmVariant "danger" pinta el botón en rojo y "primary" en navy', () => {
    const { rerender } = renderDialog({ confirmVariant: 'danger' });
    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveClass('mc-dialog__btn--danger');

    rerender(
      <Q2ConfirmDialog
        open
        title="¿Cerrar esta sala?"
        message="No se aceptarán más respuestas de alumnos"
        confirmLabel="Cerrar sala"
        confirmVariant="primary"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('button', { name: 'Cerrar sala' })).toHaveClass('mc-dialog__btn--primary');
  });

  it('Escape cancela sin confirmar', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('el foco inicial va a "Cancelar", no al botón de acción', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('con pending: true deshabilita ambos botones', () => {
    renderDialog({ pending: true });

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
  });
});
