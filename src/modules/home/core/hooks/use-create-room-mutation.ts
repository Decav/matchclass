import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RoomService } from '@library/services/room.service';
import { queryKeys } from '@library/query/query-keys';
import { useAuthStore } from '@global/store/auth.store';
import type { CreateRoomFormValues } from '../schemas/create-room.schema';

export interface CreateRoomResult {
  id: string;
  code: string;
}

/**
 * Use case "CreateRoom" (RC-009 §6, HU-07). El `uid` se lee del store, no
 * llega por parámetro — mismo criterio que `useLogoutMutation`/
 * `useRegisterMutation`: `Q4CreateRoomForm` solo se monta bajo
 * `Q5ProtectedRoute`, así que siempre hay sesión.
 *
 * Invalida `queryKeys.rooms.byOwner(uid)` en éxito para que, al volver a
 * `/dashboard`, `useDashboardRoomsQuery` no sirva la lista cacheada de antes
 * de crear la sala (Escenario 5) — sin esto, `staleTime: 30_000` la ocultaría
 * hasta que expire el cache.
 */
export function useCreateRoomMutation() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.user?.id ?? '');

  return useMutation<CreateRoomResult, unknown, CreateRoomFormValues>({
    mutationFn: (values) => RoomService.createRoom(uid, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byOwner(uid) });
    },
  });
}
