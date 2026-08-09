import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Q1Button } from '@global/components/q1-button';
import { Q1Toast } from '@global/components/q1-toast';
import { Q2Alert } from '@global/components/q2-alert';
import { Q3ScheduleGrid, type Q3ScheduleGridRow } from '@global/components/q3-schedule-grid';
import { USM_SCHEDULE_BLOCKS, USM_SCHEDULE_DAYS } from '@resources/constants/usm-schedule';
import { useRoomBlocksQuery } from '../../core/hooks/use-room-blocks-query';
import { useSaveRoomBlocksMutation } from '../../core/hooks/use-save-room-blocks-mutation';

export interface Q4RoomBlocksGridProps {
  roomId: string;
}

const SAVE_ERROR_MESSAGE = 'Error al guardar. Intenta de nuevo';

// Filas de `Q3ScheduleGrid` derivadas de `USM_SCHEDULE_BLOCKS` (RC-010 §6):
// label = hora de inicio (o "Vespertino" sin horario), sublabel = hora de
// término. Constante de módulo — no se recalcula en cada render.
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
 * Contenido de `/salas/:roomId/bloques` (RC-010, HU-08) — reemplaza
 * `PaRoomBlocksPlaceholder` (RC-009). Implementa "LoadRoomBlocks" y
 * "SaveRoomBlocks" (RC-010 §6):
 * - Precarga `helperBlockedSlots` con `useRoomBlocksQuery`; si la sala no
 *   tiene restricciones (o falla la lectura), arranca vacía.
 * - "Guardar cambios" solo se habilita si `selected` difiere de lo
 *   precargado (comparación de contenido, Escenario 5).
 * - Al guardar con éxito, muestra `Q1Toast` y navega a `/dashboard` cuando
 *   el toast se descarta (Escenario 1). Al fallar, muestra el error sin
 *   perder la selección local (Escenario 6).
 * - "Omitir" navega a `/dashboard` sin llamar a `updateBlockedSlots`
 *   (Escenario 3).
 */
export function Q4RoomBlocksGrid({ roomId }: Q4RoomBlocksGridProps) {
  const navigate = useNavigate();
  const { data: room, isLoading } = useRoomBlocksQuery(roomId);
  const saveMutation = useSaveRoomBlocksMutation(roomId);

  const preloaded = useMemo(() => new Set(room?.helperBlockedSlots ?? []), [room]);

  // "Adjusting state when a prop changes" (react.dev/learn/you-might-not-need-an-effect):
  // resincroniza `selected` con `preloaded` durante el render, no en un
  // efecto — evita el doble render de un `useEffect` con `setState`, y
  // sigue disparándose cada vez que `preloaded` cambia de identidad
  // (llegada de datos o refetch tras guardar).
  const [priorPreloaded, setPriorPreloaded] = useState(preloaded);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(preloaded));
  if (preloaded !== priorPreloaded) {
    setPriorPreloaded(preloaded);
    setSelected(new Set(preloaded));
  }

  const [showToast, setShowToast] = useState(false);

  const isDirty = !areSetsEqual(selected, preloaded);
  const isBusy = isLoading || saveMutation.isPending;

  function handleToggle(cell: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cell)) next.delete(cell);
      else next.add(cell);
      return next;
    });
  }

  function handleSave() {
    saveMutation.mutate(toSortedArray(selected), { onSuccess: () => setShowToast(true) });
  }

  function handleSkip() {
    void navigate('/dashboard');
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 900 }}>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold" style={{ fontSize: 22, color: 'var(--mc-text-primary)' }}>
          Configura tus bloques ocupados
        </h1>
        <p className="text-sm" style={{ color: 'var(--mc-text-secondary)', maxWidth: 600 }}>
          Marca los bloques donde tienes clase. El sistema los excluirá automáticamente del cálculo.
        </p>
      </div>

      <Q3ScheduleGrid
        rows={GRID_ROWS}
        columns={USM_SCHEDULE_DAYS}
        selected={selected}
        onToggle={handleToggle}
        disabled={isBusy}
      />

      <div className="flex items-center gap-6">
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

      <div className="mc-schedule-privacy-note">
        <Shield size={18} strokeWidth={2} aria-hidden="true" />
        <span>
          Esta información es privada. Tus alumnos no verán tus bloques ocupados, solo se usan para filtrar los
          resultados.
        </span>
      </div>

      {saveMutation.isError && <Q2Alert message={SAVE_ERROR_MESSAGE} />}

      <div className="flex items-center gap-3">
        <Q1Button
          type="button"
          label="Omitir"
          variant="ghost"
          className="mc-room-blocks-skip-btn"
          onClick={handleSkip}
          disabled={saveMutation.isPending}
        />
        <Q1Button
          type="button"
          label="Guardar cambios"
          variant="primary"
          loading={saveMutation.isPending}
          disabled={!isDirty || saveMutation.isPending}
          onClick={handleSave}
        />
      </div>

      {showToast && <Q1Toast message="Cambios guardados" onDismiss={() => void navigate('/dashboard')} />}
    </div>
  );
}
