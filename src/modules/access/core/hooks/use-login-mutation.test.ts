import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { loginWithEmail: vi.fn() },
}));
vi.mock('@library/repositories/user.repository', () => ({
  UserRepository: { getById: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { UserRepository } from '@library/repositories/user.repository';
import { useLoginMutation } from './use-login-mutation';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useLoginMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, status: AuthStatus.Idle });
  });

  it('en éxito, actualiza el store y navega a /dashboard', async () => {
    vi.mocked(AuthRepository.loginWithEmail).mockResolvedValue({ uid: 'u1' });
    vi.mocked(UserRepository.getById).mockResolvedValue({
      id: 'u1',
      email: 'ayudante@matchclass.cl',
      displayName: 'Ayudante Test',
      role: 'helper',
      createdAt: null,
    });

    const { result } = renderHook(() => useLoginMutation(), { wrapper });
    result.current.mutate({ email: 'ayudante@matchclass.cl', password: 'secreta123' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(useAuthStore.getState().status).toBe(AuthStatus.Authenticated);
    expect(useAuthStore.getState().user?.id).toBe('u1');
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });

  it('en credenciales inválidas, no navega ni actualiza el store', async () => {
    vi.mocked(AuthRepository.loginWithEmail).mockRejectedValue(new Error('auth/invalid-credential'));

    const { result } = renderHook(() => useLoginMutation(), { wrapper });
    result.current.mutate({ email: 'ayudante@matchclass.cl', password: 'incorrecta' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(navigateMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe(AuthStatus.Idle);
  });
});
