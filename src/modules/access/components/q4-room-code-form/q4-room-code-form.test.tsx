import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FirebaseError } from 'firebase/app';
import { Q4RoomCodeForm } from './q4-room-code-form';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: { ensureAnonymousSession: vi.fn() },
}));
vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { findByCode: vi.fn() },
}));
vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { getMine: vi.fn() },
}));

import { AuthRepository } from '@library/repositories/auth.repository';
import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';

const mockRoom: Room = {
  id: 'room-1',
  code: 'ABCDEF',
  name: 'Estructuras de Datos',
  subject: 'Estructuras de Datos',
  section: 'Secc 1',
  createdBy: 'helper-1',
  createdAt: new Date('2026-01-01'),
  status: 'active',
  helperBlockedSlots: [],
};

function renderForm(onValidated = vi.fn(), initialCode = '') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <Q4RoomCodeForm onValidated={onValidated} initialCode={initialCode} />
    </QueryClientProvider>,
  );
  return { ...utils, onValidated };
}

async function typeCode(code: string) {
  const cells = screen.getAllByRole('textbox');
  for (let i = 0; i < code.length; i += 1) {
    await userEvent.type(cells[i]!, code[i]!);
  }
}

describe('Q4RoomCodeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con initialCode precarga las celdas y habilita "Ingresar" (RC-011 Escenario 3)', () => {
    renderForm(vi.fn(), 'EDS101');

    const cells = screen.getAllByRole('textbox');
    expect(cells.map((cell) => (cell as HTMLInputElement).value).join('')).toBe('EDS101');
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
  });

  it('mantiene "Ingresar" deshabilitado hasta completar las 6 celdas', async () => {
    renderForm();
    const button = screen.getByRole('button', { name: 'Ingresar' });
    expect(button).toBeDisabled();

    const cells = screen.getAllByRole('textbox');
    await userEvent.type(cells[0]!, 'A');
    await userEvent.type(cells[1]!, 'B');
    await userEvent.type(cells[2]!, 'C');
    expect(button).toBeDisabled();

    await userEvent.type(cells[3]!, 'D');
    await userEvent.type(cells[4]!, 'E');
    await userEvent.type(cells[5]!, 'F');
    expect(button).toBeEnabled();
  });

  it('código válido: llama onValidated con la sala resuelta', async () => {
    vi.mocked(AuthRepository.ensureAnonymousSession).mockResolvedValue('uid-1');
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(mockRoom);
    vi.mocked(ResponseRepository.getMine).mockResolvedValue(null);

    const { onValidated } = renderForm();
    await typeCode('ABCDEF');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(onValidated).toHaveBeenCalled();
    });
    expect(onValidated.mock.calls[0]?.[0]).toEqual({
      uid: 'uid-1',
      room: mockRoom,
      hasExistingResponse: false,
    });
  });

  it('código inexistente: celdas en error y mensaje, sin limpiar el campo', async () => {
    vi.mocked(AuthRepository.ensureAnonymousSession).mockResolvedValue('uid-1');
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(null);

    renderForm();
    await typeCode('ZZZZZZ');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(screen.getByText('Código inválido. Revisa con tu ayudante')).toBeInTheDocument();
    });
    const cells = screen.getAllByRole('textbox');
    expect(cells.map((cell) => (cell as HTMLInputElement).value).join('')).toBe('ZZZZZZ');
    expect(cells[0]).toHaveAttribute('aria-invalid', 'true');
  });

  it('sala cerrada: muestra el mensaje y no avanza', async () => {
    vi.mocked(AuthRepository.ensureAnonymousSession).mockResolvedValue('uid-1');
    vi.mocked(RoomRepository.findByCode).mockResolvedValue({ ...mockRoom, status: 'closed' });

    const { onValidated } = renderForm();
    await typeCode('ABCDEF');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(screen.getByText('Esta sala ya no acepta respuestas')).toBeInTheDocument();
    });
    expect(onValidated).not.toHaveBeenCalled();
  });

  it('error de red: muestra el mensaje y reactiva el botón', async () => {
    vi.mocked(AuthRepository.ensureAnonymousSession).mockRejectedValue(
      new FirebaseError('auth/network-request-failed', 'Network error'),
    );

    renderForm();
    await typeCode('ABCDEF');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(screen.getByText('Error de conexión. Intenta de nuevo')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
  });
});
