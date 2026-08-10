import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@global/providers/theme-provider';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import type { Room } from '@resources/entities/room.entity';
import type { Response } from '@resources/entities/response.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { getById: vi.fn() },
}));
vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { listByRoom: vi.fn(), subscribeByRoom: vi.fn() },
}));
vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { logout: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { PaRoomResults } from './pa-room-results';

const ROOM_ID = 'room-1';

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: ROOM_ID,
    code: 'ABC123',
    name: 'Estructuras de Datos · Secc 1',
    subject: 'Materia',
    section: 'Secc 1',
    createdBy: 'helper-1',
    createdAt: new Date('2026-01-01'),
    status: 'active',
    helperBlockedSlots: [],
    ...overrides,
  };
}

function makeResponses(occupiedBlocks: number[], count: number, offset = 0): Response[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `uid-${offset + i}`,
    roomId: ROOM_ID,
    studentName: `Alumno ${offset + i}`,
    occupiedBlocks,
    createdByUid: `uid-${offset + i}`,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }));
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[`/salas/${ROOM_ID}`]}>
          <Routes>
            <Route path="/salas/:roomId" element={<PaRoomResults />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('PaRoomResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'helper-1',
        email: 'ayudante@matchclass.cl',
        displayName: 'Ayudante Test',
        role: 'helper',
        createdAt: null,
      },
      status: AuthStatus.Authenticated,
    });
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom());
    vi.mocked(ResponseRepository.listByRoom).mockResolvedValue([]);
    vi.mocked(ResponseRepository.subscribeByRoom).mockReturnValue(() => undefined);
  });

  it('con datos muestra el heatmap, el conteo y el ranking (Escenarios 1, 2)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [4, 23, 33] }));
    // 1 de 5 ocupa la celda 1 → 80%; el resto de celdas al 100%.
    vi.mocked(ResponseRepository.listByRoom).mockResolvedValue([
      ...makeResponses([1], 1),
      ...makeResponses([], 4, 1),
    ]);

    const { container } = renderPage();

    await waitFor(() => expect(screen.getByText('Mapa de disponibilidad')).toBeInTheDocument());
    expect(screen.getByText('5 alumnos respondieron')).toBeInTheDocument();
    expect(container.querySelectorAll('.mc-heatmap__cell')).toHaveLength(50);
    expect(screen.getAllByText('—')).toHaveLength(3);

    expect(screen.getByText('Top 3 horarios')).toBeInTheDocument();
    expect(container.querySelectorAll('.mc-ranking-item')).toHaveLength(3);
    // Ninguna posición del ranking corresponde a una celda bloqueada: las
    // tres bloqueadas están al 100%, así que encabezarían el orden.
    expect(screen.queryByText('Lunes 1-2')).not.toBeInTheDocument();
  });

  it('el nombre de la sala va en la topbar', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Estructuras de Datos · Secc 1')).toBeInTheDocument());
  });

  it('sin respuestas muestra el empty state y ningún ítem de ranking (Escenario 3)', async () => {
    const { container } = renderPage();

    await waitFor(() => expect(screen.getByText('Nadie respondió todavía')).toBeInTheDocument());
    expect(
      screen.getByText('Comparte el código de la sala con tus alumnos para empezar a ver resultados'),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.mc-ranking-item')).toHaveLength(0);
    expect(container.querySelectorAll('.mc-heatmap__cell')).toHaveLength(0);
  });

  it('un snapshot nuevo recalcula el heatmap sin recargar (Escenario 4)', async () => {
    let push: ((responses: Response[]) => void) | null = null;
    vi.mocked(ResponseRepository.subscribeByRoom).mockImplementation((_roomId, onData) => {
      push = onData;
      return () => undefined;
    });
    vi.mocked(ResponseRepository.listByRoom).mockResolvedValue(makeResponses([], 3));

    renderPage();

    await waitFor(() => expect(screen.getByText('3 alumnos respondieron')).toBeInTheDocument());

    // Llega un alumno nuevo que ocupa la celda 1.
    act(() => push?.([...makeResponses([], 3), ...makeResponses([1], 1, 3)]));

    await waitFor(() => expect(screen.getByText('4 alumnos respondieron')).toBeInTheDocument());
    expect(screen.getByLabelText(/Lunes, 08:15 – 09:25: 75% disponible, 3 de 4 alumnos/)).toBeInTheDocument();
    // Sin lecturas extra: el snapshot ya traía los datos.
    expect(ResponseRepository.listByRoom).toHaveBeenCalledTimes(1);
  });

  it('al desmontar corta la suscripción (sin listeners colgando)', async () => {
    const unsubscribe = vi.fn();
    vi.mocked(ResponseRepository.subscribeByRoom).mockReturnValue(unsubscribe);

    const { unmount } = renderPage();
    await waitFor(() => expect(ResponseRepository.subscribeByRoom).toHaveBeenCalled());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('mientras carga muestra skeletons, no el heatmap vacío (Escenario 7)', () => {
    vi.mocked(ResponseRepository.listByRoom).mockReturnValue(new Promise(() => undefined));

    const { container } = renderPage();

    expect(screen.getByRole('status', { name: 'Cargando los resultados' })).toBeInTheDocument();
    expect(container.querySelectorAll('.mc-heatmap__cell')).toHaveLength(0);
  });

  it('si falla la lectura muestra el error y "Intentar de nuevo" refetchea (Escenario 8)', async () => {
    vi.mocked(ResponseRepository.listByRoom)
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockResolvedValue(makeResponses([], 2));
    const user = userEvent.setup();

    renderPage();

    await waitFor(() => expect(screen.getByText('No se pudieron cargar los resultados')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));

    await waitFor(() => expect(screen.getByText('2 alumnos respondieron')).toBeInTheDocument());
  });

  it('la pestaña "Respuestas" se renderiza inerte: no es un botón ni un link', async () => {
    vi.mocked(ResponseRepository.listByRoom).mockResolvedValue(makeResponses([], 1));

    const { container } = renderPage();

    // Se espera el contenido, no el texto "Resultados": mientras la sala
    // carga, ese mismo string es el título de fallback de la topbar.
    await waitFor(() => expect(screen.getByText('Mapa de disponibilidad')).toBeInTheDocument());

    const tabs = container.querySelectorAll('.mc-results-tabs__tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent('Resultados');
    expect(tabs[0]).toHaveClass('mc-results-tabs__tab--active');

    const respuestas = screen.getByText('Respuestas');
    expect(respuestas.closest('button')).toBeNull();
    expect(respuestas.closest('a')).toBeNull();
  });
});
