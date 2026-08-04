import type { LucideIcon } from 'lucide-react';

export interface Q2KpiCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

/**
 * Card de KPI del dashboard (RC-008 §7 / frame "Dashboard Ayudante" ·
 * "Stat Card"). Valor en JetBrains Mono (dato numérico comparable), label en
 * Inter — regla de tipografía de 12-design-system.md §2.10.
 */
export function Q2KpiCard({ icon: Icon, value, label }: Q2KpiCardProps) {
  return (
    <div className="mc-kpi-card">
      <div className="mc-icon-circle mc-icon-circle--brand w-10 h-10">
        <Icon size={20} strokeWidth={2} style={{ color: 'var(--mc-brand-primary)' }} aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="mc-kpi-card__value">{value}</span>
        <span className="mc-kpi-card__label">{label}</span>
      </div>
    </div>
  );
}
