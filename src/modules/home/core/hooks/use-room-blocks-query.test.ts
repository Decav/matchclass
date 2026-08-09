import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { getById: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { useRoomBlocksQuery } from './use-room-blocks-query';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

function makeRoom(overrides: Partial<Room>): Room {
  return {
    id: 'room-1',
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

describe('useRoomBlocksQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a RoomRepository.getById con el roomId y expone la sala (Escenario 2)', async () => {
    vi.mocked(RoomRepository.getById).mockResolvedValue(makeRoom({ helperBlockedSlots: [2, 4, 6, 8] }));

    const { result } = renderHook(() => useRoomBlocksQuery('room-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(RoomRepository.getById).toHaveBeenCalledWith('room-1');
    expect(result.current.data?.helperBlockedSlots).toEqual([2, 4, 6, 8]);
  });

  it('sin retry: si el repositorio falla, expone isError de inmediato (RC-010 §4)', async () => {
    vi.mocked(RoomRepository.getById).mockRejectedValue(new Error('unavailable'));

    const { result } = renderHook(() => useRoomBlocksQuery('room-1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(RoomRepository.getById).toHaveBeenCalledTimes(1);
  });
});
