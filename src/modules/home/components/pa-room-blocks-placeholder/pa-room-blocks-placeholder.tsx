import { Link, useParams } from 'react-router-dom';

/**
 * Placeholder de `/salas/:roomId/bloques` (RC-009 §10) — destino de
 * "Configurar mis bloques" desde la confirmación de creación de sala. La
 * configuración de restricciones del ayudante es HU-08, todavía sin RC. El
 * frame `Configurar Mis Bloques` (nodeId `N2rqv`) ya existe en el `.pen`
 * para cuando se escriba esa HU. Mismo patrón que `PaRoomDetailPlaceholder`
 * (RC-008): mínimo "en construcción", protegido por `Q5ProtectedRoute`.
 */
export function PaRoomBlocksPlaceholder() {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <div className="mc-card mc-empty-state flex flex-col items-center gap-4" style={{ maxWidth: 480 }}>
        <p className="mc-empty-state__title">Configurar mis bloques en construcción</p>
        <p className="mc-empty-state__description">
          La configuración de restricciones del ayudante todavía no está disponible.
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
