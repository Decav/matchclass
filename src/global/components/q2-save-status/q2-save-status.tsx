export type Q2SaveStatusState = 'dirty' | 'saved';

export interface Q2SaveStatusProps {
  state: Q2SaveStatusState;
  /** Texto con `state: 'dirty'` (ej. "Cambios sin guardar"). */
  dirtyLabel: string;
  /** Texto con `state: 'saved'` (ej. "Respuesta guardada"). */
  savedLabel: string;
}

/**
 * Indicador de "hay cambios sin guardar" / "está guardado": dot de color +
 * texto (RC-013 §5, frame `Grilla Alumno` · "AG Status Row", nodeId
 * `b8EQo`).
 *
 * Los labels entran por prop justamente para que este componente no tenga
 * copy de dominio: en HU-11 dicen "Respuesta guardada", pero la misma pieza
 * sirve para cualquier formulario con guardado explícito.
 *
 * `role="status"`: el cambio de estado se anuncia sin robar el foco. El
 * color del dot no es el único canal — el texto siempre está.
 */
export function Q2SaveStatus({ state, dirtyLabel, savedLabel }: Q2SaveStatusProps) {
  return (
    <div className={`mc-save-status mc-save-status--${state}`} role="status">
      <span className="mc-save-status__dot" aria-hidden="true" />
      <span>{state === 'dirty' ? dirtyLabel : savedLabel}</span>
    </div>
  );
}
