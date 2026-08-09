import { useEffect, useId, useRef, useState } from 'react';
import { Ellipsis, Lock, RotateCcw, Trash2 } from 'lucide-react';
import type { RoomStatus } from '@resources/entities/room.entity';

/** Las tres transiciones de ciclo de vida de HU-10 (RC-012 §6). */
export type RoomLifecycleAction = 'close' | 'reopen' | 'delete';

export interface Q2RoomActionsMenuProps {
  /** Solo `'active'` o `'closed'` llegan acá: las `archived` no se renderizan. */
  status: RoomStatus;
  /** Para el `aria-label` del kebab — hay uno por sala en la pantalla. */
  roomName: string;
  onSelect: (action: RoomLifecycleAction) => void;
}

/**
 * Menú kebab con las acciones de ciclo de vida de una sala (RC-012 §5,
 * HU-10). Vive en `modules/home` y no en `global/` a propósito: sus opciones
 * son de dominio ("Cerrar sala", "Reabrir sala", "Eliminar sala").
 *
 * El botón `⋮` sí está diseñado (`matchclass_design.pen` · "RC Kebab
 * Button", nodeId `s5GbWH`); el menú desplegado no existe en ningún frame
 * — `design-feedback-08.md` lo dejó "a elección del diseñador" (RC-012 §10).
 *
 * "Cerrar sala" solo aparece en salas activas y "Reabrir sala" solo en
 * cerradas (HU-10 Escenarios 1 y 3); "Eliminar sala" siempre.
 */
export function Q2RoomActionsMenu({ status, roomName, onSelect }: Q2RoomActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleSelect(action: RoomLifecycleAction) {
    setOpen(false);
    onSelect(action);
  }

  return (
    <div className="mc-room-actions" ref={containerRef}>
      <button
        type="button"
        className="mc-room-actions__trigger"
        aria-label={`Acciones de ${roomName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div className="mc-room-actions__menu" id={menuId} role="menu">
          {status === 'active' ? (
            <button
              type="button"
              role="menuitem"
              className="mc-room-actions__item"
              onClick={() => handleSelect('close')}
            >
              <Lock size={14} strokeWidth={2} aria-hidden="true" />
              Cerrar sala
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="mc-room-actions__item"
              onClick={() => handleSelect('reopen')}
            >
              <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
              Reabrir sala
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            className="mc-room-actions__item mc-room-actions__item--danger"
            onClick={() => handleSelect('delete')}
          >
            <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
            Eliminar sala
          </button>
        </div>
      )}
    </div>
  );
}
