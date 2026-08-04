import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Users } from 'lucide-react';
import { Q1StatusBadge } from '@global/components/q1-status-badge';
import type { RoomWithResponseCount } from '@resources/types/room-with-response-count.type';

export interface Q3RoomCardProps {
  room: RoomWithResponseCount;
}

const COPIED_LABEL_DURATION_MS = 1500;

/**
 * Card de sala activa (RC-008 §10 / frame "Dashboard Ayudante" · "Room Card
 * Component", nodeId `uksGB`). "Copiar" es funcional (no placeholder):
 * copia el código al portapapeles con una confirmación visual breve en el
 * propio botón — no depende de ninguna pantalla futura.
 *
 * `studentLimit` opcional (RC-008 §10, decisión ya tomada): con límite se
 * muestra "responseCount/studentLimit" + barra de progreso (tope 100%); sin
 * límite, solo "responseCount alumnos respondieron", sin barra.
 */
export function Q3RoomCard({ room }: Q3RoomCardProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleCopy = () => {
    void navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), COPIED_LABEL_DURATION_MS);
    });
  };

  const responsesLabel =
    room.studentLimit !== undefined
      ? `${room.responseCount}/${room.studentLimit} alumnos respondieron`
      : `${room.responseCount} alumnos respondieron`;

  const progressPercent =
    room.studentLimit !== undefined && room.studentLimit > 0
      ? Math.min(100, Math.round((room.responseCount / room.studentLimit) * 100))
      : null;

  return (
    <div className="mc-room-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[15px] font-semibold" style={{ color: 'var(--mc-text-primary)' }}>
          {room.name}
        </span>
        <Q1StatusBadge label="Activa" color="success" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
          Código
        </span>
        <span className="mc-room-card__code-box">{room.code}</span>
      </div>

      <div className="flex items-center gap-2">
        <Users size={16} strokeWidth={2} style={{ color: 'var(--mc-text-tertiary)' }} aria-hidden="true" />
        <span className="text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
          {responsesLabel}
        </span>
      </div>

      {progressPercent !== null && (
        <div
          className="mc-room-card__progress"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progressPercent}% de alumnos respondieron`}
        >
          <div className="mc-room-card__progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      )}

      <div className="mc-room-card__actions">
        <Link to={`/salas/${room.id}`} className="mc-room-card__action mc-room-card__action--primary">
          Abrir
        </Link>
        <button
          type="button"
          className="mc-room-card__action mc-room-card__action--secondary"
          onClick={handleCopy}
        >
          {copied ? (
            <Check size={14} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Copy size={14} strokeWidth={2} aria-hidden="true" />
          )}
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}
