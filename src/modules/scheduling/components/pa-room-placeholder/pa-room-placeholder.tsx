import { useParams } from 'react-router-dom';

/**
 * Placeholder de `/sala/:roomId`. Los Escenarios 9/14/16 de HU-01 exigen
 * redirigir aquí, pero la grilla real es RC-005 — mismo patrón que RC-002
 * dejó `Q5AppShell` con navegación vacía para que RC-004/007 la completaran.
 */
export function PaRoomPlaceholder() {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <div className="mc-card mc-empty-state" style={{ maxWidth: 480 }}>
        <p className="mc-empty-state__title">Grilla en construcción</p>
        <p className="mc-empty-state__description">
          La grilla de bloques de esta sala todavía no está disponible. Tu respuesta ya quedó
          guardada — vuelve a intentarlo más adelante.
        </p>
        {roomId && (
          <p className="mc-numeric text-xs mt-2" style={{ color: 'var(--mc-text-tertiary)' }}>
            Sala: {roomId}
          </p>
        )}
      </div>
    </main>
  );
}
