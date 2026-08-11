import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { ThemeProvider } from '@global/providers/theme-provider';
import { Q5AppShell, type Q5NavItem } from './q5-app-shell';

/**
 * RC-016 (HU-14, Escenarios 1 y 2): regresión del toggle de tema del topbar,
 * ya implementado desde RC-002 pero nunca cubierto. El mecanismo en sí lo
 * prueba `use-theme.test.ts`; acá se verifica el contrato de accesibilidad —
 * qué ícono y qué `aria-label` ve el usuario en cada modo.
 */
function renderShell(navItems: Q5NavItem[] = []) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Q5AppShell navItems={navItems}>
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

/**
 * RC-020 (HU-17, Escenario 4): ciclo de vida del overlay del menú mobile.
 *
 * Es la mitad que **ya funcionaba** antes del RC —el overlay se renderiza
 * condicionalmente, así que al cerrarse desaparece del árbol— y que la HU
 * original describía mal ("que el overlay se elimine completamente del DOM").
 * Queda cubierta como regresión. La otra mitad, el orden de capas que era el bug
 * real, no se ve desde acá: jsdom no calcula layout ni resuelve `var()`, así que
 * la fija `theme-z-index.test.ts` sobre `theme.css`.
 */
describe('Q5AppShell — overlay del menú mobile', () => {
  const NAV_ITEMS: Q5NavItem[] = [{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' }];

  function overlay(container: HTMLElement): Element | null {
    return container.querySelector('.mc-sidebar-overlay');
  }

  it('sin abrir el menú no hay overlay en el DOM', () => {
    const { container } = renderShell(NAV_ITEMS);

    expect(overlay(container)).not.toBeInTheDocument();
    expect(container.querySelector('.mc-sidebar--open')).not.toBeInTheDocument();
  });

  it('el botón de menú monta el overlay y abre el panel', async () => {
    const user = userEvent.setup();
    const { container } = renderShell(NAV_ITEMS);

    await user.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));

    expect(overlay(container)).toBeInTheDocument();
    expect(container.querySelector('.mc-sidebar--open')).toBeInTheDocument();
  });

  it('elegir un ítem del menú cierra el panel y desmonta el overlay', async () => {
    const user = userEvent.setup();
    const { container } = renderShell(NAV_ITEMS);

    await user.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));

    expect(overlay(container)).not.toBeInTheDocument();
    expect(container.querySelector('.mc-sidebar--open')).not.toBeInTheDocument();
  });

  it('tocar el overlay fuera del panel lo cierra y no deja nada en el DOM', async () => {
    const user = userEvent.setup();
    const { container } = renderShell(NAV_ITEMS);

    await user.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    const backdrop = overlay(container);
    if (!backdrop) throw new Error('El overlay no se montó al abrir el menú');

    await user.click(backdrop);

    expect(overlay(container)).not.toBeInTheDocument();
    expect(container.querySelector('.mc-sidebar--open')).not.toBeInTheDocument();
  });
});
