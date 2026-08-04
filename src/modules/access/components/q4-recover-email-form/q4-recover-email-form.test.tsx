import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { Q4RecoverEmailForm } from './q4-recover-email-form';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { sendPasswordResetEmail: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';

function renderForm(onSuccess = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Q4RecoverEmailForm onSuccess={onSuccess} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { onSuccess };
}

describe('Q4RecoverEmailForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deshabilita el botón con email vacío (Escenario 4)', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Enviar link' })).toBeDisabled();
  });

  it('un email con formato inválido bloquea el submit sin llamar a Firebase (Escenario 3)', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Email'), 'hola');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() => {
      expect(screen.getByText('Ingresa un email válido')).toBeInTheDocument();
    });
    expect(AuthRepository.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('durante el envío, muestra spinner y deshabilita el campo (Escenario 1)', async () => {
    let resolveSend: () => void = () => {};
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSend = () => {
            resolve();
          };
        }),
    );

    renderForm();
    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeDisabled();
    });

    resolveSend();
  });

  it('en éxito, dispara onSuccess (Escenario 1)', async () => {
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockResolvedValue(undefined);
    const { onSuccess } = renderForm();

    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });

  it('con email no registrado, también dispara onSuccess sin mostrar error (Escenario 2)', async () => {
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockRejectedValue(
      new FirebaseError('auth/user-not-found', 'User not found'),
    );
    const { onSuccess } = renderForm();

    await userEvent.type(screen.getByLabelText('Email'), 'nadie@matchclass.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra "Error de conexión. Intenta de nuevo" ante un error de red y no dispara onSuccess (Escenario 5)', async () => {
    vi.mocked(AuthRepository.sendPasswordResetEmail).mockRejectedValue(
      new FirebaseError('auth/network-request-failed', 'Network error'),
    );
    const { onSuccess } = renderForm();

    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión. Intenta de nuevo');
    });
    expect(screen.getByRole('button', { name: 'Enviar link' })).toBeEnabled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
