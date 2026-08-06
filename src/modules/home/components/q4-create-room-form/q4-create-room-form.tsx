import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Q1Button } from '@global/components/q1-button';
import { Q2InputField } from '@global/components/q2-input-field';
import { Q2Alert } from '@global/components/q2-alert';
import { useFirebaseError } from '@global/hooks/use-firebase-error';
import { RoomCodeGenerationError } from '@resources/errors/room-code-generation.error';
import { createRoomSchema, type CreateRoomFormValues } from '../../core/schemas/create-room.schema';
import { useCreateRoomMutation } from '../../core/hooks/use-create-room-mutation';

export interface Q4CreateRoomFormSuccess {
  id: string;
  name: string;
  code: string;
}

export interface Q4CreateRoomFormProps {
  onSuccess: (data: Q4CreateRoomFormSuccess) => void;
}

const NETWORK_ERROR_MESSAGE = 'Error de conexión. Intenta de nuevo';

/**
 * Formulario del paso 1 de `/salas/nueva` (RC-009, HU-07). Mismo patrón que
 * `Q4LoginForm`/`Q4RecoverEmailForm`: RHF + Zod, botón deshabilitado hasta
 * completar los tres campos.
 *
 * `RoomCodeGenerationError` recibe el mismo tratamiento visual que un error
 * de red (RC-009 §4): desde la perspectiva del ayudante no hay una acción
 * distinta que tomar en ninguno de los dos casos.
 */
export function Q4CreateRoomForm({ onSuccess }: Q4CreateRoomFormProps) {
  const navigate = useNavigate();
  const mutation = useCreateRoomMutation();
  const { message: networkMessage } = useFirebaseError(mutation.error);
  const isCodeGenerationError = mutation.error instanceof RoomCodeGenerationError;
  const errorMessage = isCodeGenerationError ? NETWORK_ERROR_MESSAGE : networkMessage;

  const { control, handleSubmit } = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: { name: '', subject: '', section: '' },
  });

  const [name, subject, section] = useWatch({ control, name: ['name', 'subject', 'section'] });
  const isSubmitDisabled = !name || !subject || !section || mutation.isPending;

  function onSubmit(values: CreateRoomFormValues) {
    mutation.mutate(values, {
      onSuccess: (result) => {
        onSuccess({ id: result.id, name: values.name, code: result.code });
      },
    });
  }

  return (
    <div className="mc-create-room-card gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--mc-text-primary)' }}>
          Crear nueva sala
        </h1>
        <p className="text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
          Configura los datos de tu sala de coordinación
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {errorMessage && <Q2Alert message={errorMessage} />}

        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Q2InputField
              {...field}
              id="create-room-name"
              label="Nombre de la sala"
              placeholder="Ej: Estructuras de Datos - Secc 1"
              error={fieldState.error?.message}
              disabled={mutation.isPending}
            />
          )}
        />

        <Controller
          name="subject"
          control={control}
          render={({ field, fieldState }) => (
            <Q2InputField
              {...field}
              id="create-room-subject"
              label="Asignatura"
              placeholder="Ej: Estructuras de Datos"
              error={fieldState.error?.message}
              disabled={mutation.isPending}
            />
          )}
        />

        <Controller
          name="section"
          control={control}
          render={({ field, fieldState }) => (
            <Q2InputField
              {...field}
              id="create-room-section"
              label="Sección"
              placeholder="Ej: 1"
              error={fieldState.error?.message}
              disabled={mutation.isPending}
            />
          )}
        />

        <div className="flex items-center justify-end gap-3">
          <Q1Button
            type="button"
            label="Cancelar"
            variant="ghost"
            className="mc-create-room-cancel-btn"
            disabled={mutation.isPending}
            onClick={() => {
              void navigate('/dashboard');
            }}
          />
          <Q1Button
            type="submit"
            label="Crear sala"
            className="w-40 mc-create-room-primary-btn"
            loading={mutation.isPending}
            disabled={isSubmitDisabled}
          />
        </div>
      </form>
    </div>
  );
}
