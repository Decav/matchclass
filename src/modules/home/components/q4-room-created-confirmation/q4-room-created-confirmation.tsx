import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CircleCheck, Copy, Link as LinkIcon } from 'lucide-react';
import { Q1Button } from '@global/components/q1-button';
import { copyToClipboard, selectElementText } from '@global/utils/copy-to-clipboard';
import { buildAlumnoAccessLink } from '@resources/utils/build-alumno-access-link';

export interface Q4RoomCreatedConfirmationProps {
  roomId: string;
  name: string;
  code: string;
}

type CopiedField = 'code' | 'link' | null;

const COPIED_LABEL_DURATION_MS = 1500;

/**
 * Paso 2 de `/salas/nueva` (RC-009, HU-07). "Copiar" es funcional (no
 * placeholder) — mismo patrón que `Q3RoomCard` (RC-008): copia el código al
 * portapapeles y muestra una confirmación visual breve cambiando el ícono,
 * sin depender de ninguna pantalla futura.
 *
 * "Copiar enlace" (RC-011, HU-09 Escenario 3) copia
 * `buildAlumnoAccessLink(code)` junto al código, mismo patrón visual. Ambos
 * pasan por `copyToClipboard`: sin Clipboard API, seleccionan visualmente el
 * código en pantalla (`selectElementText`, Escenario 4) en vez de mostrar
 * "¡Copiado!".
 */
export function Q4RoomCreatedConfirmation({ roomId, name, code }: Q4RoomCreatedConfirmationProps) {
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<CopiedField>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

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

  return (
    <div className="mc-create-room-card items-center text-center gap-6">
      <div className="mc-create-room-success-icon" aria-hidden="true">
        <CircleCheck size={32} strokeWidth={2} style={{ color: 'var(--mc-success)' }} />
      </div>

      <h1 className="text-2xl font-bold" style={{ color: 'var(--mc-text-primary)' }}>
        ¡Sala creada!
      </h1>

      <p className="text-lg font-semibold" style={{ color: 'var(--mc-text-primary)' }}>
        {name}
      </p>

      <div className="mc-create-room-code-section">
        <span className="text-xs font-medium" style={{ color: 'var(--mc-text-tertiary)' }}>
          Código de la sala
        </span>
        <div className="flex items-center gap-3">
          <span ref={codeRef} className="mc-create-room-code-box">
            {code}
          </span>
          <button
            type="button"
            className="mc-create-room-copy-btn"
            onClick={() => {
              void handleCopy('code', code);
            }}
            aria-label="Copiar código de la sala"
          >
            {copiedField === 'code' ? (
              <Check size={20} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Copy size={20} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="mc-create-room-copy-btn"
            onClick={() => {
              void handleCopy('link', buildAlumnoAccessLink(code));
            }}
            aria-label="Copiar enlace de la sala"
          >
            {copiedField === 'link' ? (
              <Check size={20} strokeWidth={2} aria-hidden="true" />
            ) : (
              <LinkIcon size={20} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--mc-text-secondary)', maxWidth: 380 }}>
        Comparte este código con tus alumnos para que puedan ingresar a la sala
      </p>

      <div className="flex flex-col gap-3 w-full">
        <Q1Button
          type="button"
          label="Configurar mis bloques"
          className="w-full mc-create-room-primary-btn"
          onClick={() => {
            void navigate(`/salas/${roomId}/bloques`);
          }}
        />
        <Q1Button
          type="button"
          label="Ir al dashboard"
          icon={ArrowLeft}
          variant="ghost"
          className="w-full mc-create-room-dashboard-btn"
          onClick={() => {
            void navigate('/dashboard');
          }}
        />
      </div>
    </div>
  );
}
