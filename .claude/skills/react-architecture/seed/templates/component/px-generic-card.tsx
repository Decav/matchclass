// Template: componente genérico q2 con PrimeReact
// Nivel: q2 — Molecule
// Copia este archivo, renombra el componente y adapta las props.
//
// Convención de naming: q{nivel}-{nombre-en-kebab-case}
// Ejemplo: q2-product-card.tsx, q2-user-summary.tsx

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import type { TagProps } from 'primereact/tag';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface PxGenericCardProps {
  /** Título principal de la tarjeta */
  title: string;

  /** Subtítulo o descripción corta */
  subtitle?: string;

  /** Contenido principal */
  body: string;

  /** Estado visual de la entidad */
  status?: 'success' | 'warning' | 'danger' | 'info';

  /** Etiqueta del estado */
  statusLabel?: string;

  /** Callback al hacer click en la acción primaria */
  onPrimaryAction?: () => void;

  /** Label del botón primario */
  primaryActionLabel?: string;

  /** Callback al hacer click en la acción secundaria */
  onSecondaryAction?: () => void;

  /** Label del botón secundario */
  secondaryActionLabel?: string;

  /** CSS class adicional */
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PxGenericCard({
  title,
  subtitle,
  body,
  status,
  statusLabel,
  onPrimaryAction,
  primaryActionLabel = 'Ver',
  onSecondaryAction,
  secondaryActionLabel = 'Editar',
  className,
}: PxGenericCardProps) {
  const header = (
    <div className="flex items-start justify-between p-4 pb-0">
      <div>
        <h3 className="text-base font-semibold text-gray-900 m-0">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {status && statusLabel && (
        <Tag
          value={statusLabel}
          severity={status as TagProps['severity']}
          className="ml-2 flex-shrink-0"
        />
      )}
    </div>
  );

  const footer =
    onPrimaryAction || onSecondaryAction ? (
      <div className="flex gap-2">
        {onPrimaryAction && (
          <Button
            label={primaryActionLabel}
            size="small"
            onClick={onPrimaryAction}
          />
        )}
        {onSecondaryAction && (
          <Button
            label={secondaryActionLabel}
            size="small"
            severity="secondary"
            outlined
            onClick={onSecondaryAction}
          />
        )}
      </div>
    ) : undefined;

  return (
    <Card header={header} footer={footer} className={className}>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
    </Card>
  );
}
