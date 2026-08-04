import { Link } from 'react-router-dom';

/**
 * Placeholder de `/salas/nueva` (RC-008 §10). Destino de "Nueva sala" /
 * "Crear primera sala" — HU-07 (crear sala) todavía no es un RC. Mismo
 * patrón que `PaDashboardPlaceholder`/`PaRoomPlaceholder` (RC-003):
 * mínimo "en construcción", protegido por `Q5ProtectedRoute` junto con
 * `/dashboard`.
 */
export function PaNewRoomPlaceholder() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <div className="mc-card mc-empty-state flex flex-col items-center gap-4" style={{ maxWidth: 480 }}>
        <p className="mc-empty-state__title">Crear sala en construcción</p>
        <p className="mc-empty-state__description">
          El flujo para crear una nueva sala todavía no está disponible.
        </p>
        <Link to="/dashboard" className="mc-btn mc-btn-secondary">
          Volver al dashboard
        </Link>
      </div>
    </main>
  );
}
