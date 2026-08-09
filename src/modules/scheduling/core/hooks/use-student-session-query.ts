import { useQuery } from '@tanstack/react-query';
import { AuthRepository } from '@library/repositories/auth.repository';
import { queryKeys } from '@library/query/query-keys';

/**
 * Use case "ResolveStudentSession" (RC-013 §6, HU-11 Escenario 3). Devuelve
 * el uid de la sesión anónima que creó el flujo de código (HU-01), ya
 * restaurada desde IndexedDB, o `null` si en este navegador nadie pasó por
 * ese flujo.
 *
 * `staleTime: Infinity`: dentro de una misma carga de la app el uid no
 * cambia — el alumno no puede cerrar sesión desde ninguna pantalla suya.
 * Refetchearlo solo volvería a esperar una emisión de `onAuthStateChanged`
 * que ya tenemos.
 */
export function useStudentSessionQuery() {
  return useQuery({
    queryKey: queryKeys.auth.current,
    queryFn: () => AuthRepository.getRestoredUid(),
    staleTime: Infinity,
    retry: false,
  });
}
