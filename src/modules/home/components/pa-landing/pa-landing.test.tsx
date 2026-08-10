import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { findByCode: vi.fn() },
}));

import { PaLanding } from './pa-landing';

function renderLanding() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<PaLanding />} />
          <Route path="/dashboard" element={<p>Dashboard del ayudante</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PaLanding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, status: AuthStatus.Unauthenticated });
  });

  it('sin sesión muestra logo, título, tagline, código, las 3 cards y el link (Escenario 1)', () => {
    const { container } = renderLanding();

    expect(container.querySelector('.mc-landing__logo')).toHaveTextContent('MC');
    expect(screen.getByRole('heading', { level: 1, name: 'MatchClass' })).toBeInTheDocument();
    expect(screen.getByText('Coordinación de ayudantías sin fricción')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Ingresa el código de tu sala')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 2, name: 'Cómo funciona' })).toBeInTheDocument();
    expect(container.querySelectorAll('.mc-landing-card')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Crea una sala' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Comparte el código' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Descubre el mejor horario' })).toBeInTheDocument();

    expect(screen.getByText('¿Eres ayudante?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toBeInTheDocument();
  });

  it('el link "Inicia sesión" apunta a /acceso (Escenario 4)', () => {
    renderLanding();

    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toHaveAttribute('href', '/acceso');
  });

  it('con sesión activa redirige a /dashboard sin renderizar la landing (Escenario 5)', () => {
    useAuthStore.setState({
      user: {
        id: 'helper-1',
        email: 'ayudante@matchclass.cl',
        displayName: 'Ayudante Test',
        role: 'helper',
        createdAt: null,
      },
      status: AuthStatus.Authenticated,
    });

    renderLanding();

    expect(screen.getByText('Dashboard del ayudante')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: 'MatchClass' })).not.toBeInTheDocument();
  });

  it('mientras la sesión se restaura muestra el spinner y no redirige ni pinta la landing', () => {
    useAuthStore.setState({ user: null, status: AuthStatus.Loading });

    renderLanding();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard del ayudante')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: 'MatchClass' })).not.toBeInTheDocument();
  });

  it('con status idle tampoco decide todavía', () => {
    useAuthStore.setState({ user: null, status: AuthStatus.Idle });

    renderLanding();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard del ayudante')).not.toBeInTheDocument();
  });
});
