import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ResponseRepository } from '@library/repositories/response.repository';
import type { StudentNameFormValues } from '../schemas/student-name.schema';

interface SubmitStudentNameInput extends StudentNameFormValues {
  roomId: string;
  uid: string;
}

/**
 * Use case "SubmitStudentName" (RC-003 §6): crea la respuesta del alumno con
 * `occupiedBlocks: []` (se llena en RC-005) y redirige a la grilla —
 * `/sala/:roomId`, placeholder hasta RC-005.
 */
export function useSubmitStudentNameMutation() {
  const navigate = useNavigate();

  return useMutation<void, unknown, SubmitStudentNameInput>({
    mutationFn: ({ roomId, uid, studentName }) =>
      ResponseRepository.submit(roomId, uid, { studentName, occupiedBlocks: [] }),
    onSuccess: (_data, variables) => {
      void navigate(`/sala/${variables.roomId}`);
    },
  });
}
