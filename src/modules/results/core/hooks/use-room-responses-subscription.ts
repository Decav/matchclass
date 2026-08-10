import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ResponseRepository } from '@library/repositories/response.repository';
import { queryKeys } from '@library/query/query-keys';
import type { Response } from '@resources/entities/response.entity';

/**
 * Use case "WatchRoomResponses" (RC-014 §6, HU-12 Escenario 4). `onSnapshot`
 * no encaja en `useQuery` (que es request/response), así que este hook
 * sincroniza el cache a mano: cada snapshot escribe la lista completa sobre
 * `queryKeys.responses.byRoom`, la misma key que llenó
 * `useRoomResponsesQuery`.
 *
 * `setQueryData` y no `invalidateQueries`: el snapshot **ya trae** los datos
 * nuevos. Invalidar dispararía una lectura extra a Firestore por cada
 * respuesta que llega, para terminar con lo mismo que ya tenemos en la mano.
 *
 * El efecto devuelve el unsubscribe: sin eso cada montaje deja un listener
 * abierto (en StrictMode, dos en dev).
 */
export function useRoomResponsesSubscription(roomId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = ResponseRepository.subscribeByRoom(roomId, (responses: Response[]) => {
      queryClient.setQueryData(queryKeys.responses.byRoom(roomId), responses);
    });

    return unsubscribe;
  }, [roomId, queryClient]);
}
