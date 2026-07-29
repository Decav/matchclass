import { Lock } from 'lucide-react';

/**
 * Estado "sin permisos" (equivalente a `permission-denied` de Firestore o un
 * 403 de una API auxiliar). Se renderiza inline en el componente que recibió
 * el rechazo — nunca navega ni reemplaza la pantalla completa.
 *
 * Ver 11-http-error-handling.md Regla 3.
 */
export function Q2Forbidden() {
  return (
    <div className="mc-empty-state" role="alert">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--mc-danger-bg)' }}
      >
        <Lock size={28} strokeWidth={2} style={{ color: 'var(--mc-danger)' }} aria-hidden="true" />
      </div>
      <p className="mc-empty-state__title" style={{ color: 'var(--mc-danger-text)' }}>
        Sin permisos
      </p>
      <p className="mc-empty-state__description">
        No tienes permisos para ver este contenido. Contacta al administrador si crees que es un
        error.
      </p>
    </div>
  );
}
