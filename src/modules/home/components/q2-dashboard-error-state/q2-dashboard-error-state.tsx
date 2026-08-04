import { RefreshCw, WifiOff } from 'lucide-react';

export interface Q2DashboardErrorStateProps {
  onRetry: () => void;
}

/**
 * Estado de error del dashboard (RC-008 §4/§9, Escenario 4 de HU-06) —
 * replica el frame "Dashboard - Error" (nodeId `jB582`). Sin tipo de error
 * propio: cualquier falla de la query cae acá, con reintento vía `refetch`.
 */
export function Q2DashboardErrorState({ onRetry }: Q2DashboardErrorStateProps) {
  return (
    <div className="min-h-full flex items-center justify-center py-16">
      <div
        className="mc-card mc-empty-state flex flex-col items-center gap-4"
        style={{ maxWidth: 420 }}
      >
        <div className="mc-icon-circle mc-icon-circle--danger w-16 h-16">
          <WifiOff size={28} strokeWidth={2} style={{ color: 'var(--mc-danger)' }} aria-hidden="true" />
        </div>
        <div>
          <p className="mc-empty-state__title">No se pudieron cargar tus salas</p>
          <p className="mc-empty-state__description">Verifica tu conexión e intenta de nuevo</p>
        </div>
        <button type="button" className="mc-btn mc-btn-primary" onClick={onRetry}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
