import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { Q4LoginForm } from './q4-login-form';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { loginWithEmail: vi.fn() },
}));
vi.mock('@library/repositories/user.repository', () => ({
  UserRepository: { getById: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { UserRepository } from '@library/repositories/user.repository';

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Q4LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Q4LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deshabilita el botón mientras email o password están vacíos', async () => {
    renderForm();
    const button = screen.getByRole('button', { name: 'Iniciar sesión' });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
    expect(button).toBeEnabled();
  });

  it('un email con formato inválido bloquea el submit sin llamar a Firebase', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Email'), 'no-es-un-email');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Ingresa un email válido')).toBeInTheDocument();
    });
    expect(AuthRepository.loginWithEmail).not.toHaveBeenCalled();
  });

  it('muestra "Email o contraseña incorrectos" sin limpiar los campos', async () => {
    vi.mocked(AuthRepository.loginWithEmail).mockRejectedValue(
      new FirebaseError('auth/invalid-credential', 'Invalid credential'),
    );

    renderForm();
    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email o contraseña incorrectos');
    });
    expect(screen.getByLabelText('Email')).toHaveValue('test@matchclass.cl');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('incorrecta');
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
  });

  it('muestra "Error de conexión. Intenta de nuevo" ante un error de red', async () => {
    vi.mocked(AuthRepository.loginWithEmail).mockRejectedValue(
      new FirebaseError('auth/network-request-failed', 'Network error'),
    );

    renderForm();
    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión. Intenta de nuevo');
    });
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
  });

  it('deshabilita los campos y muestra loading mientras envía', async () => {
    let resolveLogin: (value: { uid: string }) => void = () => {};
    vi.mocked(AuthRepository.loginWithEmail).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    vi.mocked(UserRepository.getById).mockResolvedValue({
      id: 'u1',
      email: 'test@matchclass.cl',
      displayName: 'Test',
      role: 'helper',
      createdAt: null,
    });

    renderForm();
    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeDisabled();
    });
    expect(screen.getByLabelText('Contraseña')).toBeDisabled();

    resolveLogin({ uid: 'u1' });
  });
});
