import { Link } from 'react-router-dom';
import { DoorOpen, Plus } from 'lucide-react';

/**
 * Empty state del dashboard (RC-008 §9, Escenario 2 de HU-06) — replica el
 * frame "Dashboard - Sin Salas" (nodeId `PuN7E`).
 */
export function Q2DashboardEmptyState() {
  return (
    <div className="min-h-full flex items-center justify-center py-16">
      <div
        className="mc-card mc-empty-state flex flex-col items-center gap-4"
        style={{ maxWidth: 420 }}
      >
        <div className="mc-icon-circle mc-icon-circle--brand w-16 h-16">
          <DoorOpen size={28} strokeWidth={2} style={{ color: 'var(--mc-brand-primary)' }} aria-hidden="true" />
        </div>
        <div>
          <p className="mc-empty-state__title">Aún no tienes salas</p>
          <p className="mc-empty-state__description">
            Crea tu primera sala para empezar a coordinar horarios con tus alumnos
          </p>
        </div>
        <Link to="/salas/nueva" className="mc-btn mc-btn-primary">
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
          Crear primera sala
        </Link>
      </div>
    </div>
  );
}
