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
  AuthRepository: { registerWithEmail: vi.fn() },
}));
vi.mock('@library/repositories/user.repository', () => ({
  UserRepository: { create: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { UserRepository } from '@library/repositories/user.repository';
import { useRegisterMutation } from './use-register-mutation';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useRegisterMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, status: AuthStatus.Idle });
  });

  it('en éxito, crea el perfil con role "helper", actualiza el store y navega a /dashboard', async () => {
    vi.mocked(AuthRepository.registerWithEmail).mockResolvedValue({ uid: 'u1' });
    vi.mocked(UserRepository.create).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRegisterMutation(), { wrapper });
    result.current.mutate({
      displayName: 'María González',
      email: 'ayudante@matchclass.cl',
      password: 'secreta123',
      confirmPassword: 'secreta123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AuthRepository.registerWithEmail).toHaveBeenCalledWith(
      'ayudante@matchclass.cl',
      'secreta123',
    );
    expect(UserRepository.create).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        displayName: 'María González',
        email: 'ayudante@matchclass.cl',
        role: 'helper',
      }),
    );
    expect(useAuthStore.getState().status).toBe(AuthStatus.Authenticated);
    expect(useAuthStore.getState().user?.id).toBe('u1');
    expect(useAuthStore.getState().user?.role).toBe('helper');
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });

  it('en email duplicado, no navega ni actualiza el store', async () => {
    vi.mocked(AuthRepository.registerWithEmail).mockRejectedValue(
      new Error('auth/email-already-in-use'),
    );

    const { result } = renderHook(() => useRegisterMutation(), { wrapper });
    result.current.mutate({
      displayName: 'María González',
      email: 'ayudante@matchclass.cl',
      password: 'secreta123',
      confirmPassword: 'secreta123',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(UserRepository.create).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe(AuthStatus.Idle);
  });
});
