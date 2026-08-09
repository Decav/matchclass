import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, DoorOpen, Plus, Users } from 'lucide-react';
import { useAuthStore } from '@global/store/auth.store';
import { Q1Toast } from '@global/components/q1-toast';
import { Q2ConfirmDialog, type Q2ConfirmVariant } from '@global/components/q2-confirm-dialog';
import type { RoomStatus } from '@resources/entities/room.entity';
import type { RoomWithResponseCount } from '@resources/types/room-with-response-count.type';
import { useDashboardRoomsQuery } from '../../core/hooks/use-dashboard-rooms-query';
import { useUpdateRoomStatusMutation } from '../../core/hooks/use-update-room-status-mutation';
import { Q2KpiCard } from '../q2-kpi-card';
import { Q3RoomCard } from '../q3-room-card';
import { Q2PastRoomRow } from '../q2-past-room-row';
import { Q3DashboardSkeleton } from '../q3-dashboard-skeleton';
import { Q2DashboardEmptyState } from '../q2-dashboard-empty-state';
import { Q2DashboardErrorState } from '../q2-dashboard-error-state';
import type { RoomLifecycleAction } from '../q2-room-actions-menu';

const STATUS_BY_ACTION: Record<RoomLifecycleAction, RoomStatus> = {
  close: 'closed',
  reopen: 'active',
  delete: 'archived',
};

/**
 * Copy de los diálogos, calcado de HU-10 Escenarios 1 y 4. "Reabrir" no
 * aparece acá: la HU es explícita en que va sin confirmación.
 */
const CONFIRMABLE = {
  close: {
    title: '¿Cerrar esta sala?',
    message: 'No se aceptarán más respuestas de alumnos',
    confirmLabel: 'Cerrar sala',
    // Navy, no rojo: `design-feedback-08.md` reserva el rojo para eliminar.
    confirmVariant: 'primary' as Q2ConfirmVariant,
  },
  delete: {
    title: '¿Eliminar esta sala?',
    message: 'Esta acción no se puede deshacer',
    confirmLabel: 'Eliminar',
    confirmVariant: 'danger' as Q2ConfirmVariant,
  },
} as const;

type ConfirmableAction = keyof typeof CONFIRMABLE;

const ERROR_MESSAGE = 'No se pudo actualizar la sala. Intenta de nuevo';
const ERROR_TOAST_DURATION_MS = 3000;

/**
 * Organismo con la lógica de "LoadDashboard" (RC-008 §6). Único punto donde
 * se elige el estado de render: loading -> skeletons, error -> reintento,
 * vacío -> empty state, datos -> KPIs + listas activas/pasadas.
 *
 * También el único punto que ejecuta "UpdateRoomStatus" (RC-012 §6, HU-10):
 * la card y la fila solo reportan qué acción eligió el ayudante, y acá se
 * decide si pasa por diálogo de confirmación (cerrar/eliminar) o se ejecuta
 * de inmediato (reabrir), se dispara la mutación y se muestra el error. Un
 * solo diálogo y un solo toast para todo el dashboard, en vez de uno por
 * sala renderizada.
 */
export function Q4DashboardRooms() {
  const user = useAuthStore((s) => s.user);
  const uid = user?.id ?? '';
  const { data, isLoading, isError, refetch } = useDashboardRoomsQuery(uid);

  const [pending, setPending] = useState<{ room: RoomWithResponseCount; action: ConfirmableAction } | null>(
    null,
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const { mutate: updateRoomStatus, isPending } = useUpdateRoomStatusMutation(uid);

  function runAction(
    room: RoomWithResponseCount,
    action: RoomLifecycleAction,
    onSettled: () => void = () => undefined,
  ) {
    setErrorVisible(false);
    updateRoomStatus(
      { roomId: room.id, status: STATUS_BY_ACTION[action] },
      {
        onError: () => setErrorVisible(true),
        onSettled,
      },
    );
  }

  function handleAction(room: RoomWithResponseCount, action: RoomLifecycleAction) {
    // "Reabrir" va directo, sin confirmar (HU-10 Escenario 3, comportamiento
    // visual: "Sin confirmación adicional").
    if (action === 'reopen') {
      runAction(room, action);
      return;
    }
    setPending({ room, action });
  }

  function handleConfirm() {
    if (!pending) return;
    runAction(pending.room, pending.action, () => setPending(null));
  }

  if (isLoading) return <Q3DashboardSkeleton />;
  if (isError) return <Q2DashboardErrorState onRetry={() => void refetch()} />;
  if (!data || data.length === 0) return <Q2DashboardEmptyState />;

  const activeRooms = data.filter((room) => room.status === 'active');
  const pastRooms = data.filter((room) => room.status !== 'active');
  const totalRooms = data.length;
  const totalResponses = data.reduce((sum, room) => sum + room.responseCount, 0);
  const confirmCopy = pending ? CONFIRMABLE[pending.action] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="mc-page-header__title">Mis salas</h1>
          <p className="mc-page-header__subtitle">Administra tus salas de coordinación</p>
        </div>
        <Link to="/salas/nueva" className="mc-btn mc-btn-primary">
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
          Nueva sala
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Q2KpiCard icon={DoorOpen} value={totalRooms} label="Salas totales" />
        <Q2KpiCard icon={Users} value={totalResponses} label="Respuestas recibidas" />
        <Q2KpiCard icon={Activity} value={activeRooms.length} label="Salas activas" />
      </div>

      {activeRooms.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--mc-text-primary)' }}>
            Salas activas
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {activeRooms.map((room) => (
              <Q3RoomCard key={room.id} room={room} onAction={(action) => handleAction(room, action)} />
            ))}
          </div>
        </div>
      )}

      {pastRooms.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--mc-text-primary)' }}>
            Salas pasadas
          </h2>
          <div className="flex flex-col gap-2">
            {pastRooms.map((room) => (
              <Q2PastRoomRow key={room.id} room={room} onAction={(action) => handleAction(room, action)} />
            ))}
          </div>
        </div>
      )}

      {confirmCopy && (
        <Q2ConfirmDialog
          open
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={confirmCopy.confirmLabel}
          confirmVariant={confirmCopy.confirmVariant}
          pending={isPending}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}

      {errorVisible && (
        <Q1Toast
          message={ERROR_MESSAGE}
          variant="error"
          durationMs={ERROR_TOAST_DURATION_MS}
          onDismiss={() => setErrorVisible(false)}
        />
      )}
    </div>
  );
}
