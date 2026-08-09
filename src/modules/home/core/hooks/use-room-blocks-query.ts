import { useQuery } from '@tanstack/react-query';
import { RoomRepository } from '@library/repositories/room.repository';
import { queryKeys } from '@library/query/query-keys';

/**
 * Use case "LoadRoomBlocks" (RC-010 §6, HU-08 Escenario 2). `retry: false`
 * a propósito: si `RoomRepository.getById` falla, el componente lo trata
 * igual que "sala sin restricciones" (RC-010 §4 — sin escenario Gherkin para
 * un error de lectura, la grilla arranca vacía en vez de bloquear la
 * pantalla). Reintentar 3 veces solo demoraría llegar a ese mismo resultado.
 */
export function useRoomBlocksQuery(roomId: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId),
    queryFn: () => RoomRepository.getById(roomId),
    retry: false,
  });
}
