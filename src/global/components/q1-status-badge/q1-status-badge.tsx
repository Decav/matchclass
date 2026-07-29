import type { LucideIcon } from 'lucide-react';

export type Q1StatusBadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';

export interface Q1StatusBadgeProps {
  label: string;
  color: Q1StatusBadgeColor;
  icon?: LucideIcon;
}

/**
 * Badge de estado. El ícono es un componente Lucide (no un string `pi-*`):
 * MatchClass no instala `primeicons` — ver 12-design-system.md §9.
 */
export function Q1StatusBadge({ label, color, icon: Icon }: Q1StatusBadgeProps) {
  return (
    <span className={`mc-badge mc-badge-${color}`}>
      {Icon && <Icon size={12} strokeWidth={2} aria-hidden="true" />}
      {label}
    </span>
  );
}
