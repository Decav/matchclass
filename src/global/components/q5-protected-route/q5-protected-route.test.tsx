import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { Q5ProtectedRoute } from './q5-protected-route';

function renderGuarded() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/acceso" element={<p>Página de acceso</p>} />
        <Route element={<Q5ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Contenido protegido</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Q5ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, status: AuthStatus.Idle });
  });

  it('con status authenticated renderiza el Outlet (contenido hijo)', () => {
    useAuthStore.setState({ status: AuthStatus.Authenticated });
    renderGuarded();
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    expect(screen.queryByText('Página de acceso')).not.toBeInTheDocument();
  });

  it('con status unauthenticated redirige a /acceso y no muestra el contenido hijo', () => {
    useAuthStore.setState({ status: AuthStatus.Unauthenticated });
    renderGuarded();
    expect(screen.getByText('Página de acceso')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it.each([AuthStatus.Idle, AuthStatus.Loading])(
    'con status %s muestra el spinner, ni el contenido hijo ni redirige',
    (status) => {
      useAuthStore.setState({ status });
      renderGuarded();
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
      expect(screen.queryByText('Página de acceso')).not.toBeInTheDocument();
    },
  );
});
