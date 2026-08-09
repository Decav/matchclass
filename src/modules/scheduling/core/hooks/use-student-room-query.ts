import { useQuery } from '@tanstack/react-query';
import { RoomRepository } from '@library/repositories/room.repository';
import { queryKeys } from '@library/query/query-keys';

/**
 * Sala de `/sala/:roomId` (RC-013 §6, "LoadStudentGrid" paso 1): da el
 * nombre del header y el `status` con el que se decide si la grilla se
 * muestra o no (§4, sala cerrada por URL directa).
 *
 * Hook propio del módulo `scheduling`, aunque `useRoomBlocksQuery` (RC-010)
 * lea el mismo documento: los módulos no se importan entre sí. La query key
 * sí es la misma (`queryKeys.rooms.detail`), así que las dos pantallas
 * comparten cache.
 */
export function useStudentRoomQuery(roomId: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId),
    queryFn: () => RoomRepository.getById(roomId),
    enabled: Boolean(roomId),
    retry: false,
  });
}
