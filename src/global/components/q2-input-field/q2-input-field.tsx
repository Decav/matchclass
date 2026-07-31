import { forwardRef, type ReactNode } from 'react';
import { InputText, type InputTextProps } from 'primereact/inputtext';
import { AlertCircle } from 'lucide-react';

export interface Q2InputFieldProps extends InputTextProps {
  label: string;
  // `| undefined` explícito: con `exactOptionalPropertyTypes` un consumidor
  // que pasa `error={fieldState.error?.message}` (RHF) envía `undefined` de
  // forma explícita, no solo omite la prop.
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
  /** Slot al final del input (p. ej. el toggle de visibilidad de password). */
  endAdornment?: ReactNode;
}

/**
 * Input de texto con label, estado de error (`p-invalid` + `role="alert"`) y
 * estado con hint. Envuelve `InputText` de PrimeReact — el color de error
 * viene de `--mc-danger*`, nunca de un hex inline.
 */
export const Q2InputField = forwardRef<HTMLInputElement, Q2InputFieldProps>(
  ({ label, error, hint, required, endAdornment, id, className = '', ...props }, ref) => {
    return (
      <div className="mc-form-group">
        <label htmlFor={id} className="mc-form-label">
          {label}
          {required && (
            <span style={{ color: 'var(--mc-danger)' }} className="ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative flex items-center">
          <InputText
            ref={ref}
            id={id}
            className={`mc-form-input ${endAdornment ? 'pr-10' : ''} ${error ? 'p-invalid' : ''} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-3 flex items-center justify-center">{endAdornment}</div>
          )}
        </div>
        {error && (
          <span id={`${id}-error`} className="mc-form-error" role="alert">
            <AlertCircle size={12} strokeWidth={2} aria-hidden="true" />
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${id}-hint`} className="mc-form-hint">
            {hint}
          </span>
        )}
      </div>
    );
  },
);

Q2InputField.displayName = 'Q2InputField';
