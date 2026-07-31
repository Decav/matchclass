import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck } from 'lucide-react';
import { Q1Button } from '@global/components/q1-button';
import { Q2InputField } from '@global/components/q2-input-field';
import { Q2Alert } from '@global/components/q2-alert';
import { useFirebaseError } from '@global/hooks/use-firebase-error';
import { studentNameSchema, type StudentNameFormValues } from '../../core/schemas/student-name.schema';
import { useSubmitStudentNameMutation } from '../../core/hooks/use-submit-student-name-mutation';

export interface Q4StudentNameFormProps {
  roomId: string;
  roomName: string;
  uid: string;
}

/**
 * Formulario del tab Alumno — paso nombre (HU-01 Escenarios 14-15).
 */
export function Q4StudentNameForm({ roomId, roomName, uid }: Q4StudentNameFormProps) {
  const mutation = useSubmitStudentNameMutation();
  const { message } = useFirebaseError(mutation.error);

  const { control, handleSubmit } = useForm<StudentNameFormValues>({
    resolver: zodResolver(studentNameSchema),
    defaultValues: { studentName: '' },
  });

  function onSubmit(values: StudentNameFormValues) {
    mutation.mutate({ ...values, roomId, uid });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="mc-room-badge" role="status">
        <CircleCheck size={20} strokeWidth={2} style={{ color: 'var(--mc-success)' }} aria-hidden="true" />
        <span>{roomName}</span>
      </div>

      <Controller
        name="studentName"
        control={control}
        render={({ field, fieldState }) => (
          <Q2InputField
            {...field}
            id="access-student-name"
            label="Tu nombre"
            placeholder="Ej: Juan Pérez"
            error={fieldState.error?.message}
            disabled={mutation.isPending}
          />
        )}
      />

      <Q1Button type="submit" label="Entrar a la grilla" className="w-full" loading={mutation.isPending} />

      {message && <Q2Alert message={message} />}

      <p className="text-center text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
        Tu nombre solo lo verá el ayudante
      </p>
    </form>
  );
}
