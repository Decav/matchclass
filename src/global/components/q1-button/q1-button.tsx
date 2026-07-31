import { type ComponentPropsWithoutRef } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

export type Q1ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface Q1ButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  label: string;
  variant?: Q1ButtonVariant;
  loading?: boolean;
  icon?: LucideIcon;
}

/**
 * Botón nativo con las clases `.mc-btn`/`.mc-btn-{variant}` de theme.css.
 * No envuelve el `Button` de PrimeReact: en esta versión de PrimeReact 10
 * (`api.d.ts` expone `unstyled`/`changeTheme`, no `theme.preset`), sin un
 * theme clásico importado los componentes de PrimeReact no reciben NINGÚN
 * CSS — `.p-button` queda sin estilo. Las clases `.mc-btn` ya cubren color,
 * padding, radios y estado disabled sin depender de esa pieza rota.
 */
export function Q1Button({
  label,
  variant = 'primary',
  loading = false,
  icon: Icon,
  disabled,
  className = '',
  type = 'button',
  ...props
}: Q1ButtonProps) {
  return (
    <button
      type={type}
      className={`mc-btn mc-btn-${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} strokeWidth={2} className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={18} strokeWidth={2} aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
