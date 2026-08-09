import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Q1Button } from '@global/components/q1-button';
import { Q1Toast } from '@global/components/q1-toast';
import { Q2Alert } from '@global/components/q2-alert';
import { Q2SaveStatus } from '@global/components/q2-save-status';
import { Q3ScheduleGrid, type Q3ScheduleGridRow } from '@global/components/q3-schedule-grid';
import { USM_SCHEDULE_BLOCKS, USM_SCHEDULE_DAYS } from '@resources/constants/usm-schedule';
import { useStudentResponseQuery } from '../../core/hooks/use-student-response-query';
import { useSubmitStudentBlocksMutation } from '../../core/hooks/use-submit-student-blocks-mutation';

export interface Q4StudentGridProps {
  roomId: string;
  /** uid anónimo ya resuelto por `PaStudentGrid` — acá nunca es `null`. */
  uid: string;
}

const SAVE_ERROR_MESSAGE = 'Error al guardar. Intenta de nuevo';
const SAVE_SUCCESS_MESSAGE = 'Respuesta enviada';

// Mismas filas que la grilla del ayudante (RC-010): label = hora de inicio
// (o "Vespertino" sin horario), sublabel = hora de término. Constante de
// módulo — no se recalcula en cada render.
const GRID_ROWS: Q3ScheduleGridRow[] = USM_SCHEDULE_BLOCKS.map((block) =>
  block.isVespertine ? { label: 'Vespertino' } : { label: block.startTime ?? '', sublabel: block.endTime ?? '' },
);

function toSortedArray(set: ReadonlySet<number>): number[] {
  return Array.from(set).sort((a, b) => a - b);
}

function areSetsEqual(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

/**
 * Grilla de respuesta del alumno (RC-013 §6, HU-11). Implementa
 * "LoadStudentGrid" y "SubmitStudentBlocks":
 * - Precarga `occupiedBlocks` con `useStudentResponseQuery`; sin respuesta
 *   previa (o si la lectura falla) arranca vacía (Escenarios 1 y 3).
 * - El toggle de celda marca "Cambios sin guardar" y habilita el botón; sin
 *   diferencias respecto de lo guardado, el botón queda deshabilitado
 *   (Escenarios 1 y 4).
 * - Al enviar con éxito, el indicador pasa a "Respuesta guardada" y aparece
 *   un toast. **No navega a ninguna parte**: el alumno no tiene dashboard
 *   adonde volver, a diferencia de `Q4RoomBlocksGrid` (RC-010).
 * - Al fallar, alerta inline sin perder la selección local (Escenario 5).
 *
 * El ícono de celda ocupada es `BookOpen` — así lo pide el frame `Grilla
 * Alumno`, frente a la `X` de la grilla del ayudante (RC-013 §5).
 */
export function Q4StudentGrid({ roomId, uid }: Q4StudentGridProps) {
  const { data: response, isLoading } = useStudentResponseQuery(roomId, uid);
  const submitMutation = useSubmitStudentBlocksMutation(roomId, uid);

  const preloaded = useMemo(() => new Set(response?.occupiedBlocks ?? []), [response]);

  // "Adjusting state when a prop changes" (react.dev): se resincroniza
  // durante el render y no en un `useEffect`, igual que `Q4RoomBlocksGrid`
  // — evita el render extra y se dispara cada vez que `preloaded` cambia de
  // identidad (llegada de datos o refetch tras guardar).
  const [priorPreloaded, setPriorPreloaded] = useState(preloaded);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(preloaded));
  if (preloaded !== priorPreloaded) {
    setPriorPreloaded(preloaded);
    setSelected(new Set(preloaded));
  }

  const [showToast, setShowToast] = useState(false);

  const isDirty = !areSetsEqual(selected, preloaded);
  const isBusy = isLoading || submitMutation.isPending;

  function handleToggle(cell: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cell)) next.delete(cell);
      else next.add(cell);
      return next;
    });
  }

  function handleSubmit() {
    submitMutation.mutate(toSortedArray(selected), { onSuccess: () => setShowToast(true) });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mc-student-grid__card">
        <Q3ScheduleGrid
          rows={GRID_ROWS}
          columns={USM_SCHEDULE_DAYS}
          selected={selected}
          onToggle={handleToggle}
          disabled={isBusy}
          occupiedIcon={BookOpen}
        />

        <div className="mc-student-grid__legend">
          <div className="flex items-center gap-2">
            <span className="mc-schedule-legend-swatch" aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--mc-text-secondary)' }}>
              Libre / disponible
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="mc-schedule-legend-swatch mc-schedule-legend-swatch--occupied" aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--mc-text-secondary)' }}>
              Ocupado (tengo clase)
            </span>
          </div>
        </div>
      </div>

      <Q2SaveStatus
        state={isDirty ? 'dirty' : 'saved'}
        dirtyLabel="Cambios sin guardar"
        savedLabel="Respuesta guardada"
      />

      {submitMutation.isError && <Q2Alert message={SAVE_ERROR_MESSAGE} />}

      <Q1Button
        type="button"
        label="Enviar respuesta"
        variant="primary"
        className="w-full"
        loading={submitMutation.isPending}
        disabled={!isDirty || isBusy}
        onClick={handleSubmit}
      />

      {showToast && <Q1Toast message={SAVE_SUCCESS_MESSAGE} onDismiss={() => setShowToast(false)} />}
    </div>
  );
}
