import { Q1Skeleton } from '@global/components/q1-skeleton';

/**
 * Estado de carga del dashboard (RC-008 §9, Escenario 3 de HU-06):
 * skeletons de header, KPIs y room cards — el sidebar/topbar de
 * `Q5AppShell` se renderizan normalmente por fuera de este componente.
 * Replica el frame "Dashboard - Cargando" (nodeId `y5cHt`).
 */
export function Q3DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Cargando tus salas">
      <div className="flex flex-col gap-2">
        <Q1Skeleton width={220} height={32} borderRadius={8} />
        <Q1Skeleton width={320} height={16} borderRadius={6} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Q1Skeleton key={i} width="100%" height={80} borderRadius={12} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="mc-room-card">
            <Q1Skeleton width={180} height={16} borderRadius={4} />
            <Q1Skeleton width={80} height={14} borderRadius={4} />
            <Q1Skeleton width="100%" height={6} borderRadius={3} />
            <Q1Skeleton width={90} height={32} borderRadius={8} />
          </div>
        ))}
      </div>
    </div>
  );
}
