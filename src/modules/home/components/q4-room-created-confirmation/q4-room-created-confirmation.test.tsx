import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Q4RoomCreatedConfirmation } from './q4-room-created-confirmation';

const writeTextMock = vi.fn().mockResolvedValue(undefined);

function renderConfirmation() {
  return render(
    <MemoryRouter initialEntries={['/salas/nueva']}>
      <Routes>
        <Route
          path="/salas/nueva"
          element={<Q4RoomCreatedConfirmation roomId="room-1" name="Estructuras de Datos - Secc 1" code="EDS101" />}
        />
        <Route path="/dashboard" element={<p>Dashboard</p>} />
        <Route path="/salas/:roomId/bloques" element={<p>Configurar mis bloques (placeholder)</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Q4RoomCreatedConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });
  });

  it('muestra el nombre de la sala y el código', () => {
    renderConfirmation();

    expect(screen.getByRole('heading', { name: '¡Sala creada!' })).toBeInTheDocument();
    expect(screen.getByText('Estructuras de Datos - Secc 1')).toBeInTheDocument();
    expect(screen.getByText('EDS101')).toBeInTheDocument();
  });

  it('el botón de copiar copia el código y muestra confirmación visual (Escenario 4)', async () => {
    renderConfirmation();

    // `fireEvent`, no `userEvent.click`: `userEvent.setup()` pisa
    // `navigator.clipboard` con su propio stub antes del click (ver
    // Q3RoomCard.test.tsx).
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código de la sala' }));

    await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith('EDS101'));
  });

  it('"Ir al dashboard" navega a /dashboard (Escenario 5)', async () => {
    renderConfirmation();

    fireEvent.click(screen.getByRole('button', { name: 'Ir al dashboard' }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('"Configurar mis bloques" navega a /salas/:roomId/bloques (Escenario 6)', async () => {
    renderConfirmation();

    fireEvent.click(screen.getByRole('button', { name: 'Configurar mis bloques' }));

    await waitFor(() => {
      expect(screen.getByText('Configurar mis bloques (placeholder)')).toBeInTheDocument();
    });
  });
});
