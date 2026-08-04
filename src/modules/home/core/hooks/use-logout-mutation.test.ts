import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { logout: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { useLogoutMutation } from './use-logout-mutation';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useLogoutMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'u1',
        email: 'ayudante@matchclass.cl',
        displayName: 'Ayudante Test',
        role: 'helper',
        createdAt: null,
      },
      status: AuthStatus.Authenticated,
    });
  });

  it('en éxito, llama a AuthRepository.logout y limpia el store', async () => {
    vi.mocked(AuthRepository.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogoutMutation(), { wrapper });
    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AuthRepository.logout).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().status).toBe(AuthStatus.Unauthenticated);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
