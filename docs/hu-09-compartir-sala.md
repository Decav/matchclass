# HU-09: Compartir sala

**Proyecto:** MatchClass

**Epica:** Gestion de Salas

**Prioridad:** Alta

**Story Points:** 1

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** copiar el codigo y el enlace de mi sala,

**para** compartirlo rapidamente con mis alumnos por WhatsApp, Discord o email.

---

## Descripcion / Contexto

El codigo corto de la sala es el unico dato que el alumno necesita para ingresar. El ayudante debe poder copiarlo facilmente desde dos lugares:

1. La card de la sala en el dashboard (boton "Copiar" en el componente `Room Card`)
2. La pantalla de confirmacion de creacion (boton de copiar junto al codigo)

El boton de copiar usa `navigator.clipboard.writeText()`. Tras copiar, muestra una confirmacion visual breve (cambio de icono o tooltip "Copiado").

---

## Especificaciones / Contrato

- **API del portapapeles:** `navigator.clipboard.writeText(code)` o `navigator.clipboard.writeText(enlace)`
- **Formato del enlace:** `${window.location.origin}/acceso?tipo=alumno&codigo=${room.code}` (para que el alumno llegue directo al tab Alumno con el codigo precargado)
- **Feedback visual:** Tooltip "Copiado" durante 2 segundos, o cambio de icono (copiar → check)

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Copiar codigo desde la card del dashboard

- **GIVEN** el ayudante esta en el dashboard con las cards de salas visibles
- **WHEN** presiona el boton "Copiar" en una card de sala
- **THEN** el codigo de la sala se copia al portapapeles
- **AND** se muestra una confirmacion visual breve (ej: icono cambia a check por 2s)

### Escenario 2: Copiar codigo desde la confirmacion de creacion

- **GIVEN** el ayudante esta en la pantalla de confirmacion tras crear una sala
- **WHEN** presiona el boton de copiar junto al codigo
- **THEN** el codigo se copia al portapapeles
- **AND** se muestra feedback visual

### Escenario 3: Copiar enlace completo

- **GIVEN** el ayudante quiere compartir el enlace directo
- **WHEN** presiona una opcion "Copiar enlace" (si existe en la UI)
- **THEN** se copia al portapapeles un enlace con el formato `/acceso?tipo=alumno&codigo=EDS101`
- **AND** el alumno que use ese enlace llega directo al tab Alumno con el codigo precargado

### Escenario 4: Navegador no soporta clipboard API

- **GIVEN** el navegador no soporta `navigator.clipboard`
- **WHEN** el ayudante presiona "Copiar"
- **THEN** se muestra el codigo seleccionado para que el usuario lo copie manualmente (fallback)

---

## Comportamiento Visual (UI/UX)

- **Boton copiar en card:** Icono de copiar al lado del codigo en JetBrains Mono. Tras copiar, icono cambia a check por 2 segundos
- **Boton copiar en confirmacion:** Mismo comportamiento, dentro de la seccion de codigo en la pantalla de confirmacion
- **Tooltip:** "Copiado" aparece al lado del boton, desaparece solo

---

## Definition of Done (DoD)

- [ ] El boton de copiar funciona desde la card del dashboard
- [ ] El boton de copiar funciona desde la pantalla de confirmacion
- [ ] La confirmacion visual de copiado se muestra correctamente
- [ ] Existe fallback para navegadores sin clipboard API
- [ ] El enlace copiado incluye el query param para abrir directo en el tab Alumno
- [ ] La HU cumple con los criterios de aceptacion validados por QA
