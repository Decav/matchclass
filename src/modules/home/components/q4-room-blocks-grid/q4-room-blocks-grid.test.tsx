import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { Room } from '@resources/entities/room.entity';
import { Q4RoomBlocksGrid } from './q4-room-blocks-grid';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { getById: vi.fn(), updateBlockedSlots: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';

function makeRoom(overrides: Partial<Room>): Room {
  return {
    id: 'room-1',
    code: 'ABC123',
    name: 'Sala de prueba',
    subject: 'Materia',
    section: 'Secc 1',
    createdBy: 'helper-1',
    createdAt: new Date('2026-01-01'),
    status: 'active',
    helperBlockedSlots: [],
    ...overrides,
  };
}

function renderGrid() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/salas/room-1/bloques']}>
        <Routes>
          <Route path="/salas/room-1/bloques" element={<Q4RoomBlocksGrid roomId="room-1" />} />
          <Route path="/dashboard" element={<p>Dashboard placeholder</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// Celda 3 = fila 0 (08:15–09:25), columna 2 (Miércoles) → 0*5+2+1.
const CELL_3_LABEL = 'Miércoles, 08:15 – 09:25';
// Celda 8 = fila 1 (09:40–10:50), columna 2 (Miércoles) → 1*5+2+1.
const CELL_8_LABEL = 'Miércoles, 09:40 – 10:50';

describe('Q4RoomBlocksGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('precarga las celdas de helperBlockedSlots como marcadas y el resto libres (Escenario 2)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [2, 4, 6, 8] }));

    renderGrid();

    await waitFor(() => expect(screen.getByRole('button', { name: CELL_8_LABEL })).toHaveAttribute(
      'aria-pressed',
      'true',
    ));
    expect(screen.getByRole('button', { name: CELL_3_LABEL })).toHaveAttribute('aria-pressed', 'false');
  });

  it('sin modificar ninguna celda, "Guardar cambios" permanece deshabilitado (Escenario 5)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [2] }));

    renderGrid();

    await waitFor(() => expect(screen.getByRole('button', { name: CELL_3_LABEL })).toBeEnabled());
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('al marcar una celda, "Guardar cambios" se habilita; al deshacer el cambio, vuelve a deshabilitarse', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [] }));

    renderGrid();
    await waitFor(() => expect(screen.getByRole('button', { name: CELL_3_LABEL })).toBeEnabled());
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: CELL_3_LABEL }));
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: CELL_3_LABEL }));
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('al guardar: llama updateBlockedSlots con las celdas marcadas y muestra el toast "Cambios guardados" (Escenario 1)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [] }));
    vi.mocked(RoomRepository.updateBlockedSlots).mockResolvedValue(undefined);

    renderGrid();
    await waitFor(() => expect(screen.getByRole('button', { name: CELL_3_LABEL })).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: CELL_3_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: CELL_8_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(RoomRepository.updateBlockedSlots).toHaveBeenCalledWith('room-1', [3, 8]));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Cambios guardados'));
  });

  it('"Omitir" navega a /dashboard sin llamar a updateBlockedSlots (Escenario 3)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [2] }));

    renderGrid();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled());

    fireEvent.click(screen.getByRole('button', { name: 'Omitir' }));

    await waitFor(() => expect(screen.getByText('Dashboard placeholder')).toBeInTheDocument());
    expect(RoomRepository.updateBlockedSlots).not.toHaveBeenCalled();
  });

  it('si falla el guardado, muestra "Error al guardar. Intenta de nuevo" y no pierde la selección local (Escenario 6)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [] }));
    vi.mocked(RoomRepository.updateBlockedSlots).mockRejectedValue(new Error('unavailable'));

    renderGrid();
    await waitFor(() => expect(screen.getByRole('button', { name: CELL_3_LABEL })).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: CELL_3_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(screen.getByText('Error al guardar. Intenta de nuevo')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: CELL_3_LABEL })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  });
});
