import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@global/providers/theme-provider';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { listByOwner: vi.fn(), findByCode: vi.fn(), updateStatus: vi.fn() },
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

/**
 * RC-012 (HU-10): las tres acciones de ciclo de vida, ejercidas sobre el
 * dashboard completo — es `Q4DashboardRooms` quien decide si media un
 * diálogo y quien dispara la mutación, así que el flujo solo se ve entero
 * desde acá.
 */
describe('PaDashboard — ciclo de vida de la sala (RC-012)', () => {
  const activeRoom = makeRoom({ id: 'active-1', status: 'active', name: 'Sala Activa' });
  const closedRoom = makeRoom({
    id: 'closed-1',
    status: 'closed',
    name: 'Sala Cerrada',
    code: 'CLS999',
    createdAt: new Date('2026-01-01'),
  });

  async function openMenu(roomName: string) {
    const user = userEvent.setup();
    await waitFor(() => expect(screen.getByText(roomName)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: `Acciones de ${roomName}` }));
    return user;
  }

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
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue([activeRoom, closedRoom]);
    vi.mocked(ResponseRepository.countByRoom).mockResolvedValue(0);
    vi.mocked(RoomRepository.updateStatus).mockResolvedValue(undefined);
  });

  it('cerrar sala: confirma en el diálogo y escribe status "closed" (Escenario 1)', async () => {
    renderPage();
    const user = await openMenu('Sala Activa');

    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sala' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveAccessibleName('¿Cerrar esta sala?');
    expect(screen.getByText('No se aceptarán más respuestas de alumnos')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Cerrar sala' }));

    await waitFor(() => expect(RoomRepository.updateStatus).toHaveBeenCalledWith('active-1', 'closed'));
  });

  it('reabrir sala: escribe status "active" sin mostrar ningún diálogo (Escenario 3)', async () => {
    renderPage();
    const user = await openMenu('Sala Cerrada');

    await user.click(screen.getByRole('menuitem', { name: 'Reabrir sala' }));

    await waitFor(() => expect(RoomRepository.updateStatus).toHaveBeenCalledWith('closed-1', 'active'));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('eliminar sala: confirma la advertencia y escribe status "archived" (Escenario 4)', async () => {
    renderPage();
    const user = await openMenu('Sala Activa');

    await user.click(screen.getByRole('menuitem', { name: 'Eliminar sala' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveAccessibleName('¿Eliminar esta sala?');
    expect(screen.getByText('Esta acción no se puede deshacer')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(RoomRepository.updateStatus).toHaveBeenCalledWith('active-1', 'archived'));
  });

  it('cancelar el diálogo no escribe nada en Firestore', async () => {
    renderPage();
    const user = await openMenu('Sala Activa');

    await user.click(screen.getByRole('menuitem', { name: 'Eliminar sala' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(RoomRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('una sala archived no se muestra en ninguna sección del dashboard (Escenario 4)', async () => {
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue([
      activeRoom,
      makeRoom({ id: 'archived-1', status: 'archived', name: 'Sala Eliminada', code: 'ARC001' }),
    ]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Sala Activa')).toBeInTheDocument());
    expect(screen.queryByText('Sala Eliminada')).not.toBeInTheDocument();
    // Tampoco cuenta para los KPIs: 1 sala total, 1 activa.
    const kpiValues = Array.from(document.querySelectorAll('.mc-kpi-card__value')).map((el) => el.textContent);
    expect(kpiValues).toEqual(['1', '0', '1']);
  });

  it('un fallo de red muestra el toast de error y deja la sala como estaba (RC-012 §4)', async () => {
    vi.mocked(RoomRepository.updateStatus).mockRejectedValue(new Error('unavailable'));

    renderPage();
    const user = await openMenu('Sala Cerrada');

    await user.click(screen.getByRole('menuitem', { name: 'Reabrir sala' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo actualizar la sala. Intenta de nuevo'),
    );
    expect(screen.getByText('Sala Cerrada')).toBeInTheDocument();
  });
});
