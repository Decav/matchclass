import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { queryKeys } from '@library/query/query-keys';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { updateBlockedSlots: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { useSaveRoomBlocksMutation } from './use-save-room-blocks-mutation';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, invalidateSpy };
}

describe('useSaveRoomBlocksMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a RoomRepository.updateBlockedSlots(roomId, celdas) e invalida el detalle de la sala (Escenario 1)', async () => {
    vi.mocked(RoomRepository.updateBlockedSlots).mockResolvedValue(undefined);
    const { wrapper, invalidateSpy } = makeWrapper();

    const { result } = renderHook(() => useSaveRoomBlocksMutation('room-1'), { wrapper });
    result.current.mutate([2, 4, 6, 8]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(RoomRepository.updateBlockedSlots).toHaveBeenCalledWith('room-1', [2, 4, 6, 8]);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.rooms.detail('room-1') });
  });

  it('propaga el error cuando falla la escritura, sin invalidar cache (Escenario 6)', async () => {
    vi.mocked(RoomRepository.updateBlockedSlots).mockRejectedValue(new Error('unavailable'));
    const { wrapper, invalidateSpy } = makeWrapper();

    const { result } = renderHook(() => useSaveRoomBlocksMutation('room-1'), { wrapper });
    result.current.mutate([1]);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
