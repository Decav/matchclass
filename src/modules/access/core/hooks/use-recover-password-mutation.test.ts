import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { FirebaseError } from 'firebase/app';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { sendPasswordResetEmail: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { useRecoverPasswordMutation } from './use-recover-password-mutation';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useRecoverPasswordMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('en éxito, llama sendPasswordResetEmail y dispara onSuccess (Escenario 1)', async () => {
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useRecoverPasswordMutation({ onSuccess }), { wrapper });
    result.current.mutate({ email: 'ayudante@matchclass.cl' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(AuthRepository.sendPasswordResetEmail).toHaveBeenCalledWith('ayudante@matchclass.cl');
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('con auth/user-not-found, trata como éxito silencioso y dispara onSuccess (Escenario 2)', async () => {
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockRejectedValue(
      new FirebaseError('auth/user-not-found', 'User not found'),
    );
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useRecoverPasswordMutation({ onSuccess }), { wrapper });
    result.current.mutate({ email: 'nadie@matchclass.cl' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.isError).toBe(false);
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('con error de red, propaga el error y no dispara onSuccess (Escenario 5)', async () => {
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockRejectedValue(
      new FirebaseError('auth/network-request-failed', 'Network error'),
    );
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useRecoverPasswordMutation({ onSuccess }), { wrapper });
    result.current.mutate({ email: 'ayudante@matchclass.cl' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
