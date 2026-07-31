import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { RoomNotFoundError } from '@resources/errors/room-not-found.error';
import { RoomClosedError } from '@resources/errors/room-closed.error';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { ensureAnonymousSession: vi.fn() },
}));
vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { findByCode: vi.fn() },
}));
vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { getMine: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { useValidateRoomCodeMutation } from './use-validate-room-code-mutation';

const mockRoom: Room = {
  id: 'room-1',
  code: 'ABCDEF',
  name: 'Estructuras de Datos',
  subject: 'Estructuras de Datos',
  section: 'Secc 1',
  createdBy: 'helper-1',
  createdAt: new Date('2026-01-01'),
  status: 'active',
  helperBlockedSlots: [],
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useValidateRoomCodeMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resuelve la sala y hasExistingResponse:false cuando el alumno no respondió antes', async () => {
    vi.mocked(AuthRepository.ensureAnonymousSession).mockResolvedValue('uid-1');
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(mockRoom);
    vi.mocked(ResponseRepository.getMine).mockResolvedValue(null);

    const { result } = renderHook(() => useValidateRoomCodeMutation(), { wrapper });
    result.current.mutate({ code: 'ABCDEF' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual({ uid: 'uid-1', room: mockRoom, hasExistingResponse: false });
  });

  it('hasExistingResponse:true cuando ya existe una respuesta', async () => {
    vi.mocked(AuthRepository.ensureAnonymousSession).mockResolvedValue('uid-1');
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(mockRoom);
    vi.mocked(ResponseRepository.getMine).mockResolvedValue({
      id: 'uid-1',
      roomId: 'room-1',
      studentName: 'Ana',
      occupiedBlocks: [],
      createdByUid: 'uid-1',
      createdAt: null,
      updatedAt: null,
    });

    const { result } = renderHook(() => useValidateRoomCodeMutation(), { wrapper });
    result.current.mutate({ code: 'ABCDEF' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.hasExistingResponse).toBe(true);
  });

  it('rechaza con RoomNotFoundError si la sala no existe', async () => {
    vi.mocked(AuthRepository.ensureAnonymousSession).mockResolvedValue('uid-1');
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(null);

    const { result } = renderHook(() => useValidateRoomCodeMutation(), { wrapper });
    result.current.mutate({ code: 'ZZZZZZ' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBeInstanceOf(RoomNotFoundError);
  });

  it('rechaza con RoomClosedError si la sala no está activa', async () => {
    vi.mocked(AuthRepository.ensureAnonymousSession).mockResolvedValue('uid-1');
    vi.mocked(RoomRepository.findByCode).mockResolvedValue({ ...mockRoom, status: 'closed' });

    const { result } = renderHook(() => useValidateRoomCodeMutation(), { wrapper });
    result.current.mutate({ code: 'ABCDEF' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBeInstanceOf(RoomClosedError);
  });
});
