import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { PaAccess } from './pa-access';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { loginWithEmail: vi.fn(), ensureAnonymousSession: vi.fn() },
}));
vi.mock('@library/repositories/user.repository', () => ({
  UserRepository: { getById: vi.fn() },
}));
vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { findByCode: vi.fn() },
}));
vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { getMine: vi.fn(), submit: vi.fn() },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/acceso']}>
        <Routes>
          <Route path="/acceso" element={<PaAccess />} />
          <Route path="/dashboard" element={<p>Dashboard</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PaAccess', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, status: AuthStatus.Idle });
  });

  it('en idle/loading no renderiza tabs, muestra spinner', () => {
    useAuthStore.setState({ status: AuthStatus.Loading });
    renderPage();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con sesión de ayudante activa, redirige a /dashboard sin mostrar el formulario', () => {
    useAuthStore.setState({ status: AuthStatus.Authenticated });
    renderPage();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('sin sesión, muestra los tabs', () => {
    useAuthStore.setState({ status: AuthStatus.Unauthenticated });
    renderPage();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
