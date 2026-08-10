import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Q1Button } from '@global/components/q1-button';
import {
  landingCodeSchema,
  type LandingCodeFormValues,
} from '../../core/schemas/landing-code.schema';
import { useLandingCodeMutation } from '../../core/hooks/use-landing-code-mutation';

const CODE_LENGTH = 6;

/**
 * Mismo texto que `Q4RoomCodeForm` (RC-003) para el mismo caso. Una falla de
 * red muestra este mismo mensaje (RC-015 §4): para el visitante la acción
 * falló igual, y la landing no es lugar para un estado de error dedicado que
 * ningún escenario pide.
 */
const ERROR_MESSAGE = 'Código inválido. Revisa con tu ayudante';

/**
 * Barra de código de la landing (RC-015, HU-13 Escenarios 2-3).
 *
 * No reusa `Q3CodeInput` del módulo `access`: el tab Alumno son seis celdas
 * de un carácter, y el frame de la landing dibuja un input de texto normal
 * con el botón adosado. Son dos componentes distintos por diseño.
 */
export function Q4LandingCodeForm() {
  const mutation = useLandingCodeMutation();

  const { control, handleSubmit } = useForm<LandingCodeFormValues>({
    resolver: zodResolver(landingCodeSchema),
    defaultValues: { code: '' },
  });

  const code = useWatch({ control, name: 'code' });
  const isComplete = code.length === CODE_LENGTH;

  function onSubmit(values: LandingCodeFormValues) {
    mutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mc-landing-code">
      <div
        className={`mc-landing-code__bar${mutation.isError ? ' mc-landing-code__bar--error' : ''}`}
      >
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <input
              ref={field.ref}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              // Se normaliza a mayúsculas al tipear, igual que hace `/acceso`
              // con el `?codigo=` de un enlace compartido: el código que ve
              // el visitante coincide con el que termina en la URL.
              onChange={(event) => field.onChange(event.target.value.toUpperCase())}
              type="text"
              inputMode="text"
              autoComplete="off"
              maxLength={CODE_LENGTH}
              placeholder="Ingresa el código de tu sala"
              aria-label="Código de sala"
              aria-invalid={mutation.isError}
              disabled={mutation.isPending}
              className="mc-landing-code__input"
            />
          )}
        />

        <Q1Button
          type="submit"
          label="Entrar"
          className="mc-landing-code__btn"
          loading={mutation.isPending}
          disabled={!isComplete || mutation.isPending}
        />
      </div>

      {mutation.isError && (
        <p className="mc-landing-code__error" role="alert">
          {ERROR_MESSAGE}
        </p>
      )}
    </form>
  );
}
