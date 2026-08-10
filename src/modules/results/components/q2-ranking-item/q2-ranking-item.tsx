import type { HeatmapEntry } from '@resources/types/heatmap-entry.type';

export interface Q2RankingItemProps {
  entry: HeatmapEntry;
  /** 1-based: se muestra como "#1", "#2", "#3". */
  position: number;
}

/**
 * Una fila del top 3 (RC-014 §5, frame `Resultados Sala` · "Top3 Item").
 *
 * El badge de posición y el de porcentaje toman el color del `status` del
 * slot, no un dorado/plata/bronce por puesto (RC-014 D4): así el ranking usa
 * el mismo código de color que el mapa. El frame dibuja el #3 al 80% en
 * ámbar, pero 80 ≥ 70 es `high` — manda la regla de umbrales, no el mock.
 */
export function Q2RankingItem({ entry, position }: Q2RankingItemProps) {
  const percentage = Math.round(entry.percentage);

  return (
    <div className="mc-ranking-item">
      <span className={`mc-ranking-item__rank mc-ranking-item__rank--${entry.status}`}>#{position}</span>

      <div className="mc-ranking-item__info">
        <span className="mc-ranking-item__title">
          {entry.day} {entry.blockLabel}
        </span>
        <span className="mc-ranking-item__meta">
          {entry.timeRange} · {entry.available}/{entry.total} alumnos
        </span>
      </div>

      <span className={`mc-ranking-item__pct mc-ranking-item__pct--${entry.status}`}>{percentage}%</span>
    </div>
  );
}
