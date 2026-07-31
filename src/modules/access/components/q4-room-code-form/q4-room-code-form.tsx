import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Q1Button } from '@global/components/q1-button';
import { Q2Alert } from '@global/components/q2-alert';
import { useFirebaseError } from '@global/hooks/use-firebase-error';
import { RoomNotFoundError } from '@resources/errors/room-not-found.error';
import { RoomClosedError } from '@resources/errors/room-closed.error';
import { Q3CodeInput } from '../q3-code-input/q3-code-input';
import { roomCodeSchema, type RoomCodeFormValues } from '../../core/schemas/room-code.schema';
import {
  useValidateRoomCodeMutation,
  type ValidateRoomCodeResult,
} from '../../core/hooks/use-validate-room-code-mutation';

export interface Q4RoomCodeFormProps {
  onValidated: (result: ValidateRoomCodeResult) => void;
}

const CODE_LENGTH = 6;

/**
 * Formulario del tab Alumno — paso código (HU-01 Escenarios 9-13).
 */
export function Q4RoomCodeForm({ onValidated }: Q4RoomCodeFormProps) {
  const mutation = useValidateRoomCodeMutation();
  const { message: networkMessage } = useFirebaseError(mutation.error);

  const { control, handleSubmit } = useForm<RoomCodeFormValues>({
    resolver: zodResolver(roomCodeSchema),
    defaultValues: { code: '' },
  });

  const code = useWatch({ control, name: 'code' });
  const isComplete = code.length === CODE_LENGTH;

  const isRoomNotFound = mutation.error instanceof RoomNotFoundError;
  const isRoomClosed = mutation.error instanceof RoomClosedError;
  const errorMessage = isRoomNotFound
    ? 'Código inválido. Revisa con tu ayudante'
    : isRoomClosed
      ? 'Esta sala ya no acepta respuestas'
      : networkMessage;

  function onSubmit(values: RoomCodeFormValues) {
    mutation.mutate(values, { onSuccess: onValidated });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-lg font-bold" style={{ color: 'var(--mc-text-primary)' }}>
          Ingresa tu código
        </h2>
        <p className="text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
          Ingresa el código que te dio tu ayudante
        </p>
      </div>

      <Controller
        name="code"
        control={control}
        render={({ field }) => (
          <Q3CodeInput
            value={field.value}
            onChange={field.onChange}
            length={CODE_LENGTH}
            hasError={Boolean(isRoomNotFound)}
            disabled={mutation.isPending}
          />
        )}
      />

      <Q1Button
        type="submit"
        label="Ingresar"
        className="w-full"
        loading={mutation.isPending}
        disabled={!isComplete || mutation.isPending}
      />

      {errorMessage && <Q2Alert message={errorMessage} />}

      <p className="text-center text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
        Tu código es único y temporal. No compartas tu información personal.
      </p>
    </form>
  );
}
