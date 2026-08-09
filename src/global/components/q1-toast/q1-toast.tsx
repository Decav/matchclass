import { useEffect, useRef } from 'react';
import { CircleCheck } from 'lucide-react';

export interface Q1ToastProps {
  message: string;
  /** Se invoca una sola vez, cuando el toast termina de mostrarse. */
  onDismiss: () => void;
  /** Default 1500ms (RC-010 §10 — "Toast nuevo"). */
  durationMs?: number;
}

const DEFAULT_DURATION_MS = 1500;

/**
 * Confirmación breve tipo "toast" (RC-010 §6/§10, HU-08 Escenario 1). Primer
 * componente de este tipo en el proyecto — los demás usan `Q2Alert` (banner
 * inline permanente). No envuelve `primereact/toast`: esta versión de
 * PrimeReact no aplica ningún CSS a sus componentes sin un theme que este
 * proyecto no tiene configurado (mismo motivo documentado en `Q1Button`).
 *
 * Controlado por quien lo usa: aparece mientras está montado, y llama a
 * `onDismiss` una sola vez transcurrido `durationMs`. No se autodesmonta —
 * quien lo usa decide qué hacer al recibir `onDismiss` (ej. navegar).
 */
export function Q1Toast({ message, onDismiss, durationMs = DEFAULT_DURATION_MS }: Q1ToastProps) {
  // Ref actualizado en un efecto, no durante el render (`react-hooks/refs`):
  // el timer de abajo solo debe reiniciarse si cambia `durationMs`, nunca
  // por una nueva identidad de `onDismiss` en cada render del caller.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return (
    <div className="mc-toast" role="status">
      <CircleCheck size={20} strokeWidth={2} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
