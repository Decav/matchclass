import { useQuery } from '@tanstack/react-query';
import { RoomRepository } from '@library/repositories/room.repository';
import { queryKeys } from '@library/query/query-keys';

/**
 * Sala de `/salas/:roomId` (RC-014 §6, "LoadRoomResults" paso 1): aporta el
 * nombre para el topbar y `helperBlockedSlots`, la hard constraint del
 * heatmap.
 *
 * Hook propio del módulo `results` aunque `useRoomBlocksQuery` (RC-010) lea
 * el mismo documento: los módulos no se importan entre sí. La query key es
 * la misma, así que comparten cache.
 */
export function useResultsRoomQuery(roomId: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId),
    queryFn: () => RoomRepository.getById(roomId),
    enabled: Boolean(roomId),
  });
}
