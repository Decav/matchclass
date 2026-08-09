import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RoomRepository } from '@library/repositories/room.repository';
import { queryKeys } from '@library/query/query-keys';
import type { RoomStatus } from '@resources/entities/room.entity';

export interface UpdateRoomStatusInput {
  roomId: string;
  status: RoomStatus;
}

/**
 * Use case "UpdateRoomStatus" (RC-012 §6, HU-10 Escenarios 1/3/4). Cubre las
 * tres transiciones con una sola mutación — cerrar, reabrir y eliminar solo
 * se distinguen por el `status` destino.
 *
 * Llama al repositorio directo, sin pasar por `RoomService`: es una sola
 * escritura a un solo repositorio, no combina nada (RC-012 §10). Un service
 * acá sería un passthrough.
 *
 * Sin update optimista a propósito (RC-012 §6.4): la sala solo cambia de
 * sección cuando Firestore confirmó la escritura y el refetch trajo el dato
 * nuevo. Si falla, la lista nunca llegó a mentir.
 */
export function useUpdateRoomStatusMutation(uid: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, UpdateRoomStatusInput>({
    mutationFn: ({ roomId, status }) => RoomRepository.updateStatus(roomId, status),
    onSuccess: (_data, { roomId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byOwner(uid) });
      // La pantalla de detalle/bloques lee la misma sala por su id: sin esto
      // seguiría sirviendo el `status` viejo desde el cache.
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(roomId) });
    },
  });
}
