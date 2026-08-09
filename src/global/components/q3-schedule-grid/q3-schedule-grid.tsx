import { X } from 'lucide-react';

export interface Q3ScheduleGridRow {
  /** Hora de inicio del bloque (`"08:15"`), o `"Vespertino"` sin `sublabel`. */
  label: string;
  /** Hora de término (`"09:25"`). Omitido en las filas vespertinas. */
  sublabel?: string;
}

export interface Q3ScheduleGridProps {
  /** Filas de la grilla (bloques horarios), de arriba hacia abajo. */
  rows: Q3ScheduleGridRow[];
  /** Columnas de la grilla (días), de izquierda a derecha. */
  columns: string[];
  /**
   * Celdas marcadas, en numeración final 1-based `celda = fila×columnas.length + columna + 1`.
   * `Q3ScheduleGrid` no sabe qué significa una celda marcada (ocupado, disponible, etc.)
   * — ese significado lo aporta quien la usa.
   */
  selected: ReadonlySet<number>;
  /** Se invoca con el número de celda (1-based) al hacer clic en ella. */
  onToggle: (cell: number) => void;
  /** Desactiva el toggle de todas las celdas (ej. mientras se guarda). */
  disabled?: boolean;
}

/**
 * Grilla de toggle genérica, sin conocer dominios (RC-010 §5). Reusable a
 * propósito: el ayudante la usa para `helperBlockedSlots` (este RC) y el
 * alumno la va a necesitar para `occupiedBlocks` (RC de `scheduling`,
 * todavía sin implementar) con otra semántica de color.
 *
 * El índice de celda 1-based (`fila × columnas.length + columna + 1`) se
 * calcula acá adentro al renderizar, pero la API pública (`selected`/
 * `onToggle`) ya habla en esos términos — el caller nunca maneja fila/columna
 * por separado.
 */
export function Q3ScheduleGrid({ rows, columns, selected, onToggle, disabled = false }: Q3ScheduleGridProps) {
  return (
    <div className="mc-schedule-grid">
      <div className="mc-schedule-grid__row">
        <div className="mc-schedule-header-cell" aria-hidden="true">
          Horario
        </div>
        {columns.map((day) => (
          <div key={day} className="mc-schedule-day-header">
            {day}
          </div>
        ))}
      </div>

      {rows.map((row, rowIndex) => (
        <div key={`${row.label}-${rowIndex}`} className="mc-schedule-grid__row">
          <div className="mc-schedule-time-col">
            {row.sublabel ? (
              <span>
                {row.label}
                <span aria-hidden="true"> – </span>
                {row.sublabel}
              </span>
            ) : (
              <span>{row.label}</span>
            )}
          </div>

          {columns.map((day, colIndex) => {
            const cell = rowIndex * columns.length + colIndex + 1;
            const isOccupied = selected.has(cell);
            const timeRange = row.sublabel ? `${row.label} – ${row.sublabel}` : row.label;

            return (
              <button
                key={cell}
                type="button"
                className={`mc-schedule-cell${isOccupied ? ' mc-schedule-cell--occupied' : ''}`}
                aria-pressed={isOccupied}
                aria-label={`${day}, ${timeRange}`}
                disabled={disabled}
                onClick={() => onToggle(cell)}
              >
                {isOccupied && <X size={18} strokeWidth={2} className="mc-schedule-cell__icon" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
