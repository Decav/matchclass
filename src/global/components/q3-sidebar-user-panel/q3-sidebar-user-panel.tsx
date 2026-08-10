import { LogOut } from 'lucide-react';
import { useAuthStore } from '@global/store/auth.store';
import { useLogoutMutation } from '@global/hooks/use-logout-mutation';

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Contenido del `footer` de `Q5AppShell` (RC-008 §9, Escenario 1/6 de
 * HU-06): avatar + nombre + email del ayudante autenticado, y el botón
 * "Cerrar sesión" que reutiliza `useLogoutMutation` (RC-006) sin cambios.
 *
 * Vive en `global/` desde RC-014: lo consumen las páginas de `home` y las
 * de `results`, así que no pertenece a ninguno de los dos módulos. El
 * logout siempre fue una acción global (HU-04) — haberlo dejado en
 * `modules/home` fue un error de ubicación inicial, no un diseño.
 */
export function Q3SidebarUserPanel() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogoutMutation();

  const displayName = user?.displayName || 'Ayudante';
  const initials = getInitials(displayName);

  return (
    <>
      <div className="flex items-center" style={{ gap: 10, padding: '0 4px' }}>
        <div
          className="flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: 'var(--mc-brand-accent)',
            color: 'var(--mc-brand-primary)',
          }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate"
            style={{ color: 'var(--mc-text-inverse)', fontSize: 13, fontWeight: 600 }}
          >
            {displayName}
          </p>
          <p
            className="truncate"
            style={{ color: 'var(--mc-sidebar-text-muted)', fontSize: 11, fontWeight: 400 }}
          >
            {user?.email ?? ''}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="mc-sidebar-logout-btn w-full"
        onClick={() => logout()}
        disabled={isPending}
      >
        <LogOut size={18} strokeWidth={2} aria-hidden="true" />
        {isPending ? 'Cerrando...' : 'Cerrar sesión'}
      </button>
    </>
  );
}
