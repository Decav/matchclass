import { useQuery } from '@tanstack/react-query';
import { ResponseRepository } from '@library/repositories/response.repository';
import { queryKeys } from '@library/query/query-keys';

/**
 * Carga inicial de las respuestas de la sala (RC-014 §6, "LoadRoomResults"
 * paso 2). A partir de ahí manda `useRoomResponsesSubscription`, que escribe
 * sobre esta misma key.
 *
 * `staleTime: Infinity`: con la suscripción viva, un refetch por foco de
 * ventana solo repetiría lecturas que `onSnapshot` ya empujó.
 */
export function useRoomResponsesQuery(roomId: string) {
  return useQuery({
    queryKey: queryKeys.responses.byRoom(roomId),
    queryFn: () => ResponseRepository.listByRoom(roomId),
    enabled: Boolean(roomId),
    staleTime: Infinity,
  });
}
