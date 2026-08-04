export interface Q1SkeletonProps {
  /** CSS width (`'100%'`, `'12rem'`, `240`...). Default `'100%'`. */
  width?: string | number;
  /** CSS height (`'1rem'`, `'3.5rem'`...). Default `'1rem'`. */
  height?: string | number;
  /** Border radius. Default `var(--mc-radius)`. */
  borderRadius?: string | number;
  className?: string;
}

/**
 * Átomo de carga genérico (RC-008 §10): un rectángulo con animación de pulso
 * que usa únicamente los tokens `--mc-*` existentes — no conoce ningún
 * dominio de negocio. Dimensiones configurables por props para aproximar el
 * tamaño del contenido real y evitar layout shift (mismo criterio que el
 * `<Skeleton>` de PrimeReact documentado en 04-patterns.md, pero sin
 * depender de PrimeReact).
 */
export function Q1Skeleton({ width = '100%', height = '1rem', borderRadius, className = '' }: Q1SkeletonProps) {
  return (
    <div
      className={`mc-skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: borderRadius
          ? typeof borderRadius === 'number'
            ? `${borderRadius}px`
            : borderRadius
          : undefined,
      }}
      aria-hidden="true"
    />
  );
}
