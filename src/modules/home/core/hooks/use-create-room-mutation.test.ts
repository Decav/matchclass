import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { RoomCodeGenerationError } from '@resources/errors/room-code-generation.error';

vi.mock('@library/services/room.service', () => ({
  RoomService: { createRoom: vi.fn() },
}));

import { RoomService } from '@library/services/room.service';
import { useCreateRoomMutation } from './use-create-room-mutation';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCreateRoomMutation', () => {
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
  });

  const formValues = { name: 'Sala', subject: 'Materia', section: 'Secc 1' };

  it('llama a RoomService.createRoom con el uid del store autenticado', async () => {
    vi.mocked(RoomService.createRoom).mockResolvedValue({ id: 'room-1', code: 'ABCDEF' });

    const { result } = renderHook(() => useCreateRoomMutation(), { wrapper });
    result.current.mutate(formValues);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(RoomService.createRoom).toHaveBeenCalledWith('helper-1', formValues);
    expect(result.current.data).toEqual({ id: 'room-1', code: 'ABCDEF' });
  });

  it('propaga RoomCodeGenerationError cuando el servicio falla tras 3 intentos', async () => {
    vi.mocked(RoomService.createRoom).mockRejectedValue(new RoomCodeGenerationError());

    const { result } = renderHook(() => useCreateRoomMutation(), { wrapper });
    result.current.mutate(formValues);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(RoomCodeGenerationError);
  });
});
