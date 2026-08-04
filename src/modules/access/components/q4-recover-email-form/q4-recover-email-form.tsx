import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Q1Button } from '@global/components/q1-button';
import { Q2InputField } from '@global/components/q2-input-field';
import { Q2Alert } from '@global/components/q2-alert';
import { useFirebaseError } from '@global/hooks/use-firebase-error';
import { recoverSchema, type RecoverFormValues } from '../../core/schemas/recover.schema';
import { useRecoverPasswordMutation } from '../../core/hooks/use-recover-password-mutation';

export interface Q4RecoverEmailFormProps {
  /** Llamado en éxito (incluido el caso "email no registrado", ver hook). */
  onSuccess: () => void;
}

/**
 * Formulario del estado 1 de `/recuperar` (RC-007, HU-05). Mismo patrón que
 * `Q4LoginForm`/`Q4RegisterForm`: RHF + Zod, botón deshabilitado hasta
 * completar el email, error de Firebase mapeado por `useFirebaseError`.
 *
 * `PaRecoverPassword` decide el título/subtítulo del estado — este
 * componente solo contiene el campo, el botón y el link de vuelta.
 */
export function Q4RecoverEmailForm({ onSuccess }: Q4RecoverEmailFormProps) {
  const mutation = useRecoverPasswordMutation({ onSuccess });
  const { message } = useFirebaseError(mutation.error);

  const { control, handleSubmit } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: '' },
  });

  const email = useWatch({ control, name: 'email' });
  const isSubmitDisabled = !email || mutation.isPending;

  function onSubmit(values: RecoverFormValues) {
    mutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {message && <Q2Alert message={message} />}

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Q2InputField
            {...field}
            id="recover-email"
            label="Email"
            placeholder="tu@email.com"
            autoComplete="email"
            error={fieldState.error?.message}
            disabled={mutation.isPending}
          />
        )}
      />

      <Q1Button
        type="submit"
        label="Enviar link"
        className="w-full"
        loading={mutation.isPending}
        disabled={isSubmitDisabled}
      />

      <p className="text-center text-sm">
        <Link to="/acceso" className="font-semibold" style={{ color: 'var(--mc-brand-primary)' }}>
          Volver a inicio de sesión
        </Link>
      </p>
    </form>
  );
}
