import { useState, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, Sun, Moon, GraduationCap, type LucideIcon } from 'lucide-react';
import { useThemeContext } from '@global/providers/theme-provider';

export interface Q5NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
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
        <div
          className="flex items-center gap-3 px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--mc-sidebar-border)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--mc-brand-gradient)' }}
          >
            <GraduationCap size={18} strokeWidth={2} style={{ color: 'var(--mc-text-inverse)' }} />
          </div>
          <span
            className="font-semibold text-sm truncate"
            style={{ color: 'var(--mc-sidebar-text)' }}
          >
            MatchClass
          </span>
        </div>

        {navItems.length > 0 && (
          <nav className="flex-1 py-4 overflow-y-auto" aria-label="Secciones">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `mc-sidebar-item${isActive ? ' mc-sidebar-item--active' : ''}`
                }
              >
                <item.icon size={18} strokeWidth={2} className="mc-sidebar-item__icon" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {footer && (
          <div
            className="flex-shrink-0 p-4"
            style={{ borderTop: '1px solid var(--mc-sidebar-border)' }}
          >
            {footer}
          </div>
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
