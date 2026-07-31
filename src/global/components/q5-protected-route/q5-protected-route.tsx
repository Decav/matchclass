import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { Q1LoadingSpinner } from '@global/components/q1-loading-spinner/q1-loading-spinner';

export interface Q5ProtectedRouteProps {
  redirectTo?: string;
}

/**
 * Layout route que protege rutas privadas del ayudante (RC-005, HU-03).
 * Hoy envuelve solo `/dashboard`; cualquier ruta futura bajo `/salas/*`
 * puede reutilizarlo sin modificarlo.
 *
 * Crítico: mientras `status` es `idle`/`loading` (Firebase todavía no resolvió
 * la sesión) no se redirige ni se muestra el contenido — evita expulsar al
 * ayudante en cada F5 y el flash de `/acceso` (RC-005 §6, Escenario 4).
 */
export function Q5ProtectedRoute({ redirectTo = '/acceso' }: Q5ProtectedRouteProps) {
  const status = useAuthStore((s) => s.status);

  if (status === AuthStatus.Idle || status === AuthStatus.Loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Q1LoadingSpinner size="lg" label="Verificando sesión..." />
      </div>
    );
  }

  if (status !== AuthStatus.Authenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
