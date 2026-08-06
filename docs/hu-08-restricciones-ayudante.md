# HU-08: Configurar restricciones del ayudante

**Proyecto:** MatchClass

**Epica:** Gestion de Salas

**Prioridad:** Alta

**Story Points:** 3

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** marcar los bloques horarios donde tengo clase y no puedo dictar ayudantia,

**para** que el sistema excluya automaticamente esos horarios del calculo de matching.

---

## Descripcion / Contexto

El ayudante llega desde el boton "Configurar mis bloques" en la confirmacion de creacion de sala (HU-07), o desde la card de una sala existente en el dashboard (HU-06).

La pantalla muestra una grilla completa de 10 filas (bloques USM) x 5 columnas (Lun-Vie) = **50 celdas**. Cada celda es un toggle: al hacer clic se marca como ocupado (fondo navy) o se desmarca (fondo blanco).

El ayudante marca los bloques donde **tiene clase** (inversion de carga). Los bloques no marcados son los que quedan disponibles para la ayudantia.

Esta informacion es privada: los alumnos nunca ven que bloques marco el ayudante. En el heatmap del alumno esos bloques aparecen como gris/bloqueado, sin revelar que son restricciones del ayudante.

---

## Especificaciones / Contrato

- **Escritura:** Firestore — `updateDoc(doc(db, 'rooms', roomId), { helperBlockedSlots: [...] })`
- **Lectura:** Firestore — `getDoc(doc(db, 'rooms', roomId))` para precargar los bloques si la sala ya tiene restricciones
- **Formato de datos:** `helperBlockedSlots: number[]` — array con los numeros de bloque ocupados (1-50, donde el numero representa la celda en la grilla)
- **Modo edicion:** Si la sala ya existe, precargar la grilla con los valores guardados
- **Modo creacion:** Si viene de la confirmacion de sala nueva, la grilla arranca vacia

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Marcar y guardar bloques ocupados

- **GIVEN** el ayudante esta en la pantalla "Configura tus bloques ocupados" con la grilla vacia
- **WHEN** marca varias celdas haciendo clic en ellas y presiona "Guardar cambios"
- **THEN** el boton muestra un spinner
- **AND** se actualiza `helperBlockedSlots` en el documento de la sala en Firestore
- **AND** se muestra una confirmacion visual (toast "Cambios guardados")
- **AND** es redirigido de vuelta al dashboard

### Escenario 2: Editar restricciones existentes

- **GIVEN** la sala ya tiene `helperBlockedSlots` guardados (ej: [2, 4, 6, 8])
- **WHEN** el ayudante abre la pantalla desde una sala existente
- **THEN** las celdas correspondientes a los bloques 2, 4, 6 y 8 aparecen marcadas (fondo navy)
- **AND** el resto de las celdas aparecen sin marcar (fondo blanco)

### Escenario 3: Omitir restricciones

- **GIVEN** el ayudante esta en la pantalla de configuracion de bloques
- **WHEN** presiona "Omitir"
- **THEN** es redirigido al dashboard sin guardar cambios en Firestore
- **AND** la sala mantiene sus restricciones anteriores (si las tenia)

### Escenario 4: Interaccion tactil de las celdas

- **GIVEN** el ayudante esta en la grilla
- **WHEN** hace clic en una celda sin marcar
- **THEN** la celda cambia a estado "ocupado" (fondo `$grid-occupied`, navy)
- **AND** al hacer clic de nuevo, vuelve a "libre" (fondo `$grid-resting`, blanco)

### Escenario 5: Guardar sin cambios

- **GIVEN** el ayudante esta en la grilla con los bloques precargados desde Firestore
- **WHEN** no modifica ninguna celda
- **THEN** el boton "Guardar cambios" permanece deshabilitado

### Escenario 6: Error al guardar

- **GIVEN** el ayudante marco bloques y presiona "Guardar cambios"
- **WHEN** falla la escritura a Firestore
- **THEN** se muestra un mensaje de error "Error al guardar. Intenta de nuevo"
- **AND** las marcas realizadas no se pierden (estado local se mantiene)

---

## Comportamiento Visual (UI/UX)

- **Layout:** Dentro del AppShell (sidebar + topbar). Contenido a ancho completo
- **Topbar:** Titulo "Mis bloques"
- **Grilla:** 10 filas x 5 columnas (50 celdas). Cabecera de dias y columna izquierda con horarios. Celdas de 88x52px. Los bloques vespertinos muestran "Vespertino" en lugar de horario
- **Toggle de celda:** Clic para alternar entre libre (blanco `$grid-resting`) y ocupado (navy `$grid-occupied`). Area tactil minima 44x44px
- **Leyenda:** Iconos/colores para libre y ocupado debajo de la grilla
- **Nota de privacidad:** Texto informativo "Esta informacion es privada..."
- **Botones:** "Guardar cambios" (primario, deshabilitado sin cambios) y "Omitir" (secundario)
- **Prioridad desktop:** >= 1024px. Mobile postergado
- **Idioma:** Espanol neutro, forma "tu"

---

## Definition of Done (DoD)

- [ ] La grilla de 50 celdas (10 filas x 5 dias) se renderiza con los horarios correctos
- [ ] Al hacer clic en una celda, alterna entre libre y ocupado
- [ ] Los bloques guardados se precargan al editar una sala existente
- [ ] El boton "Guardar cambios" escribe `helperBlockedSlots` en Firestore
- [ ] El boton "Omitir" descarta los cambios locales y redirige
- [ ] El boton "Guardar cambios" esta deshabilitado si no hubo modificaciones
- [ ] Los estados de error muestran mensajes claros sin caidas
- [ ] La interfaz sigue el diseno aprobado en `matchclass_design.pen` (frame `Configurar Mis Bloques`)
- [ ] La HU cumple con los criterios de aceptacion validados por QA
