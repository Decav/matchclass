import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { generateShortCode } from '@resources/utils/generate-short-code';
import { RoomCodeGenerationError } from '@resources/errors/room-code-generation.error';
import type { Room } from '@resources/entities/room.entity';
import type { RoomWithResponseCount } from '@resources/types/room-with-response-count.type';

const ROOM_CODE_LENGTH = 6;
const MAX_CODE_ATTEMPTS = 3;

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

  /**
   * Use case "CreateRoom" (RC-009 §5/§6, HU-07). Genera un código corto
   * (`generateShortCode`, sin conocer el dominio "sala" — ese significado lo
   * aporta este servicio) y verifica su unicidad con `findByCode` hasta 3
   * intentos en total. Si los 3 colisionan, `RoomCodeGenerationError` (caso
   * raro: 36⁶ combinaciones posibles).
   */
  createRoom: async (
    uid: string,
    data: Pick<Room, 'name' | 'subject' | 'section'>,
  ): Promise<{ id: string; code: string }> => {
    let code: string | null = null;

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const candidate = generateShortCode(ROOM_CODE_LENGTH);
      const existing = await RoomRepository.findByCode(candidate);
      if (!existing) {
        code = candidate;
        break;
      }
    }

    if (!code) throw new RoomCodeGenerationError();

    const { id } = await RoomRepository.create({ ...data, code, createdBy: uid });
    return { id, code };
  },
};
