import { Q1StatusBadge } from '@global/components/q1-status-badge';
import type { RoomWithResponseCount } from '@resources/types/room-with-response-count.type';

export interface Q2PastRoomRowProps {
  room: RoomWithResponseCount;
}

const dateFormatter = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Fila compacta de sala pasada (`closed`/`archived`) — RC-008 §7/§10, frame
 * "Dashboard Ayudante" · "Past Room".
 */
export function Q2PastRoomRow({ room }: Q2PastRoomRowProps) {
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
      </div>
    </div>
  );
}
