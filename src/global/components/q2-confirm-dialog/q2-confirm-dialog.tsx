import { useEffect, useRef } from 'react';
import { TriangleAlert } from 'lucide-react';

export type Q2ConfirmVariant = 'primary' | 'danger';

export interface Q2ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  /** `'danger'` pinta el botón de confirmar en rojo; `'primary'`, en navy. */
  confirmVariant?: Q2ConfirmVariant;
  /** Deshabilita ambos botones mientras la acción confirmada está en curso. */
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación reutilizable (RC-012 §5, `design-feedback-08.md`
 * §2). Fuente de verdad visual: `matchclass_design.pen` · "Confirm Dialog
 * Component" (nodeId `lwsXI`), leído con `Get(nodeId, {resolveVariables:
 * true})`.
 *
 * No conoce ningún dominio: título, mensaje, label y color del botón de
 * confirmar entran por props — la misma instancia sirve para "cerrar sala"
 * (navy) y "eliminar sala" (rojo), y para lo que venga después.
 *
 * Dos desviaciones deliberadas del nodo:
 * - El nodo trae `D Title` con `fill: #FFFFFF` sobre un fondo también
 *   blanco (texto invisible, resto de un template oscuro). Se usa
 *   `--mc-text-primary`, que es lo que el frame muestra en pantalla.
 * - El botón de confirmar del nodo es rojo con label "Cerrar sala", pero
 *   `design-feedback-08.md` pide "botón danger (rojo) para delete, botón
 *   primario/default para close": el rojo del nodo se toma como el estado
 *   por defecto del componente y `confirmVariant` lo overridea.
 *
 * El ícono de advertencia sí se mantiene rojo en ambas variantes, tal como
 * el nodo (`D Icon Circle` + `triangle-alert`).
 */
export function Q2ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant = 'danger',
  pending = false,
  onConfirm,
  onCancel,
}: Q2ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Foco inicial en "Cancelar", no en el botón de acción: un Enter reflejo
  // sobre un diálogo recién abierto no debe archivar una sala.
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="mc-dialog-overlay" role="presentation" onClick={onCancel}>
      <div
        className="mc-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="mc-dialog-title"
        aria-describedby="mc-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mc-dialog__icon">
          <TriangleAlert size={26} strokeWidth={2} aria-hidden="true" />
        </div>

        <div className="mc-dialog__text">
          <h2 id="mc-dialog-title" className="mc-dialog__title">
            {title}
          </h2>
          <p id="mc-dialog-message" className="mc-dialog__message">
            {message}
          </p>
        </div>

        <div className="mc-dialog__actions">
          <button
            ref={cancelRef}
            type="button"
            className="mc-dialog__btn mc-dialog__btn--cancel"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`mc-dialog__btn mc-dialog__btn--${confirmVariant}`}
            onClick={onConfirm}
            disabled={pending}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
