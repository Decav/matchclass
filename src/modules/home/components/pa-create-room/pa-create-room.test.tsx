import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@global/providers/theme-provider';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { PaCreateRoom } from './pa-create-room';

vi.mock('@library/services/room.service', () => ({
  RoomService: { createRoom: vi.fn() },
}));
vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { logout: vi.fn() },
}));

import { RoomService } from '@library/services/room.service';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/salas/nueva']}>
          <Routes>
            <Route path="/salas/nueva" element={<PaCreateRoom />} />
            <Route path="/dashboard" element={<p>Dashboard placeholder</p>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

async function fillAllFields() {
  await userEvent.type(screen.getByLabelText('Nombre de la sala'), 'Estructuras de Datos - Secc 1');
  await userEvent.type(screen.getByLabelText('Asignatura'), 'Estructuras de Datos');
  await userEvent.type(screen.getByLabelText('Sección'), '1');
}

describe('PaCreateRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'helper-1', email: 'a@matchclass.cl', displayName: 'Ayudante Test', role: 'helper', createdAt: null },
      status: AuthStatus.Authenticated,
    });
  });

  it('empieza en el paso "form", con "Nueva sala" en la topbar', () => {
    renderPage();

    expect(screen.getByText('Nueva sala')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Crear nueva sala' })).toBeInTheDocument();
  });

  it('en éxito, pasa al paso "confirmación" con "Sala creada" en la topbar (Escenario 1)', async () => {
    vi.mocked(RoomService.createRoom).mockResolvedValue({ id: 'room-1', code: 'ABCDEF' });

    renderPage();
    await fillAllFields();
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '¡Sala creada!' })).toBeInTheDocument();
    });
    expect(screen.getByText('Sala creada')).toBeInTheDocument();
    expect(screen.getByText('Estructuras de Datos - Secc 1')).toBeInTheDocument();
    expect(screen.getByText('ABCDEF')).toBeInTheDocument();
  });

  it('desde la confirmación, "Ir al dashboard" navega a /dashboard', async () => {
    vi.mocked(RoomService.createRoom).mockResolvedValue({ id: 'room-1', code: 'ABCDEF' });

    renderPage();
    await fillAllFields();
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: '¡Sala creada!' })).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Ir al dashboard' }));

    await waitFor(() => expect(screen.getByText('Dashboard placeholder')).toBeInTheDocument());
  });
});
