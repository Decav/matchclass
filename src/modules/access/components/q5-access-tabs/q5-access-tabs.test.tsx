import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Q5AccessTabs } from './q5-access-tabs';

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

function renderTabs(initialPath = '/acceso') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Q5AccessTabs />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Q5AccessTabs', () => {
  it('sin query params: tab Ayudante activo, contenido Alumno oculto (Escenario 6)', () => {
    renderTabs('/acceso');
    expect(screen.getByRole('tab', { name: 'Ayudante' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Email')).toBeVisible();
    expect(screen.queryByText('Ingresa tu código')).not.toBeVisible();
  });

  it('con ?tipo=alumno: tab Alumno activo, login oculto (Escenario 7)', () => {
    renderTabs('/acceso?tipo=alumno');
    expect(screen.getByRole('tab', { name: 'Alumno' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Ingresa tu código')).toBeVisible();
    expect(screen.queryByLabelText('Email')).not.toBeVisible();
  });

  it('con ?tipo=alumno&codigo=EDS101: el tab Alumno arranca con el código precargado (RC-011 Escenario 3)', () => {
    renderTabs('/acceso?tipo=alumno&codigo=EDS101');

    expect(screen.getByRole('tab', { name: 'Alumno' })).toHaveAttribute('aria-selected', 'true');
    const cells = screen.getAllByRole('textbox');
    expect(cells.map((cell) => (cell as HTMLInputElement).value).join('')).toBe('EDS101');
  });

  it('cambiar de tab y volver conserva lo escrito en el login (Escenario 8)', async () => {
    renderTabs('/acceso');

    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');

    await userEvent.click(screen.getByRole('tab', { name: 'Alumno' }));
    expect(screen.getByRole('tab', { name: 'Alumno' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(screen.getByRole('tab', { name: 'Ayudante' }));
    expect(screen.getByLabelText('Email')).toHaveValue('test@matchclass.cl');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('secreta123');
  });
});
