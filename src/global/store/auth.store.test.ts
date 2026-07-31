import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';

const mockUser = {
  id: 'u1',
  email: 'ayudante@matchclass.cl',
  displayName: 'Ayudante Test',
  role: 'helper' as const,
  createdAt: null,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, status: AuthStatus.Idle });
  });

  it('empieza en idle sin usuario', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.status).toBe(AuthStatus.Idle);
    expect(result.current.user).toBeNull();
  });

  it('setUser guarda el usuario y pasa a authenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.setUser(mockUser));
    expect(result.current.status).toBe(AuthStatus.Authenticated);
    expect(result.current.user).toEqual(mockUser);
  });

  it('clearUser limpia el usuario y pasa a unauthenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.setUser(mockUser));
    act(() => result.current.clearUser());
    expect(result.current.status).toBe(AuthStatus.Unauthenticated);
    expect(result.current.user).toBeNull();
  });

  it('setStatus actualiza el estado sin tocar el usuario', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.setStatus(AuthStatus.Loading));
    expect(result.current.status).toBe(AuthStatus.Loading);
    expect(result.current.user).toBeNull();
  });
});
