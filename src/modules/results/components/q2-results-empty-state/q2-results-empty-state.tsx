import { Users } from 'lucide-react';

/**
 * Sala sin respuestas (RC-014 §9, HU-12 Escenario 3). No es un error: el
 * ayudante recién compartió el código y nadie contestó todavía, así que el
 * mensaje empuja a la acción que destraba la pantalla.
 *
 * Copy en español neutro ("Comparte"), no el "Compartí" de
 * `design-feedback-09.md` — `docs/estandar-idioma.md`.
 */
export function Q2ResultsEmptyState() {
  return (
    <div className="min-h-full flex items-center justify-center py-16">
      <div className="mc-card mc-empty-state flex flex-col items-center gap-4" style={{ maxWidth: 420 }}>
        <div className="mc-icon-circle mc-icon-circle--brand w-16 h-16">
          <Users size={28} strokeWidth={2} style={{ color: 'var(--mc-brand-primary)' }} aria-hidden="true" />
        </div>
        <div>
          <p className="mc-empty-state__title">Nadie respondió todavía</p>
          <p className="mc-empty-state__description">
            Comparte el código de la sala con tus alumnos para empezar a ver resultados
          </p>
        </div>
      </div>
    </div>
  );
}
