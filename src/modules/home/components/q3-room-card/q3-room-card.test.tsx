import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { RoomWithResponseCount } from '@resources/types/room-with-response-count.type';
import { Q3RoomCard } from './q3-room-card';

function makeRoom(overrides: Partial<RoomWithResponseCount>): RoomWithResponseCount {
  return {
    id: 'r1',
    code: 'ABC123',
    name: 'Sala de prueba',
    subject: 'Materia',
    section: 'Secc 1',
    createdBy: 'u1',
    createdAt: new Date('2026-01-01'),
    status: 'active',
    helperBlockedSlots: [],
    responseCount: 5,
    ...overrides,
  };
}

function renderCard(room: RoomWithResponseCount) {
  return render(
    <MemoryRouter>
      <Q3RoomCard room={room} />
    </MemoryRouter>,
  );
}

const writeTextMock = vi.fn().mockResolvedValue(undefined);

describe('Q3RoomCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });
  });

  it('con studentLimit muestra la fracción y la barra de progreso (RC-008 §10)', () => {
    renderCard(makeRoom({ responseCount: 12, studentLimit: 30 }));

    expect(screen.getByText('12/30 alumnos respondieron')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });

  it('sin studentLimit muestra solo el conteo, sin fracción ni barra (RC-008 §10)', () => {
    renderCard(makeRoom({ responseCount: 8 }));

    expect(screen.getByText('8 alumnos respondieron')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('"Abrir" enlaza a /salas/:roomId', () => {
    renderCard(makeRoom({ id: 'room-42' }));

    expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', '/salas/room-42');
  });

  it('"Copiar" copia el código al portapapeles y muestra una confirmación breve', async () => {
    renderCard(makeRoom({ code: 'XYZ999' }));

    // `fireEvent`, no `userEvent`: `userEvent.setup()` reemplaza
    // `navigator.clipboard` con su propio portapapeles virtual (para sus
    // APIs `.copy()`/`.paste()`), pisando el mock de `beforeEach` antes del
    // click — el componente terminaba escribiendo a un mock distinto.
    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));

    await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith('XYZ999'));
    await waitFor(() => expect(screen.getByRole('button', { name: '¡Copiado!' })).toBeInTheDocument());
  });

  it('"Copiar enlace" copia el enlace con el código y muestra confirmación (RC-011 Escenario 3)', async () => {
    renderCard(makeRoom({ code: 'XYZ999' }));

    fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }));

    await waitFor(() =>
      expect(writeTextMock).toHaveBeenCalledWith(`${window.location.origin}/acceso?tipo=alumno&codigo=XYZ999`),
    );
    await waitFor(() => expect(screen.getAllByRole('button', { name: '¡Copiado!' })).toHaveLength(1));
  });

  it('sin Clipboard API, "Copiar" selecciona el código en vez de copiarlo (Escenario 4)', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    renderCard(makeRoom({ code: 'XYZ999' }));

    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));

    await waitFor(() => expect(window.getSelection()?.toString()).toBe('XYZ999'));
    expect(screen.queryByRole('button', { name: '¡Copiado!' })).not.toBeInTheDocument();
  });
});
