import { Q1Skeleton } from '@global/components/q1-skeleton';
import { USM_SCHEDULE_BLOCKS } from '@resources/constants/usm-schedule';

/**
 * Carga de los resultados (RC-014 §9, HU-12 Escenario 7): skeletons con la
 * forma del heatmap y del ranking, para que no haya salto de layout cuando
 * llegan los datos. El `Q5AppShell` (sidebar y topbar) se renderiza normal
 * por fuera de este componente.
 */
export function Q3ResultsSkeleton() {
  return (
    <div className="mc-results-columns" role="status" aria-label="Cargando los resultados">
      <div className="flex flex-col gap-4">
        <Q1Skeleton width={200} height={16} borderRadius={4} />
        <div className="mc-heatmap">
          {USM_SCHEDULE_BLOCKS.map((block) => (
            <Q1Skeleton key={block.blockNumber} width="100%" height={40} borderRadius={6} />
          ))}
        </div>
      </div>

      <div className="mc-results-columns__aside flex flex-col gap-4">
        <Q1Skeleton width={140} height={16} borderRadius={4} />
        {[0, 1, 2].map((i) => (
          <Q1Skeleton key={i} width="100%" height={72} borderRadius={12} />
        ))}
      </div>
    </div>
  );
}
