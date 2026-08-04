import { Link, useParams } from 'react-router-dom';

/**
 * Placeholder de `/salas/:roomId` (RC-008 §10) — destino de "Abrir" en una
 * room card del dashboard. La gestión/detalle real de una sala todavía no
 * es un RC. Mismo patrón que `PaRoomPlaceholder` (scheduling, `/sala/:roomId`
 * — esa es la grilla pública del alumno; esta es la vista del ayudante).
 */
export function PaRoomDetailPlaceholder() {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <div className="mc-card mc-empty-state flex flex-col items-center gap-4" style={{ maxWidth: 480 }}>
        <p className="mc-empty-state__title">Gestión de sala en construcción</p>
        <p className="mc-empty-state__description">
          El detalle y la gestión de esta sala todavía no están disponibles.
        </p>
        {roomId && (
          <p className="mc-numeric text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
            Sala: {roomId}
          </p>
        )}
        <Link to="/dashboard" className="mc-btn mc-btn-secondary">
          Volver al dashboard
        </Link>
      </div>
    </main>
  );
}
