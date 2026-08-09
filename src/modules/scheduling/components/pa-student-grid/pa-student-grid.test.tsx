import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Room } from '@resources/entities/room.entity';
import type { Response } from '@resources/entities/response.entity';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { getRestoredUid: vi.fn() },
}));
vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { getById: vi.fn() },
}));
vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { getMine: vi.fn(), updateBlocks: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { PaStudentGrid } from './pa-student-grid';

const ROOM_ID = 'room-1';
const UID = 'uid-anon';

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

function makeResponse(occupiedBlocks: number[]): Response {
  return {
    id: UID,
    roomId: ROOM_ID,
    studentName: 'Juan Pérez',
    occupiedBlocks,
    createdByUid: UID,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/sala/${ROOM_ID}`]}>
        <Routes>
          <Route path="/sala/:roomId" element={<PaStudentGrid />} />
          <Route path="/acceso" element={<p>Pantalla de acceso</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Celda 1 = fila 0 (08:15–09:25), columna 0 (Lunes). */
const CELL_1 = 'Lunes, 08:15 – 09:25';
const CELL_2 = 'Martes, 08:15 – 09:25';
const CELL_8 = 'Miércoles, 09:40 – 10:50';

describe('PaStudentGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthRepository.getRestoredUid).mockResolvedValue(UID);
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom());
    vi.mocked(ResponseRepository.getMine).mockResolvedValue(null);
    vi.mocked(ResponseRepository.updateBlocks).mockResolvedValue(undefined);
  });

  it('sin respuesta previa: 50 celdas sin marcar, header con el nombre de la sala y botón deshabilitado (Escenario 1)', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Estás respondiendo a')).toBeInTheDocument());
    expect(screen.getByText('Estructuras de Datos · Secc 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Marca los bloques donde tienes clase' })).toBeInTheDocument();

    const cells = screen.getAllByRole('button', { pressed: false });
    expect(cells).toHaveLength(50);
    expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();
  });

  it('marcar una celda la ocupa y pone el indicador en "Cambios sin guardar" (Escenario 4)', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: CELL_1 })).toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Respuesta guardada');

    await user.click(screen.getByRole('button', { name: CELL_1 }));

    expect(screen.getByRole('button', { name: CELL_1 })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Cambios sin guardar');
    expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeEnabled();
  });

  it('volver a tocar la misma celda la libera y deshabilita el envío (Escenario 4)', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: CELL_1 })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: CELL_1 }));
    await user.click(screen.getByRole('button', { name: CELL_1 }));

    expect(screen.getByRole('button', { name: CELL_1 })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();
  });

  it('enviar guarda los bloques ordenados, muestra el toast y deja el indicador en "Respuesta guardada" (Escenario 2)', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: CELL_8 })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: CELL_8 }));
    await user.click(screen.getByRole('button', { name: CELL_1 }));
    await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

    await waitFor(() => expect(ResponseRepository.updateBlocks).toHaveBeenCalledWith(ROOM_ID, UID, [1, 8]));
    await waitFor(() => expect(screen.getByText('Respuesta enviada')).toBeInTheDocument());
  });

  it('con respuesta previa precarga esas celdas y arranca sin cambios pendientes (Escenario 3)', async () => {
    vi.mocked(ResponseRepository.getMine).mockResolvedValue(makeResponse([1, 2, 8, 13]));

    renderPage();

    await waitFor(() => expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(4));
    expect(screen.getByRole('button', { name: CELL_1 })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: CELL_2 })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();
  });

  it('desmarcar una celda precargada y enviar guarda el resto (Escenario 3)', async () => {
    vi.mocked(ResponseRepository.getMine).mockResolvedValue(makeResponse([1, 2, 8, 13]));
    const user = userEvent.setup();

    renderPage();

    await waitFor(() => expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(4));
    await user.click(screen.getByRole('button', { name: CELL_2 }));
    await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

    await waitFor(() => expect(ResponseRepository.updateBlocks).toHaveBeenCalledWith(ROOM_ID, UID, [1, 8, 13]));
  });

  it('si falla la escritura muestra el error y no pierde las celdas marcadas (Escenario 5)', async () => {
    vi.mocked(ResponseRepository.updateBlocks).mockRejectedValue(new Error('unavailable'));
    const user = userEvent.setup();

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: CELL_1 })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: CELL_1 }));
    await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Error al guardar. Intenta de nuevo'),
    );
    expect(screen.getByRole('button', { name: CELL_1 })).toHaveAttribute('aria-pressed', 'true');
  });

  it('si la lectura de la respuesta previa falla, la grilla arranca vacía en vez de romperse (RC-013 §4)', async () => {
    vi.mocked(ResponseRepository.getMine).mockRejectedValue(new Error('unavailable'));

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: CELL_1 })).toBeInTheDocument());
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
  });

  it('sala cerrada: muestra "Esta sala ya no acepta respuestas" y ninguna grilla (D3)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ status: 'closed' }));

    renderPage();

    await waitFor(() => expect(screen.getByText('Esta sala ya no acepta respuestas')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Enviar respuesta' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: CELL_1 })).not.toBeInTheDocument();
  });

  it('sala inexistente: mismo mensaje, sin grilla (D3)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(null);

    renderPage();

    await waitFor(() => expect(screen.getByText('Esta sala ya no acepta respuestas')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Enviar respuesta' })).not.toBeInTheDocument();
  });

  it('sin sesión anónima redirige a /acceso en vez de mostrar la grilla', async () => {
    vi.mocked(AuthRepository.getRestoredUid).mockResolvedValue(null);

    renderPage();

    await waitFor(() => expect(screen.getByText('Pantalla de acceso')).toBeInTheDocument());
    expect(ResponseRepository.getMine).not.toHaveBeenCalled();
  });

  it('mientras resuelve la sesión muestra skeletons, no redirige ni renderiza la grilla', () => {
    vi.mocked(AuthRepository.getRestoredUid).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByRole('status', { name: 'Cargando la sala' })).toBeInTheDocument();
    expect(screen.queryByText('Pantalla de acceso')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enviar respuesta' })).not.toBeInTheDocument();
  });
});
