// Template: q2-example-card
// Renombrar: q2-{feature}-card
// Nivel: q2 — Molecule (combina atoms, sin conexión a stores/queries)

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

export interface PxExampleProps {
  title: string;
  description: string;
  status: 'active' | 'inactive';
  onAction?: () => void;
  actionLabel?: string;
}

export function PxExample({
  title,
  description,
  status,
  onAction,
  actionLabel = 'Ver detalle',
}: PxExampleProps) {
  const footer = onAction ? (
    <Button
      label={actionLabel}
      severity="secondary"
      outlined
      onClick={onAction}
    />
  ) : undefined;

  const header = (
    <div className="flex justify-between items-center p-4 border-b">
      <span className="font-semibold">{title}</span>
      <Tag
        value={status}
        severity={status === 'active' ? 'success' : 'danger'}
      />
    </div>
  );

  return (
    <Card header={header} footer={footer} className="shadow-sm">
      <p className="text-gray-600 text-sm">{description}</p>
    </Card>
  );
}
