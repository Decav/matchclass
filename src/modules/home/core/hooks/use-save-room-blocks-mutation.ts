import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RoomRepository } from '@library/repositories/room.repository';
import { queryKeys } from '@library/query/query-keys';

/**
 * Use case "SaveRoomBlocks" (RC-010 §6, HU-08 Escenario 1/6). Invalida
 * `queryKeys.rooms.detail(roomId)` en éxito para que, si el ayudante vuelve
 * a esta pantalla, `useRoomBlocksQuery` no sirva el `helperBlockedSlots`
 * cacheado de antes de guardar — mismo criterio que `useCreateRoomMutation`
 * (RC-009) con `queryKeys.rooms.byOwner`.
 */
export function useSaveRoomBlocksMutation(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number[]>({
    mutationFn: (blockedSlots) => RoomRepository.updateBlockedSlots(roomId, blockedSlots),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(roomId) });
    },
  });
}
