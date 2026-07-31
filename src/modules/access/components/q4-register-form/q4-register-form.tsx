import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Q1Button } from '@global/components/q1-button';
import { Q2InputField } from '@global/components/q2-input-field';
import { Q2Alert } from '@global/components/q2-alert';
import { useFirebaseError } from '@global/hooks/use-firebase-error';
import { registerSchema, type RegisterFormValues } from '../../core/schemas/register.schema';
import { useRegisterMutation } from '../../core/hooks/use-register-mutation';

/**
 * Formulario de `/registro` (RC-004). Mismo patrón que `Q4LoginForm`
 * (RC-003): RHF + Zod, botón deshabilitado hasta completar los campos
 * obligatorios, toggle de visibilidad independiente para cada campo de
 * contraseña.
 */
export function Q4RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const mutation = useRegisterMutation();
  const { message } = useFirebaseError(mutation.error);

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const [displayName, email, password, confirmPassword] = useWatch({
    control,
    name: ['displayName', 'email', 'password', 'confirmPassword'],
  });
  const isSubmitDisabled =
    !displayName || !email || !password || !confirmPassword || mutation.isPending;

  function onSubmit(values: RegisterFormValues) {
    mutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {message && <Q2Alert message={message} />}

      <Controller
        name="displayName"
        control={control}
        render={({ field, fieldState }) => (
          <Q2InputField
            {...field}
            id="register-display-name"
            label="Nombre completo"
            placeholder="Ej: María González"
            autoComplete="name"
            error={fieldState.error?.message}
            disabled={mutation.isPending}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Q2InputField
            {...field}
            id="register-email"
            label="Email"
            placeholder="tu@email.com"
            autoComplete="email"
            error={fieldState.error?.message}
            disabled={mutation.isPending}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Q2InputField
            {...field}
            id="register-password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={fieldState.error?.message}
            disabled={mutation.isPending}
            endAdornment={
              <button
                type="button"
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{ color: 'var(--mc-text-tertiary)' }}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Eye size={18} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
            }
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field, fieldState }) => (
          <Q2InputField
            {...field}
            id="register-confirm-password"
            label="Confirmar contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={fieldState.error?.message}
            disabled={mutation.isPending}
            endAdornment={
              <button
                type="button"
                onClick={() => {
                  setShowConfirmPassword((prev) => !prev);
                }}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{ color: 'var(--mc-text-tertiary)' }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Eye size={18} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
            }
          />
        )}
      />

      <Q1Button
        type="submit"
        label="Crear cuenta"
        className="w-full"
        loading={mutation.isPending}
        disabled={isSubmitDisabled}
      />

      <div className="flex items-center gap-3">
        <span className="flex-1" style={{ height: 1, background: 'var(--mc-border)' }} />
        <span className="text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
          o
        </span>
        <span className="flex-1" style={{ height: 1, background: 'var(--mc-border)' }} />
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/acceso" className="font-semibold" style={{ color: 'var(--mc-brand-primary)' }}>
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
