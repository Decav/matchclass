import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { RoomNotFoundError } from '@resources/errors/room-not-found.error';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { findByCode: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { useLandingCodeMutation } from './use-landing-code-mutation';

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    code: 'EDS101',
    name: 'Estructuras de Datos · Secc 1',
    subject: 'Estructuras de Datos',
    section: 'Secc 1',
    createdBy: 'helper-1',
    createdAt: new Date('2026-01-01'),
    status: 'active',
    helperBlockedSlots: [],
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

/** Expone la URL actual junto al resultado de la mutación. */
function useHookUnderTest() {
  return { mutation: useLandingCodeMutation(), location: useLocation() };
}

describe('useLandingCodeMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con una sala existente navega a /acceso con el tab Alumno y el código', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(makeRoom());

    const { result } = renderHook(() => useHookUnderTest(), { wrapper });
    result.current.mutation.mutate({ code: 'EDS101' });

    await waitFor(() => expect(result.current.location.pathname).toBe('/acceso'));
    expect(result.current.location.search).toBe('?tipo=alumno&codigo=EDS101');
    expect(RoomRepository.findByCode).toHaveBeenCalledWith('EDS101');
  });

  it('navega con el código canónico de Firestore, no con lo tipeado', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(makeRoom({ code: 'EDS101' }));

    const { result } = renderHook(() => useHookUnderTest(), { wrapper });
    result.current.mutation.mutate({ code: 'eds101' });

    await waitFor(() => expect(result.current.location.search).toBe('?tipo=alumno&codigo=EDS101'));
  });

  it('sin sala lanza RoomNotFoundError y no navega', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(null);

    const { result } = renderHook(() => useHookUnderTest(), { wrapper });
    result.current.mutation.mutate({ code: 'ZZZZZZ' });

    await waitFor(() => expect(result.current.mutation.isError).toBe(true));
    expect(result.current.mutation.error).toBeInstanceOf(RoomNotFoundError);
    expect(result.current.location.pathname).toBe('/');
  });

  it('con una sala cerrada navega igual: el status no se mira acá (D4)', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(
      makeRoom({ code: 'CLOSED', status: 'closed' }),
    );

    const { result } = renderHook(() => useHookUnderTest(), { wrapper });
    result.current.mutation.mutate({ code: 'CLOSED' });

    await waitFor(() => expect(result.current.location.pathname).toBe('/acceso'));
    expect(result.current.location.search).toBe('?tipo=alumno&codigo=CLOSED');
    expect(result.current.mutation.isError).toBe(false);
  });
});
