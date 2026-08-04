import type { Room } from '@resources/entities/room.entity';

/**
 * VO de UI (RC-008 §3): la sala más el conteo de su subcolección
 * `responses`. No persiste — se calcula en `RoomService.getDashboardRooms`
 * combinando `RoomRepository` + `ResponseRepository`.
 */
export type RoomWithResponseCount = Room & { responseCount: number };
