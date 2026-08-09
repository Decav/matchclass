import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@global/providers/theme-provider';
import type { Room } from '@resources/entities/room.entity';
import { PaRoomBlocks } from './pa-room-blocks';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { getById: vi.fn(), updateBlockedSlots: vi.fn() },
}));
vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { logout: vi.fn() },
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

function renderPage(initialPath = '/salas/room-1/bloques') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/salas/:roomId/bloques" element={<PaRoomBlocks />} />
            <Route path="/dashboard" element={<p>Dashboard placeholder</p>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('PaRoomBlocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra "Mis bloques" en la topbar y monta la grilla para el roomId de la ruta', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [] }));

    renderPage();

    expect(screen.getByText('Mis bloques')).toBeInTheDocument();
    await waitFor(() => expect(RoomRepository.getById).toHaveBeenCalledWith('room-1'));
    expect(screen.getByRole('heading', { name: 'Configura tus bloques ocupados' })).toBeInTheDocument();
  });

  it('sin roomId en la ruta, redirige a /dashboard en vez de renderizar la grilla', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<PaRoomBlocks />} />
            <Route path="/dashboard" element={<p>Dashboard placeholder</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Dashboard placeholder')).toBeInTheDocument();
    expect(RoomRepository.getById).not.toHaveBeenCalled();
  });
});
