import { useQuery } from '@tanstack/react-query';
import { RoomService } from '@library/services/room.service';
import { queryKeys } from '@library/query/query-keys';

/**
 * Use case "LoadDashboard" (RC-008 §6). `PaDashboard` solo se monta bajo
 * `Q5ProtectedRoute` — `uid` llega siempre con sesión ya autenticada, nunca
 * se llama con un uid vacío.
 */
export function useDashboardRoomsQuery(uid: string) {
  return useQuery({
    queryKey: queryKeys.rooms.byOwner(uid),
    queryFn: () => RoomService.getDashboardRooms(uid),
  });
}
