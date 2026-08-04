import { useState, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, Sun, Moon, type LucideIcon } from 'lucide-react';
import { useThemeContext } from '@global/providers/theme-provider';

export interface Q5NavItem {
  label: string;
  icon: LucideIcon;
  /** Requerido salvo `disabled: true` (ítem "Próximamente" sin ruta todavía). */
  to?: string;
  /**
   * Ítem sin ruta ni interacción (RC-008 §10, "Próximamente"). Se renderiza
   * como texto estático en vez de `NavLink` — nunca navega, nunca dispara
   * `onClick`.
   */
  disabled?: boolean;
  /**
   * Si es `false`, este ítem nunca recibe el estilo "activo" aunque su `to`
   * coincida con la ruta actual. Existe para el caso de RC-008 §10 ("Dashboard"
   * y "Mis salas" navegan ambos a `/dashboard` mientras sea la misma página):
   * sin esto, `NavLink` marca los dos como activos a la vez, que no es lo que
   * muestra el diseño (un solo ítem resaltado). Default `true`.
   */
  matchActive?: boolean;
}

export interface Q5AppShellProps {
  /**
   * Contenido del área principal. Si se omite, renderiza `<Outlet />` — para
   * cuando `Q5AppShell` se monta directo como elemento de una ruta padre.
   */
  children?: ReactNode;
  /**
   * Ítems de navegación del sidebar. `global` no conoce dominios: los
   * módulos de producto (RC-004, RC-007, ...) inyectan los suyos por props.
   * Vacío por defecto — todavía no existe ningún módulo de producto.
   */
  navItems?: Q5NavItem[];
  /** Slot opcional para el pie del sidebar (panel de usuario, logout, etc). */
  footer?: ReactNode;
}

/**
 * Layout estándar de MatchClass: sidebar (280px, fijo en desktop >= 1024px,
 * overlay en mobile) + topbar (con toggle de tema) + área de contenido.
 *
 * Ver 12-design-system.md §4.3 / §5.
 */
export function Q5AppShell({ children, navItems = [], footer }: Q5AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useThemeContext();

  return (
    <div className="mc-app-shell">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-[var(--mc-z-overlay)]"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`mc-sidebar${sidebarOpen ? ' mc-sidebar--open' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="flex items-center gap-3 flex-shrink-0" style={{ paddingBottom: 20 }}>
          <div
            className="flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: 'var(--mc-text-inverse)',
              color: 'var(--mc-brand-primary)',
            }}
            aria-hidden="true"
          >
            MC
          </div>
          <span
            className="font-bold text-lg truncate"
            style={{ color: 'var(--mc-text-inverse)' }}
          >
            MatchClass
          </span>
        </div>

        {navItems.length > 0 && (
          <nav className="flex-1 flex flex-col gap-2 overflow-y-auto" aria-label="Secciones">
            {navItems.map((item) =>
              item.disabled || !item.to ? (
                <span key={item.label} className="mc-sidebar-item--disabled" aria-disabled="true">
                  <item.icon size={20} strokeWidth={2} className="mc-sidebar-item__icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `mc-sidebar-item${isActive && item.matchActive !== false ? ' mc-sidebar-item--active' : ''}`
                  }
                >
                  <item.icon size={20} strokeWidth={2} className="mc-sidebar-item__icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ),
            )}
          </nav>
        )}

        {footer && (
          <>
            <div className="mc-sidebar-divider" />
            <div className="mc-sidebar-footer">{footer}</div>
          </>
        )}
      </aside>

      {/* Main */}
      <div className="mc-main">
        <header className="mc-topbar">
          <button
            type="button"
            className="mc-btn mc-btn-ghost lg:hidden -ml-2 p-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            <Menu size={22} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="flex-1" />

          <button
            type="button"
            className="mc-btn mc-btn-ghost p-2"
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? (
              <Sun size={20} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Moon size={20} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </header>

        <main className="mc-content">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
