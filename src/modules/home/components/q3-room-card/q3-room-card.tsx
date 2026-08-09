import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Link as LinkIcon, Users } from 'lucide-react';
import { Q1StatusBadge } from '@global/components/q1-status-badge';
import { copyToClipboard, selectElementText } from '@global/utils/copy-to-clipboard';
import { buildAlumnoAccessLink } from '@resources/utils/build-alumno-access-link';
import type { RoomWithResponseCount } from '@resources/types/room-with-response-count.type';
import { Q2RoomActionsMenu, type RoomLifecycleAction } from '../q2-room-actions-menu';

export interface Q3RoomCardProps {
  room: RoomWithResponseCount;
  /**
   * La card no ejecuta la acción ni abre el diálogo: solo avisa cuál se
   * eligió. La mutación y la confirmación viven en `Q4DashboardRooms`
   * (RC-012 §6) — así hay un solo diálogo en pantalla y la card sigue sin
   * lógica de negocio.
   */
  onAction: (action: RoomLifecycleAction) => void;
}

type CopiedField = 'code' | 'link' | null;

const COPIED_LABEL_DURATION_MS = 1500;

/**
 * Card de sala activa (RC-008 §10 / frame "Dashboard Ayudante" · "Room Card
 * Component", nodeId `uksGB`). "Copiar" es funcional (no placeholder):
 * copia el código al portapapeles con una confirmación visual breve en el
 * propio botón — no depende de ninguna pantalla futura.
 *
 * "Copiar enlace" (RC-011, HU-09 Escenario 3) copia
 * `buildAlumnoAccessLink(room.code)` con el mismo patrón de confirmación.
 * Ambos botones pasan por `copyToClipboard`: si el navegador no soporta la
 * Clipboard API, en vez de "¡Copiado!" seleccionan visualmente el código en
 * pantalla (`selectElementText`, Escenario 4) para que el usuario lo copie
 * manualmente — nunca el enlace, que no se muestra en la card.
 *
 * El kebab `⋮` (RC-012, HU-10) abre el menú de ciclo de vida de la sala
 * ("Cerrar sala" / "Eliminar sala"). El nodo existía en el `.pen` desde la
 * iteración 8 del diseño, pero recién se implementa acá.
 *
 * `studentLimit` opcional (RC-008 §10, decisión ya tomada): con límite se
 * muestra "responseCount/studentLimit" + barra de progreso (tope 100%); sin
 * límite, solo "responseCount alumnos respondieron", sin barra.
 */
export function Q3RoomCard({ room, onAction }: Q3RoomCardProps) {
  const [copiedField, setCopiedField] = useState<CopiedField>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  async function handleCopy(field: 'code' | 'link', text: string) {
    const copied = await copyToClipboard(text);
    if (!copied) {
      if (codeRef.current) selectElementText(codeRef.current);
      return;
    }
    setCopiedField(field);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopiedField(null), COPIED_LABEL_DURATION_MS);
  }

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
        <span ref={codeRef} className="mc-room-card__code-box">
          {room.code}
        </span>
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
          onClick={() => {
            void handleCopy('code', room.code);
          }}
        >
          {copiedField === 'code' ? (
            <Check size={14} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Copy size={14} strokeWidth={2} aria-hidden="true" />
          )}
          {copiedField === 'code' ? '¡Copiado!' : 'Copiar'}
        </button>
        <button
          type="button"
          className="mc-room-card__action mc-room-card__action--secondary"
          onClick={() => {
            void handleCopy('link', buildAlumnoAccessLink(room.code));
          }}
        >
          {copiedField === 'link' ? (
            <Check size={14} strokeWidth={2} aria-hidden="true" />
          ) : (
            <LinkIcon size={14} strokeWidth={2} aria-hidden="true" />
          )}
          {copiedField === 'link' ? '¡Copiado!' : 'Copiar enlace'}
        </button>
        <Q2RoomActionsMenu status={room.status} roomName={room.name} onSelect={onAction} />
      </div>
    </div>
  );
}
