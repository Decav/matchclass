import { useQuery } from '@tanstack/react-query';
import { ResponseRepository } from '@library/repositories/response.repository';
import { queryKeys } from '@library/query/query-keys';

/**
 * Use case "LoadStudentGrid" paso 3 (RC-013 §6, HU-11 Escenario 3):
 * precarga la respuesta previa del alumno en esta sala.
 *
 * `retry: false` y sin estado de error propio: si la lectura falla, el
 * componente lo trata igual que "todavía no respondió" y la grilla arranca
 * vacía (RC-013 §4) — ningún escenario Gherkin define una pantalla de error
 * para la precarga, y reintentar solo demoraría llegar al mismo lugar.
 */
export function useStudentResponseQuery(roomId: string, uid: string | null) {
  return useQuery({
    queryKey: queryKeys.responses.mine(roomId, uid ?? ''),
    queryFn: () => ResponseRepository.getMine(roomId, uid ?? ''),
    enabled: Boolean(roomId) && Boolean(uid),
    retry: false,
  });
}
