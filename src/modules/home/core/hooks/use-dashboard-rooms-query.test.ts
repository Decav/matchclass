import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { listByOwner: vi.fn() },
}));
vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { countByRoom: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { useDashboardRoomsQuery } from './use-dashboard-rooms-query';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

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

describe('useDashboardRoomsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('combina RoomRepository.listByOwner + ResponseRepository.countByRoom vía RoomService', async () => {
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue([makeRoom({ id: 'r1' })]);
    vi.mocked(ResponseRepository.countByRoom).mockResolvedValue(7);

    const { result } = renderHook(() => useDashboardRoomsQuery('u1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([expect.objectContaining({ id: 'r1', responseCount: 7 })]);
    expect(RoomRepository.listByOwner).toHaveBeenCalledWith('u1');
  });

  it('cuando el repositorio falla, expone isError para que la página muestre el estado de error', async () => {
    vi.mocked(RoomRepository.listByOwner).mockRejectedValue(new Error('firestore unavailable'));

    const { result } = renderHook(() => useDashboardRoomsQuery('u1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
