import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { queryKeys } from '@library/query/query-keys';

vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { updateBlocks: vi.fn() },
}));

import { ResponseRepository } from '@library/repositories/response.repository';
import { useSubmitStudentBlocksMutation } from './use-submit-student-blocks-mutation';

let queryClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useSubmitStudentBlocksMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  });

  it('escribe los bloques del alumno en su propio documento de respuesta', async () => {
    vi.mocked(ResponseRepository.updateBlocks).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSubmitStudentBlocksMutation('room-1', 'uid-anon'), { wrapper });
    result.current.mutate([1, 2, 8, 13]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ResponseRepository.updateBlocks).toHaveBeenCalledWith('room-1', 'uid-anon', [1, 2, 8, 13]);
  });

  it('invalida la respuesta del alumno tras guardar', async () => {
    vi.mocked(ResponseRepository.updateBlocks).mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSubmitStudentBlocksMutation('room-1', 'uid-anon'), { wrapper });
    result.current.mutate([1]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.responses.mine('room-1', 'uid-anon') });
  });

  it('con error de red queda en isError y no invalida el cache', async () => {
    vi.mocked(ResponseRepository.updateBlocks).mockRejectedValue(new Error('unavailable'));
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSubmitStudentBlocksMutation('room-1', 'uid-anon'), { wrapper });
    result.current.mutate([1]);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
