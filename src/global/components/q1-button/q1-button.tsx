import { Button, type ButtonProps } from 'primereact/button';

export type Q1ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface Q1ButtonProps extends Omit<ButtonProps, 'severity'> {
  variant?: Q1ButtonVariant;
}

const VARIANT_PROPS: Record<Q1ButtonVariant, Partial<ButtonProps>> = {
  primary: {},
  secondary: { severity: 'secondary', outlined: true },
  ghost: { severity: 'secondary', text: true },
  danger: { severity: 'danger' },
};

/**
 * Wrapper del `Button` de PrimeReact con las variantes MatchClass. El color
 * primario viene de los overrides `--p-primary-*` definidos en theme.css, no
 * de un hex inline.
 */
export function Q1Button({ variant = 'primary', className = '', ...props }: Q1ButtonProps) {
  return <Button {...VARIANT_PROPS[variant]} {...props} className={className} />;
}
