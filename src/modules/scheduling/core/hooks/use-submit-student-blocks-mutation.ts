import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ResponseRepository } from '@library/repositories/response.repository';
import { queryKeys } from '@library/query/query-keys';

/**
 * Use case "SubmitStudentBlocks" (RC-013 §6, HU-11 Escenario 2). Llama al
 * repositorio directo, sin pasar por un service: es una escritura a un solo
 * repositorio, no combina nada (mismo criterio de RC-010 y RC-012).
 *
 * Invalida `queryKeys.responses.mine` en éxito para que una recarga —o un
 * remount de la pantalla— lea los bloques recién guardados y no los del
 * cache anterior.
 */
export function useSubmitStudentBlocksMutation(roomId: string, uid: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number[]>({
    mutationFn: (occupiedBlocks) => ResponseRepository.updateBlocks(roomId, uid, occupiedBlocks),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.responses.mine(roomId, uid) });
    },
  });
}
