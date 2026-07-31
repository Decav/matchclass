import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Q4StudentNameForm } from './q4-student-name-form';

vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { submit: vi.fn() },
}));

import { ResponseRepository } from '@library/repositories/response.repository';

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Q4StudentNameForm roomId="room-1" roomName="Estructuras de Datos" uid="uid-1" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Q4StudentNameForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el nombre de la sala resuelta', () => {
    renderForm();
    expect(screen.getByText('Estructuras de Datos')).toBeInTheDocument();
  });

  it('nombre válido: crea la respuesta con occupiedBlocks:[] y createdByUid', async () => {
    vi.mocked(ResponseRepository.submit).mockResolvedValue(undefined);

    renderForm();
    await userEvent.type(screen.getByLabelText('Tu nombre'), 'Juan Pérez');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar a la grilla' }));

    await waitFor(() => {
      expect(ResponseRepository.submit).toHaveBeenCalledWith('room-1', 'uid-1', {
        studentName: 'Juan Pérez',
        occupiedBlocks: [],
      });
    });
  });

  it('nombre vacío: muestra el error y no crea el documento', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar a la grilla' }));

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
    });
    expect(ResponseRepository.submit).not.toHaveBeenCalled();
  });

  it('nombre de 1 caracter: muestra el error y no crea el documento', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Tu nombre'), 'A');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar a la grilla' }));

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
    });
    expect(ResponseRepository.submit).not.toHaveBeenCalled();
  });
});
