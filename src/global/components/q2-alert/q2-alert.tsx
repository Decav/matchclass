import { TriangleAlert } from 'lucide-react';

export interface Q2AlertProps {
  message: string;
}

/**
 * Alerta inline de error, reutilizable por cualquier formulario ("Error
 * Alert" en `Auth Components` del `matchclass_design.pen`). No conoce
 * dominio: recibe el mensaje ya resuelto por quien la usa.
 */
export function Q2Alert({ message }: Q2AlertProps) {
  return (
    <div className="mc-alert mc-alert-danger" role="alert">
      <TriangleAlert size={18} strokeWidth={2} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
