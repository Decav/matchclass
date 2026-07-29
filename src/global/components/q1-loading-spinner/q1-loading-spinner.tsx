import { Loader2 } from 'lucide-react';

export type Q1LoadingSpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<Q1LoadingSpinnerSize, number> = { sm: 16, md: 24, lg: 32 };

export interface Q1LoadingSpinnerProps {
  size?: Q1LoadingSpinnerSize;
  label?: string;
}

/**
 * Indicador de carga estándar de MatchClass. Reservado para estados que no
 * consumen una query de React Query (para esos casos usar `<Skeleton>` de
 * PrimeReact — ver 11-http-error-handling.md).
 */
export function Q1LoadingSpinner({ size = 'md', label }: Q1LoadingSpinnerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2"
      role="status"
      aria-live="polite"
    >
      <Loader2
        size={SIZE_MAP[size]}
        strokeWidth={2}
        className="animate-spin"
        style={{ color: 'var(--mc-brand-secondary)' }}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
