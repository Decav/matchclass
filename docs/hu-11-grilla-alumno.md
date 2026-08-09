# HU-11: Grilla de bloques del alumno

**Proyecto:** MatchClass

**Epica:** Respuesta del Alumno

**Prioridad:** Alta

**Story Points:** 3

---

## Narrativa (INVEST)

**Como** alumno,

**quiero** marcar los bloques donde tengo clase en una grilla de 50 celdas y enviar mi respuesta,

**para** que el ayudante sepa mi disponibilidad y pueda encontrar el mejor horario para la ayudantia.

---

## Descripcion / Contexto

El alumno llega aca despues de ingresar su codigo de sala y su nombre (flujo del tab Alumno en HU-01). El documento de respuesta ya fue creado en Firestore con `occupiedBlocks: []`.

La pantalla muestra una grilla de 10 filas (bloques USM) x 5 columnas (Lun-Vie) = **50 celdas**. El alumno marca con un toque las celdas donde **tiene clase o trabajo** (inversion de carga). Las celdas no marcadas son los bloques donde esta libre.

Esta pantalla **no usa el AppShell** — el alumno esta en sesion anonima y no tiene sidebar ni dashboard. Solo ve la grilla, el nombre de la sala, y el boton de envio.

Si el alumno ya respondio antes (vuelve a ingresar el codigo), la grilla se precarga con los bloques que marco previamente y puede modificarlos.

---

## Especificaciones / Contrato

- **Lectura de respuesta previa:** Firestore — `getDoc(doc(db, 'rooms', roomId, 'responses', anonymousUid))` para precargar los bloques ya marcados
- **Actualizacion de respuesta:** Firestore — `updateDoc(doc(db, 'rooms', roomId, 'responses', anonymousUid), { occupiedBlocks: [...], updatedAt: serverTimestamp() })`
- **Rango de valores:** `occupiedBlocks` acepta numeros del 1 al 50 (celdas dia+bloque, mapeo definido en `docs/tech-document.md`)
- **Sin AppShell:** Esta pantalla no tiene sidebar ni topbar. Es una vista publica
- **Sesion anonima:** El `anonymousUid` ya fue creado al ingresar el codigo (HU-01). Se usa para identificar el documento de respuesta

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Primera visita — grilla vacia

- **GIVEN** el alumno ingreso su codigo y nombre y su respuesta no tiene bloques marcados
- **WHEN** llega a la pantalla de la grilla
- **THEN** las 50 celdas aparecen sin marcar (fondo blanco `$grid-resting`)
- **AND** el header muestra "Estas respondiendo a" + nombre de la sala
- **AND** el boton "Enviar respuesta" esta deshabilitado (sin cambios)

### Escenario 2: Marcar y enviar bloques ocupados

- **GIVEN** el alumno esta en la grilla sin bloques marcados
- **WHEN** toca varias celdas (ej: celdas 1, 2, 8, 13) y presiona "Enviar respuesta"
- **THEN** el boton muestra un spinner
- **AND** `occupiedBlocks` se actualiza con `[1, 2, 8, 13]` en Firestore
- **AND** el indicador cambia a "Respuesta guardada"
- **AND** se muestra un toast o feedback "Respuesta enviada"

### Escenario 3: Modificar respuesta previa

- **GIVEN** el alumno ya respondio con `occupiedBlocks: [1, 2, 8, 13]`
- **WHEN** vuelve a ingresar el codigo de la misma sala
- **THEN** la grilla precarga las celdas 1, 2, 8 y 13 marcadas (fondo navy `$grid-occupied`)
- **AND** al desmarcar la celda 2 y presionar "Enviar respuesta"
- **THEN** `occupiedBlocks` se actualiza con `[1, 8, 13]`

### Escenario 4: Toggle de celda

- **GIVEN** el alumno esta en la grilla
- **WHEN** toca una celda sin marcar
- **THEN** la celda cambia a estado "ocupado" (fondo navy `$grid-occupied`)
- **AND** el indicador cambia a "Cambios sin guardar"
- **WHEN** toca la misma celda de nuevo
- **THEN** vuelve a estado "libre" (fondo blanco `$grid-resting`)

### Escenario 5: Error al enviar

- **GIVEN** el alumno marco bloques y presiona "Enviar respuesta"
- **WHEN** falla la escritura a Firestore
- **THEN** se muestra un mensaje "Error al guardar. Intenta de nuevo"
- **AND** las marcas realizadas no se pierden

### Escenario 6: Reingreso a sala cerrada

- **GIVEN** la sala fue cerrada por el ayudante (`status: 'closed'`)
- **WHEN** el alumno intenta acceder al codigo
- **THEN** se muestra "Esta sala ya no acepta respuestas"
- **AND** no puede ver ni modificar la grilla

---

## Comportamiento Visual (UI/UX)

- **Layout:** Sin AppShell. Card centrado de 840px con header, grilla y boton. Fondo de pagina `$bg-page`
- **Header:** Logo MC + "Estas respondiendo a" + nombre de la sala
- **Titulo:** "Marca los bloques donde tienes clase"
- **Subtitulo:** "Selecciona solo los horarios ocupados. El sistema calcula tu disponibilidad automaticamente"
- **Grilla:** 10 filas x 5 columnas (50 celdas). Cabecera de lun-vie. Columna izquierda con horarios en JetBrains Mono. Vespertinos muestran "Vespertino" en vez de horario
- **Celdas:** Toggle libre/ocupado. Libre: fondo `$grid-resting`. Ocupado: fondo `$grid-occupied`. Area tactil minima 44x44px
- **Indicador de estado:** Texto sutil: "Cambios sin guardar" (dot naranja) o "Respuesta guardada" (dot verde)
- **Boton:** "Enviar respuesta", primario, full-width. Deshabilitado sin cambios
- **Leyenda:** Libre/Ocupado debajo de la grilla
- **Nota privacidad:** "Tu nombre solo lo vera el ayudante"
- **Prioridad desktop:** >= 1024px. Mobile postergado
- **Idioma:** Espanol neutro, forma "tu"

---

## Definition of Done (DoD)

- [ ] La grilla de 50 celdas se renderiza con los horarios USM correctos
- [ ] Al tocar una celda, alterna entre libre y ocupado
- [ ] Los bloques se guardan correctamente como `occupiedBlocks` en Firestore (valores 1-50)
- [ ] Si el alumno vuelve a entrar, su respuesta previa se precarga
- [ ] El indicador muestra "Cambios sin guardar" / "Respuesta guardada" segun corresponda
- [ ] El boton esta deshabilitado sin cambios, habilitado con cambios
- [ ] Los estados de error muestran mensajes claros sin caidas
- [ ] La interfaz sigue el diseno aprobado en `matchclass_design.pen` (frame `Grilla Alumno`)
- [ ] La HU cumple con los criterios de aceptacion validados por QA
