import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import type { RoomWithResponseCount } from '@resources/types/room-with-response-count.type';

/**
 * Activas primero (por `createdAt` DESC), luego el resto (`closed`/
 * `archived`, también por `createdAt` DESC) — RC-008 §5/§6.
 */
function compareDashboardRooms(a: RoomWithResponseCount, b: RoomWithResponseCount): number {
  const aActive = a.status === 'active';
  const bActive = b.status === 'active';
  if (aActive !== bActive) return aActive ? -1 : 1;
  return b.createdAt.getTime() - a.createdAt.getTime();
}

/**
 * Primer archivo real de la capa `services/` (RC-008 §10, `01-layers.md`
 * Capa 3): combina dos repositorios en vez de que el hook de la página lo
 * haga directo. RCs futuros que necesiten combinar llamadas deberían seguir
 * este mismo patrón.
 */
export const RoomService = {
  getDashboardRooms: async (uid: string): Promise<RoomWithResponseCount[]> => {
    const rooms = await RoomRepository.listByOwner(uid);
    const responseCounts = await Promise.all(rooms.map((room) => ResponseRepository.countByRoom(room.id)));

    const withCounts: RoomWithResponseCount[] = rooms.map((room, index) => ({
      ...room,
      responseCount: responseCounts[index] ?? 0,
    }));

    return withCounts.sort(compareDashboardRooms);
  },
};
