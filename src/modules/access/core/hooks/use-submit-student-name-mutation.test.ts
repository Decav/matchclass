import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { submit: vi.fn() },
}));

import { ResponseRepository } from '@library/repositories/response.repository';
import { useSubmitStudentNameMutation } from './use-submit-student-name-mutation';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useSubmitStudentNameMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crea la respuesta con occupiedBlocks:[] y navega a /sala/:roomId', async () => {
    vi.mocked(ResponseRepository.submit).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSubmitStudentNameMutation(), { wrapper });
    result.current.mutate({ roomId: 'room-1', uid: 'uid-1', studentName: 'Ana' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(ResponseRepository.submit).toHaveBeenCalledWith('room-1', 'uid-1', {
      studentName: 'Ana',
      occupiedBlocks: [],
    });
    expect(navigateMock).toHaveBeenCalledWith('/sala/room-1');
  });

  it('en error, no navega', async () => {
    vi.mocked(ResponseRepository.submit).mockRejectedValue(new Error('unavailable'));

    const { result } = renderHook(() => useSubmitStudentNameMutation(), { wrapper });
    result.current.mutate({ roomId: 'room-1', uid: 'uid-1', studentName: 'Ana' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
