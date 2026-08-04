import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PaRecoverPassword } from './pa-recover-password';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { sendPasswordResetEmail: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/recuperar']}>
        <Routes>
          <Route path="/recuperar" element={<PaRecoverPassword />} />
          <Route path="/acceso" element={<p>Pantalla de acceso</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PaRecoverPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el formulario de email por defecto', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Recupera tu contraseña' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('en éxito, pasa al estado de confirmación "Revisa tu email" (Escenario 1)', async () => {
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Revisa tu email' })).toBeInTheDocument();
    });
  });

  it('desde la confirmación, "Volver al inicio" navega a /acceso (Escenario 6)', async () => {
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Revisa tu email' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Volver al inicio' }));

    await waitFor(() => {
      expect(screen.getByText('Pantalla de acceso')).toBeInTheDocument();
    });
  });
});
