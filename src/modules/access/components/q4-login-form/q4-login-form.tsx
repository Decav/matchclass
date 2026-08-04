import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Q1Button } from '@global/components/q1-button';
import { Q2InputField } from '@global/components/q2-input-field';
import { Q2Alert } from '@global/components/q2-alert';
import { useFirebaseError } from '@global/hooks/use-firebase-error';
import { loginSchema, type LoginFormValues } from '../../core/schemas/login.schema';
import { useLoginMutation } from '../../core/hooks/use-login-mutation';

/**
 * Formulario del tab Ayudante. Se mantiene montado (oculto vía CSS) cuando el
 * tab Alumno está activo — así conserva `email`/`password` al volver
 * (HU-01 Escenario 8), sin necesidad de levantar el estado fuera de RHF.
 */
export function Q4LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useLoginMutation();
  const { message } = useFirebaseError(mutation.error);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const [email, password] = useWatch({ control, name: ['email', 'password'] });
  const isSubmitDisabled = !email || !password || mutation.isPending;

  function onSubmit(values: LoginFormValues) {
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
            id="access-email"
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
            id="access-password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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

      <Q1Button
        type="submit"
        label="Iniciar sesión"
        className="w-full"
        loading={mutation.isPending}
        disabled={isSubmitDisabled}
      />

      <p className="text-center text-sm">
        <Link to="/recuperar" style={{ color: 'var(--mc-brand-secondary)' }}>
          ¿Olvidaste tu contraseña?
        </Link>
      </p>

      <div className="flex items-center gap-3">
        <span className="flex-1" style={{ height: 1, background: 'var(--mc-border)' }} />
        <span className="text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
          o
        </span>
        <span className="flex-1" style={{ height: 1, background: 'var(--mc-border)' }} />
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold" style={{ color: 'var(--mc-brand-primary)' }}>
          Registrarse
        </Link>
      </p>
    </form>
  );
}
