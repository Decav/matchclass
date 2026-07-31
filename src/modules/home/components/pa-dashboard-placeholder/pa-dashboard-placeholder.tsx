import { useAuthStore } from '@global/store/auth.store';

/**
 * Placeholder de `/dashboard`. `useLoginMutation` (RC-003) redirige aquí tras
 * un login exitoso, pero el dashboard real es RC-007 — fuera de alcance de
 * este RC. Sin esta ruta, `navigate('/dashboard')` caía en el catch-all del
 * router y no había nada que verificar en el E2E de login. Mismo patrón que
 * `PaRoomPlaceholder` (RC-005-del-tech-document lo reemplazará).
 *
 * Protegida por `Q5ProtectedRoute` (RC-005, HU-03) desde `app-router.tsx` —
 * solo se renderiza con sesión activa.
 */
export function PaDashboardPlaceholder() {
  const user = useAuthStore((s) => s.user);

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <div className="mc-card mc-empty-state" style={{ maxWidth: 480 }}>
        <p className="mc-empty-state__title">Dashboard en construcción</p>
        <p className="mc-empty-state__description">
          {user
            ? `Sesión iniciada como ${user.displayName || user.email}. El dashboard todavía no está disponible.`
            : 'El dashboard todavía no está disponible.'}
        </p>
      </div>
    </main>
  );
}
