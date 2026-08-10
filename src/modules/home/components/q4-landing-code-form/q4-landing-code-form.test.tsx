import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { findByCode: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { Q4LandingCodeForm } from './q4-landing-code-form';

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    code: 'EDS101',
    name: 'Estructuras de Datos · Secc 1',
    subject: 'Estructuras de Datos',
    section: 'Secc 1',
    createdBy: 'helper-1',
    createdAt: new Date('2026-01-01'),
    status: 'active',
    helperBlockedSlots: [],
    ...overrides,
  };
}

/** Sonda de destino: imprime la URL para poder afirmar los query params. */
function AccessProbe() {
  const { pathname, search } = useLocation();
  return <p>{`destino: ${pathname}${search}`}</p>;
}

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Q4LandingCodeForm />} />
          <Route path="/acceso" element={<AccessProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Q4LandingCodeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con menos de 6 caracteres "Entrar" está deshabilitado y no consulta Firestore', async () => {
    renderForm();
    const button = screen.getByRole('button', { name: 'Entrar' });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Código de sala'), 'EDS10');

    expect(button).toBeDisabled();
    expect(RoomRepository.findByCode).not.toHaveBeenCalled();
  });

  it('código válido → navega a /acceso?tipo=alumno&codigo=EDS101 (Escenario 2)', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(makeRoom());

    renderForm();
    await userEvent.type(screen.getByLabelText('Código de sala'), 'EDS101');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(screen.getByText('destino: /acceso?tipo=alumno&codigo=EDS101')).toBeInTheDocument(),
    );
  });

  it('normaliza a mayúsculas lo que se escribe en minúscula', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(makeRoom());

    renderForm();
    const input = screen.getByLabelText('Código de sala');
    await userEvent.type(input, 'eds101');

    expect(input).toHaveValue('EDS101');
  });

  it('código inexistente → mensaje de error y no navega (Escenario 3)', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(null);

    renderForm();
    await userEvent.type(screen.getByLabelText('Código de sala'), 'ZZZZZZ');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Código inválido. Revisa con tu ayudante',
      ),
    );
    expect(screen.queryByText(/^destino:/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Código de sala')).toHaveAttribute('aria-invalid', 'true');
  });

  it('una falla de red muestra el mismo mensaje que un código inválido (§4)', async () => {
    vi.mocked(RoomRepository.findByCode).mockRejectedValue(
      new FirebaseError('unavailable', 'Network error'),
    );

    renderForm();
    await userEvent.type(screen.getByLabelText('Código de sala'), 'EDS101');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Código inválido. Revisa con tu ayudante',
      ),
    );
  });

  it('mientras valida deja el botón en carga y no admite doble submit', async () => {
    vi.mocked(RoomRepository.findByCode).mockReturnValue(new Promise(() => undefined));

    renderForm();
    await userEvent.type(screen.getByLabelText('Código de sala'), 'EDS101');
    const button = screen.getByRole('button', { name: 'Entrar' });
    await userEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    expect(screen.getByLabelText('Código de sala')).toBeDisabled();

    await userEvent.click(button);

    expect(RoomRepository.findByCode).toHaveBeenCalledTimes(1);
  });

  it('con el código de una sala cerrada navega igual, sin error propio (D4)', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(
      makeRoom({ code: 'CLOSED', status: 'closed' }),
    );

    renderForm();
    await userEvent.type(screen.getByLabelText('Código de sala'), 'CLOSED');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(screen.getByText('destino: /acceso?tipo=alumno&codigo=CLOSED')).toBeInTheDocument(),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
