import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RoomRepository } from '@library/repositories/room.repository';
import { RoomNotFoundError } from '@resources/errors/room-not-found.error';
import type { LandingCodeFormValues } from '../schemas/landing-code.schema';

/**
 * Use case "SubmitLandingCode" (RC-015 §6). Solo verifica que la sala exista.
 *
 * No mira `room.status` a propósito (RC-015 D4): con una sala cerrada también
 * navega, y el mensaje "Esta sala ya no acepta respuestas" lo sigue dando el
 * flujo del alumno en `/acceso` — así la regla de "sala cerrada" queda en un
 * único lugar (RC-003) en vez de duplicada en dos pantallas.
 *
 * Tampoco reusa `useValidateRoomCodeMutation` (módulo `access`) ni crea la
 * sesión anónima: la landing solo necesita saber a dónde mandar al visitante.
 */
export function useLandingCodeMutation() {
  const navigate = useNavigate();

  return useMutation<string, unknown, LandingCodeFormValues>({
    mutationFn: async ({ code }) => {
      const room = await RoomRepository.findByCode(code);
      if (!room) throw new RoomNotFoundError();
      // Se propaga el código canónico de Firestore, no lo tipeado: el match
      // de `findByCode` es en mayúsculas, así que el enlace resultante es el
      // mismo se haya escrito como se haya escrito.
      return room.code;
    },
    onSuccess: (code) => {
      // El código viaja en la URL (RC-011): `/acceso` ya sabe leer `?codigo=`
      // y precargarlo en las celdas del tab Alumno.
      void navigate(`/acceso?tipo=alumno&codigo=${encodeURIComponent(code)}`);
    },
  });
}
