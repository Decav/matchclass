import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { Q1LoadingSpinner } from '@global/components/q1-loading-spinner';
import { Q5AccessTabs } from '../q5-access-tabs/q5-access-tabs';

/**
 * Página `/acceso` (HU-01). Mientras `AuthStatus` es `idle`/`loading` no
 * renderiza tabs (spinner con logo, evita el flash de login — Escenario 4).
 * Con sesión de ayudante ya activa, redirige a `/dashboard` sin mostrar el
 * formulario.
 *
 * `p-4 md:p-6` (RC-020 §6): en 375px los 24px de desktop dejaban la card con
 * 279px útiles y las seis celdas del código de sala necesitan 304 —el ancho de
 * celda de 44px es un mínimo táctil y no se negocia—, así que el tab Alumno
 * desbordaba en horizontal. Con 16px de padding entran justas. Mismo cambio en
 * `/registro` y `/recuperar`, que comparten la card.
 */
export function PaAccess() {
  const status = useAuthStore((s) => s.status);

  if (status === AuthStatus.Idle || status === AuthStatus.Loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-4 md:p-6"
        style={{ background: 'var(--mc-surface)' }}
      >
        <Q1LoadingSpinner size="lg" label="Cargando MatchClass…" />
      </main>
    );
  }

  if (status === AuthStatus.Authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <Q5AccessTabs />
    </main>
  );
}
