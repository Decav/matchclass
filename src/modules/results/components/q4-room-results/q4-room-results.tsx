import { useMemo } from 'react';
import { useResultsRoomQuery } from '../../core/hooks/use-results-room-query';
import { useRoomResponsesQuery } from '../../core/hooks/use-room-responses-query';
import { useRoomResponsesSubscription } from '../../core/hooks/use-room-responses-subscription';
import { buildRoomResult } from '../../core/utils/build-room-result';
import { Q2ResultsTabs } from '../q2-results-tabs';
import { Q3HeatmapGrid } from '../q3-heatmap-grid';
import { Q2RankingItem } from '../q2-ranking-item';
import { Q3ResultsSkeleton } from '../q3-results-skeleton';
import { Q2ResultsEmptyState } from '../q2-results-empty-state';
import { Q2ResultsErrorState } from '../q2-results-error-state';

export interface Q4RoomResultsProps {
  roomId: string;
}

/**
 * Organismo con la lógica de "LoadRoomResults" (RC-014 §6, HU-12). Único
 * punto donde se elige el estado de render: loading -> skeletons, error ->
 * reintento, sin respuestas -> empty state, datos -> heatmap + ranking.
 *
 * El resultado se calcula acá con `buildRoomResult` sobre lo que hay en el
 * cache (RC-014 D2). La suscripción empuja cada snapshot a esa misma key, y
 * el `useMemo` recalcula sin volver a leer Firestore: una respuesta nueva
 * cuesta cero lecturas extra (Escenario 4).
 */
export function Q4RoomResults({ roomId }: Q4RoomResultsProps) {
  const roomQuery = useResultsRoomQuery(roomId);
  const responsesQuery = useRoomResponsesQuery(roomId);
  useRoomResponsesSubscription(roomId);

  const responses = responsesQuery.data;
  const blockedSlots = roomQuery.data?.helperBlockedSlots;

  const result = useMemo(
    () => (responses ? buildRoomResult(responses, blockedSlots ?? []) : null),
    [responses, blockedSlots],
  );

  if (roomQuery.isLoading || responsesQuery.isLoading) return <Q3ResultsSkeleton />;

  if (roomQuery.isError || responsesQuery.isError || !roomQuery.data) {
    return (
      <Q2ResultsErrorState
        onRetry={() => {
          void roomQuery.refetch();
          void responsesQuery.refetch();
        }}
      />
    );
  }

  if (!result || result.totalResponses === 0) return <Q2ResultsEmptyState />;

  return (
    <div className="flex flex-col gap-5">
      <Q2ResultsTabs />

      <div className="mc-results-columns">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="mc-results__title">Mapa de disponibilidad</h2>
            <p className="mc-results__subtitle">
              {result.totalResponses} {result.totalResponses === 1 ? 'alumno respondió' : 'alumnos respondieron'}
            </p>
          </div>
          <Q3HeatmapGrid heatmap={result.heatmap} />
        </section>

        <section className="mc-results-columns__aside flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="mc-results__title">Top 3 horarios</h2>
            <p className="mc-results__subtitle">Mejores coincidencias para coordinar</p>
          </div>
          {result.ranking.map((entry, index) => (
            <Q2RankingItem key={entry.block} entry={entry} position={index + 1} />
          ))}
        </section>
      </div>
    </div>
  );
}
