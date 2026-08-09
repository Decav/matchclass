import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { queryKeys } from '@library/query/query-keys';
import type { RoomStatus } from '@resources/entities/room.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { updateStatus: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { useUpdateRoomStatusMutation } from './use-update-room-status-mutation';

let queryClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useUpdateRoomStatusMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  });

  const transitions: [RoomStatus, string][] = [
    ['closed', 'cerrar'],
    ['active', 'reabrir'],
    ['archived', 'eliminar'],
  ];

  it.each(transitions)('llama a RoomRepository.updateStatus con status "%s" al %s', async (status) => {
    vi.mocked(RoomRepository.updateStatus).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateRoomStatusMutation('helper-1'), { wrapper });
    result.current.mutate({ roomId: 'room-1', status });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(RoomRepository.updateStatus).toHaveBeenCalledWith('room-1', status);
  });

  it('invalida las salas del ayudante y el detalle de la sala tras un cambio exitoso', async () => {
    vi.mocked(RoomRepository.updateStatus).mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateRoomStatusMutation('helper-1'), { wrapper });
    result.current.mutate({ roomId: 'room-1', status: 'closed' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.rooms.byOwner('helper-1') });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.rooms.detail('room-1') });
  });

  it('con error de red queda en isError y no invalida el cache (RC-012 §6.4)', async () => {
    vi.mocked(RoomRepository.updateStatus).mockRejectedValue(new Error('unavailable'));
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateRoomStatusMutation('helper-1'), { wrapper });
    result.current.mutate({ roomId: 'room-1', status: 'archived' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
