import { Q1StatusBadge } from '@global/components/q1-status-badge';
import type { RoomWithResponseCount } from '@resources/types/room-with-response-count.type';
import { Q2RoomActionsMenu, type RoomLifecycleAction } from '../q2-room-actions-menu';

export interface Q2PastRoomRowProps {
  room: RoomWithResponseCount;
  /** Igual que en `Q3RoomCard`: la fila avisa, `Q4DashboardRooms` ejecuta. */
  onAction: (action: RoomLifecycleAction) => void;
}

const dateFormatter = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Fila compacta de sala pasada — RC-008 §7/§10, frame "Dashboard Ayudante" ·
 * "Past Room". Toda sala que llegue acá es `closed`: las `archived` las
 * descarta `RoomService.getDashboardRooms` (RC-012 §5), así que el badge
 * "Cerrada" y la opción "Reabrir sala" del menú valen siempre.
 *
 * El kebab de esta fila no tiene frame de referencia (el diseño de "Past
 * Room" es anterior a HU-10), pero la HU exige "Reabrir sala" accesible en
 * la sección de salas pasadas: se reusa el mismo `Q2RoomActionsMenu` de la
 * card (RC-012 §10).
 */
export function Q2PastRoomRow({ room, onAction }: Q2PastRoomRowProps) {
  return (
    <div className="mc-past-room-row">
      <span className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--mc-text-primary)' }}>
        {room.name}
      </span>
      <div className="mc-past-room-row__meta">
        <span className="mc-numeric text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
          {room.code}
        </span>
        <span className="text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
          {dateFormatter.format(room.createdAt)}
        </span>
        <Q1StatusBadge label="Cerrada" color="neutral" />
        <Q2RoomActionsMenu status={room.status} roomName={room.name} onSelect={onAction} />
      </div>
    </div>
  );
}
