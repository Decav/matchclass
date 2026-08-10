import { RefreshCw, WifiOff } from 'lucide-react';

export interface Q2ResultsErrorStateProps {
  onRetry: () => void;
}

/**
 * Estado de error de los resultados (RC-014 §4/§9, HU-12 Escenario 8). Sin
 * tipo de error propio: cualquier falla de la sala o de las respuestas cae
 * acá, con reintento vía `refetch`.
 *
 * Duplica la forma de `Q2DashboardErrorState` (RC-008) a propósito: vive en
 * otro módulo y los módulos no se importan entre sí. Si aparece un tercer
 * caso, corresponde promoverlo a `global/`, no cruzar módulos.
 */
export function Q2ResultsErrorState({ onRetry }: Q2ResultsErrorStateProps) {
  return (
    <div className="min-h-full flex items-center justify-center py-16">
      <div className="mc-card mc-empty-state flex flex-col items-center gap-4" style={{ maxWidth: 420 }}>
        <div className="mc-icon-circle mc-icon-circle--danger w-16 h-16">
          <WifiOff size={28} strokeWidth={2} style={{ color: 'var(--mc-danger)' }} aria-hidden="true" />
        </div>
        <div>
          <p className="mc-empty-state__title">No se pudieron cargar los resultados</p>
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
