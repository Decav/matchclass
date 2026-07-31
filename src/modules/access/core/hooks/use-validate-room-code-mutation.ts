import { useMutation } from '@tanstack/react-query';
import { AuthRepository } from '@library/repositories/auth.repository';
import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { RoomNotFoundError } from '@resources/errors/room-not-found.error';
import { RoomClosedError } from '@resources/errors/room-closed.error';
import type { Room } from '@resources/entities/room.entity';
import type { RoomCodeFormValues } from '../schemas/room-code.schema';

export interface ValidateRoomCodeResult {
  uid: string;
  room: Room;
  hasExistingResponse: boolean;
}

/**
 * Use case "ValidateRoomCode" (RC-003 §6): asegura sesión anónima, busca la
 * sala por código, valida su estado y chequea si el alumno ya respondió.
 */
export function useValidateRoomCodeMutation() {
  return useMutation<ValidateRoomCodeResult, unknown, RoomCodeFormValues>({
    mutationFn: async ({ code }) => {
      const uid = await AuthRepository.ensureAnonymousSession();

      const room = await RoomRepository.findByCode(code);
      if (!room) throw new RoomNotFoundError();
      if (room.status !== 'active') throw new RoomClosedError();

      const existingResponse = await ResponseRepository.getMine(room.id, uid);
      return { uid, room, hasExistingResponse: existingResponse !== null };
    },
  });
}
