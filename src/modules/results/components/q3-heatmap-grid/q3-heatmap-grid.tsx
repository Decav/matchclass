import { USM_SCHEDULE_BLOCKS, USM_SCHEDULE_DAYS } from '@resources/constants/usm-schedule';
import { HeatmapStatus } from '@resources/enums/heatmap-status.enum';
import type { HeatmapEntry } from '@resources/types/heatmap-entry.type';

export interface Q3HeatmapGridProps {
  /** Las 50 celdas en orden ascendente, tal como las devuelve `buildRoomResult`. */
  heatmap: HeatmapEntry[];
}

const LEGEND: { status: HeatmapStatus; label: string }[] = [
  { status: HeatmapStatus.High, label: '≥70% disponible' },
  { status: HeatmapStatus.Medium, label: '40-69%' },
  { status: HeatmapStatus.Low, label: '10-39%' },
  { status: HeatmapStatus.Conflict, label: '<10% conflicto' },
  { status: HeatmapStatus.Blocked, label: 'Bloqueado' },
];

const BLOCKED_TEXT = '—';

/**
 * Mapa de disponibilidad de 50 celdas (RC-014 §5, frame `Resultados Sala` ·
 * "HM Grid"). No reusa `Q3ScheduleGrid`: aquella son botones de dos estados
 * con `aria-pressed`/`onToggle`, y estas son celdas de solo lectura con
 * cinco estados, un número adentro y otras medidas (40px vs 52px, gap 6 vs
 * 10, radio 6 vs 10) — RC-014 §10.
 *
 * Cada celda muestra su porcentaje como texto y las bloqueadas un guion: el
 * color nunca es el único canal (design system §7). El `aria-label` completa
 * el contexto que el número solo no da.
 */
export function Q3HeatmapGrid({ heatmap }: Q3HeatmapGridProps) {
  return (
    <div className="mc-heatmap">
      {/* Contenedor de scroll horizontal (RC-020 §6). La leyenda queda fuera:
          reflowea con `flex-wrap` y no tiene por qué desplazarse con la
          retícula. */}
      <div className="mc-heatmap__scroll">
        <div className="mc-heatmap__row">
          <div className="mc-heatmap__time-header" aria-hidden="true" />
          {USM_SCHEDULE_DAYS.map((day) => (
            <div key={day} className="mc-heatmap__day-header">
              {day}
            </div>
          ))}
        </div>

        {USM_SCHEDULE_BLOCKS.map((block, rowIndex) => (
          <div key={block.blockNumber} className="mc-heatmap__row">
            <div className="mc-heatmap__time-col">
              {block.isVespertine ? (
                <span>Vespertino</span>
              ) : (
                <>
                  <span>{block.startTime}</span>
                  <span>{block.endTime}</span>
                </>
              )}
            </div>

            {USM_SCHEDULE_DAYS.map((day, columnIndex) => {
              const cell = rowIndex * USM_SCHEDULE_DAYS.length + columnIndex + 1;
              const entry = heatmap.find((item) => item.block === cell);
              if (!entry) return <div key={cell} className="mc-heatmap__cell" />;

              const isBlocked = entry.status === HeatmapStatus.Blocked;
              const percentage = Math.round(entry.percentage);

              return (
                <div
                  key={cell}
                  className={`mc-heatmap__cell mc-heatmap__cell--${entry.status}`}
                  aria-label={
                    isBlocked
                      ? `${day}, ${entry.timeRange}: bloqueado`
                      : `${day}, ${entry.timeRange}: ${percentage}% disponible, ${entry.available} de ${entry.total} alumnos`
                  }
                >
                  {isBlocked ? BLOCKED_TEXT : `${percentage}%`}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mc-heatmap__legend">
        {LEGEND.map(({ status, label }) => (
          <div key={status} className="mc-heatmap__legend-item">
            <span className={`mc-heatmap__legend-dot mc-heatmap__legend-dot--${status}`} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
