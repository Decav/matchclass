import { forwardRef } from 'react';
import { InputText, type InputTextProps } from 'primereact/inputtext';
import { AlertCircle } from 'lucide-react';

export interface Q2InputFieldProps extends InputTextProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

/**
 * Input de texto con label, estado de error (`p-invalid` + `role="alert"`) y
 * estado con hint. Envuelve `InputText` de PrimeReact — el color de error
 * viene de `--mc-danger*`, nunca de un hex inline.
 */
export const Q2InputField = forwardRef<HTMLInputElement, Q2InputFieldProps>(
  ({ label, error, hint, required, id, className = '', ...props }, ref) => {
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
        <InputText
          ref={ref}
          id={id}
          className={`w-full ${error ? 'p-invalid' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
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
