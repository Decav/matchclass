import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { RoomCodeGenerationError } from '@resources/errors/room-code-generation.error';
import { Q4CreateRoomForm } from './q4-create-room-form';

vi.mock('@library/services/room.service', () => ({
  RoomService: { createRoom: vi.fn() },
}));

import { RoomService } from '@library/services/room.service';

function renderForm(onSuccess = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return {
    onSuccess,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/salas/nueva']}>
          <Routes>
            <Route path="/salas/nueva" element={<Q4CreateRoomForm onSuccess={onSuccess} />} />
            <Route path="/dashboard" element={<p>Dashboard</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}

async function fillAllFields() {
  await userEvent.type(screen.getByLabelText('Nombre de la sala'), 'Estructuras de Datos - Secc 1');
  await userEvent.type(screen.getByLabelText('Asignatura'), 'Estructuras de Datos');
  await userEvent.type(screen.getByLabelText('Sección'), '1');
}

describe('Q4CreateRoomForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'helper-1', email: 'a@matchclass.cl', displayName: 'Ayudante', role: 'helper', createdAt: null },
      status: AuthStatus.Authenticated,
    });
  });

  it('deshabilita "Crear sala" mientras algún campo esté vacío (Escenario 1)', async () => {
    renderForm();
    const button = screen.getByRole('button', { name: 'Crear sala' });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Nombre de la sala'), 'Sala');
    expect(button).toBeDisabled();

    await fillAllFields();
    expect(button).toBeEnabled();
  });

  it('campos vacíos al enviar muestran "Este campo es obligatorio" en los tres (Escenario 2)', async () => {
    const { container } = renderForm();

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getAllByText('Este campo es obligatorio')).toHaveLength(3);
    });
    expect(RoomService.createRoom).not.toHaveBeenCalled();
  });

  it('durante el envío muestra spinner y deshabilita los campos (Escenario 1)', async () => {
    let resolveCreate: (value: { id: string; code: string }) => void = () => {};
    vi.mocked(RoomService.createRoom).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );

    renderForm();
    await fillAllFields();
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre de la sala')).toBeDisabled();
    });
    expect(screen.getByLabelText('Asignatura')).toBeDisabled();
    expect(screen.getByLabelText('Sección')).toBeDisabled();

    resolveCreate({ id: 'room-1', code: 'ABCDEF' });
  });

  it('"Cancelar" navega a /dashboard sin llamar a RoomService (Escenario 3)', async () => {
    renderForm();
    await fillAllFields();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    expect(RoomService.createRoom).not.toHaveBeenCalled();
  });

  it('en éxito, llama a onSuccess con id/name/code', async () => {
    vi.mocked(RoomService.createRoom).mockResolvedValue({ id: 'room-1', code: 'ABCDEF' });
    const onSuccess = vi.fn();
    renderForm(onSuccess);

    await fillAllFields();
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        id: 'room-1',
        name: 'Estructuras de Datos - Secc 1',
        code: 'ABCDEF',
      });
    });
  });

  it('ante un error de red muestra el mensaje, reactiva el botón, y no pierde los valores (Escenario 7)', async () => {
    vi.mocked(RoomService.createRoom).mockRejectedValue(
      new FirebaseError('unavailable', 'Network error'),
    );

    renderForm();
    await fillAllFields();
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión. Intenta de nuevo');
    });
    expect(screen.getByRole('button', { name: 'Crear sala' })).toBeEnabled();
    expect(screen.getByLabelText('Nombre de la sala')).toHaveValue('Estructuras de Datos - Secc 1');
    expect(screen.getByLabelText('Asignatura')).toHaveValue('Estructuras de Datos');
    expect(screen.getByLabelText('Sección')).toHaveValue('1');
  });

  it('ante RoomCodeGenerationError muestra el mismo mensaje que un error de red', async () => {
    vi.mocked(RoomService.createRoom).mockRejectedValue(new RoomCodeGenerationError());

    renderForm();
    await fillAllFields();
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión. Intenta de nuevo');
    });
  });
});
