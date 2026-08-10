import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@global/providers/theme-provider';
import { Q5AppShell } from './q5-app-shell';

/**
 * RC-016 (HU-14, Escenarios 1 y 2): regresión del toggle de tema del topbar,
 * ya implementado desde RC-002 pero nunca cubierto. El mecanismo en sí lo
 * prueba `use-theme.test.ts`; acá se verifica el contrato de accesibilidad —
 * qué ícono y qué `aria-label` ve el usuario en cada modo.
 */
function renderShell() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Q5AppShell>
          <p>Contenido</p>
        </Q5AppShell>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('Q5AppShell — toggle de tema', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('en modo claro muestra la luna y ofrece "Cambiar a modo oscuro"', () => {
    const { container } = renderShell();

    const toggle = screen.getByRole('button', { name: 'Cambiar a modo oscuro' });
    expect(toggle).toHaveAttribute('title', 'Modo oscuro');
    expect(container.querySelector('.lucide-moon')).toBeInTheDocument();
    expect(container.querySelector('.lucide-sun')).not.toBeInTheDocument();
  });

  it('tras alternar, muestra el sol y ofrece "Cambiar a modo claro"', async () => {
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }));

    const toggle = screen.getByRole('button', { name: 'Cambiar a modo claro' });
    expect(toggle).toHaveAttribute('title', 'Modo claro');
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument();
    expect(container.querySelector('.lucide-moon')).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
