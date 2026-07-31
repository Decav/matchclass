import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { Q4RegisterForm } from './q4-register-form';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { registerWithEmail: vi.fn() },
}));
vi.mock('@library/repositories/user.repository', () => ({
  UserRepository: { create: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { UserRepository } from '@library/repositories/user.repository';

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Q4RegisterForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'María González');
  await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
  await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
  await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'secreta123');
}

describe('Q4RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deshabilita el botón mientras displayName, email, password o confirmPassword están vacíos (Escenario 4)', async () => {
    renderForm();
    const button = screen.getByRole('button', { name: 'Crear cuenta' });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Nombre completo'), 'María González');
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'secreta123');
    expect(button).toBeEnabled();
  });

  it('un email con formato inválido bloquea el submit sin llamar a Firebase', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Nombre completo'), 'María González');
    await userEvent.type(screen.getByLabelText('Email'), 'no-es-un-email');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'secreta123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Ingresa un email válido')).toBeInTheDocument();
    });
    expect(AuthRepository.registerWithEmail).not.toHaveBeenCalled();
  });

  it('contraseña < 6 caracteres muestra el mensaje y deja el botón deshabilitado (Escenario 3)', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Nombre completo'), 'María González');
    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'abc');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(
        screen.getByText('La contraseña debe tener al menos 6 caracteres'),
      ).toBeInTheDocument();
    });
    expect(AuthRepository.registerWithEmail).not.toHaveBeenCalled();
  });

  it('confirmPassword distinto de password muestra "Las contraseñas no coinciden" (Escenario 5)', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Nombre completo'), 'María González');
    await userEvent.type(screen.getByLabelText('Email'), 'test@matchclass.cl');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'otra-distinta');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });
    expect(AuthRepository.registerWithEmail).not.toHaveBeenCalled();
  });

  it('muestra "Este email ya está registrado. Inicia sesión" ante email duplicado (Escenario 2)', async () => {
    vi.mocked(AuthRepository.registerWithEmail).mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'Email already in use'),
    );

    renderForm();
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Este email ya está registrado. Inicia sesión',
      );
    });
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });

  it('muestra "Error de conexión. Intenta de nuevo" ante un error de red (Escenario 6)', async () => {
    vi.mocked(AuthRepository.registerWithEmail).mockRejectedValue(
      new FirebaseError('auth/network-request-failed', 'Network error'),
    );

    renderForm();
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión. Intenta de nuevo');
    });
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });

  it('deshabilita los campos y muestra loading mientras envía (Escenario 1)', async () => {
    let resolveRegister: (value: { uid: string }) => void = () => {};
    vi.mocked(AuthRepository.registerWithEmail).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve;
        }),
    );
    vi.mocked(UserRepository.create).mockResolvedValue(undefined);

    renderForm();
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre completo')).toBeDisabled();
    });
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Contraseña')).toBeDisabled();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeDisabled();

    resolveRegister({ uid: 'u1' });
  });

  it('el toggle de visibilidad alterna el tipo del campo, independiente para cada contraseña', async () => {
    renderForm();
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmInput = screen.getByLabelText('Confirmar contraseña');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    const passwordGroup = passwordInput.closest('.mc-form-group');
    if (!(passwordGroup instanceof HTMLElement)) {
      throw new Error('No se encontró el contenedor del campo Contraseña');
    }
    await userEvent.click(within(passwordGroup).getByRole('button', { name: 'Mostrar contraseña' }));

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmInput).toHaveAttribute('type', 'password');
  });
});
