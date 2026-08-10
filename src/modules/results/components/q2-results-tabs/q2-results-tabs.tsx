/**
 * Pestañas de la pantalla de resultados (RC-014 §5, frame `Resultados Sala`
 * · "R Tabs"). "Respuestas" es un placeholder declarado de HU-12: se
 * renderiza como texto inerte —no como `button` deshabilitado— para que
 * ningún lector de pantalla lo anuncie como algo accionable que no existe.
 * Mismo criterio que el ítem "Próximamente" del sidebar (RC-008 §10).
 *
 * Sin estado ni props: mientras "Resultados" sea la única pestaña real, un
 * `tablist` con selección manejable sería infraestructura sin uso.
 */
export function Q2ResultsTabs() {
  return (
    <div className="mc-results-tabs">
      <div className="mc-results-tabs__tab mc-results-tabs__tab--active" aria-current="page">
        Resultados
      </div>
      <div className="mc-results-tabs__tab">Respuestas</div>
    </div>
  );
}
