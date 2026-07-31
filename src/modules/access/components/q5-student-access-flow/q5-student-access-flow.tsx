import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Q4RoomCodeForm } from '../q4-room-code-form/q4-room-code-form';
import { Q4StudentNameForm } from '../q4-student-name-form/q4-student-name-form';
import type { ValidateRoomCodeResult } from '../../core/hooks/use-validate-room-code-mutation';

/**
 * Controla el flujo de dos pasos del tab Alumno: código → nombre. Si el
 * alumno ya tiene una respuesta previa en la sala, salta directo a la grilla
 * sin pedir nombre (HU-01 Escenario 16).
 */
export function Q5StudentAccessFlow() {
  const [validated, setValidated] = useState<ValidateRoomCodeResult | null>(null);
  const navigate = useNavigate();

  function handleValidated(result: ValidateRoomCodeResult) {
    if (result.hasExistingResponse) {
      void navigate(`/sala/${result.room.id}`);
      return;
    }
    setValidated(result);
  }

  if (validated) {
    return (
      <Q4StudentNameForm
        roomId={validated.room.id}
        roomName={validated.room.name}
        uid={validated.uid}
      />
    );
  }

  return <Q4RoomCodeForm onValidated={handleValidated} />;
}
