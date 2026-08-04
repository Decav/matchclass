import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@global/providers/theme-provider';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { listByOwner: vi.fn(), findByCode: vi.fn() },
}));
vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { countByRoom: vi.fn(), getMine: vi.fn(), submit: vi.fn() },
}));
vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { logout: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { AuthRepository } from '@library/repositories/auth.repository';
import { PaDashboard } from './pa-dashboard';

function makeRoom(overrides: Partial<Room>): Room {
  return {
    id: 'r1',
    code: 'ABC123',
    name: 'Sala de prueba',
    subject: 'Materia',
    section: 'Secc 1',
    createdBy: 'u1',
    createdAt: new Date('2026-01-01'),
    status: 'active',
    helperBlockedSlots: [],
    ...overrides,
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <PaDashboard />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('PaDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'u1',
        email: 'ayudante@matchclass.cl',
        displayName: 'Ayudante Test',
        role: 'helper',
        createdAt: null,
      },
      status: AuthStatus.Authenticated,
    });
  });

  it('con isLoading: true renderiza skeletons, no las listas reales (Escenario 3)', () => {
    vi.mocked(RoomRepository.listByOwner).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByRole('status', { name: 'Cargando tus salas' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mis salas' })).not.toBeInTheDocument();
  });

  it('con isError: true muestra el estado de error y "Intentar de nuevo" reintenta (Escenario 4)', async () => {
    vi.mocked(RoomRepository.listByOwner).mockRejectedValueOnce(new Error('network')).mockResolvedValue([]);
    const user = userEvent.setup();

    renderPage();

    await waitFor(() => expect(screen.getByText('No se pudieron cargar tus salas')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));

    await waitFor(() => expect(screen.getByText('Aún no tienes salas')).toBeInTheDocument());
    expect(RoomRepository.listByOwner).toHaveBeenCalledTimes(2);
  });

  it('con data: [] muestra el empty state con "Crear primera sala" (Escenario 2)', async () => {
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue([]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Aún no tienes salas')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Crear primera sala' })).toHaveAttribute('href', '/salas/nueva');
  });

  it('con datos muestra KPIs correctos, salas activas con progreso y pasadas con badge "Cerrada" (Escenario 1)', async () => {
    const rooms: Room[] = [
      makeRoom({
        id: 'active-1',
        status: 'active',
        code: 'ABC123',
        name: 'Sala Activa',
        createdAt: new Date('2026-01-10'),
        studentLimit: 20,
      }),
      makeRoom({
        id: 'closed-1',
        status: 'closed',
        code: 'CLS999',
        name: 'Sala Cerrada',
        createdAt: new Date('2026-01-01'),
      }),
    ];
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue(rooms);
    vi.mocked(ResponseRepository.countByRoom).mockImplementation((roomId) =>
      Promise.resolve(roomId === 'active-1' ? 5 : 0),
    );

    renderPage();

    await waitFor(() => expect(screen.getByText('Sala Activa')).toBeInTheDocument());
    expect(screen.getByText('Sala Cerrada')).toBeInTheDocument();
    expect(screen.getByText('Cerrada')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByText('5/20 alumnos respondieron')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    const kpiCards = document.querySelectorAll('.mc-kpi-card__value');
    const kpiValues = Array.from(kpiCards).map((el) => el.textContent);
    expect(kpiValues).toEqual(['2', '5', '1']);
  });

  it('el sidebar muestra nombre/email/inicial y "Cerrar sesión" dispara useLogoutMutation (Escenario 1/6)', async () => {
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue([]);
    vi.mocked(AuthRepository.logout).mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderPage();

    expect(screen.getByText('Ayudante Test')).toBeInTheDocument();
    expect(screen.getByText('ayudante@matchclass.cl')).toBeInTheDocument();
    expect(screen.getByText('AT')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => expect(AuthRepository.logout).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(useAuthStore.getState().status).toBe(AuthStatus.Unauthenticated));
  });

  it('el nav "Próximamente" se renderiza deshabilitado, sin ruta ni onClick (RC-008 §10)', async () => {
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue([]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Aún no tienes salas')).toBeInTheDocument());

    const proximamente = screen.getByText('Próximamente');
    expect(proximamente.closest('a')).toBeNull();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Mis salas' })).toHaveAttribute('href', '/dashboard');
  });

  it('"Nueva sala" navega a la ruta placeholder de creación (Escenario 5)', async () => {
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue([makeRoom({ id: 'r1' })]);
    vi.mocked(ResponseRepository.countByRoom).mockResolvedValue(0);

    renderPage();

    await waitFor(() => expect(screen.getByRole('link', { name: 'Nueva sala' })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Nueva sala' })).toHaveAttribute('href', '/salas/nueva');
  });
});
