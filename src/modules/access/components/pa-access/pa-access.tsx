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
 */
export function PaAccess() {
  const status = useAuthStore((s) => s.status);

  if (status === AuthStatus.Idle || status === AuthStatus.Loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6"
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
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <Q5AccessTabs />
    </main>
  );
}
