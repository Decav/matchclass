CreateRequirementPrompt.md
Necesito que crees un requerimiento para la siguiente funcionalidad, Tienes que seguir la estructura del archivo RC-TEMPLATE.md y segun el modulo especificado,
se debe generar el archivo [rcxxx.md] dentro de la carpeta .claude.requirements.

Requerimiento: 

[

# HU-10: Cerrar, reabrir y eliminar sala

**Proyecto:** MatchClass

**Epica:** Gestion de Salas

**Prioridad:** Media

**Story Points:** 2

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** cerrar, reabrir o eliminar mis salas de coordinacion,

**para** controlar el ciclo de vida de cada sala y mantener organizado mi espacio.

---

## Descripcion / Contexto

Las salas tienen un ciclo de vida. El ayudante puede:

1. **Cerrar una sala activa:** cuando ya se decidio el horario o la ayudantia termino. Las respuestas se congelan (no se aceptan nuevas).
2. **Reabrir una sala cerrada:** si la ayudantia se cancela, cambia de horario o necesita mas respuestas.
3. **Eliminar una sala:** borrado logico (soft delete) de una sala que ya no se necesita.

Las acciones se ejecutan desde la card de la sala en el dashboard.

---

## Especificaciones / Contrato

- **Cerrar sala:** `updateDoc(doc(db, 'rooms', roomId), { status: 'closed' })`
- **Reabrir sala:** `updateDoc(doc(db, 'rooms', roomId), { status: 'active' })`
- **Eliminar sala (soft delete):** `updateDoc(doc(db, 'rooms', roomId), { status: 'archived' })`
- **Seguridad:** Solo el creador (`createdBy`) puede modificar el estado de su sala (validado por Firestore Security Rules)
- **Inmutabilidad de respuestas:** Al cerrar, las respuestas existentes no se borran. Solo se bloquea la creacion de nuevas

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Cerrar sala activa

- **GIVEN** el ayudante esta en el dashboard con salas activas
- **WHEN** selecciona la opcion "Cerrar sala" en la card de una sala activa
- **THEN** se muestra un mensaje de confirmacion "¿Cerrar esta sala? No se aceptaran mas respuestas"
- **AND** al confirmar, el estado de la sala cambia a `closed` en Firestore
- **AND** la sala se mueve a la seccion "Salas pasadas" del dashboard

### Escenario 2: Intentar responder a una sala cerrada

- **GIVEN** una sala tiene `status: 'closed'`
- **WHEN** un alumno intenta ingresar con el codigo de esa sala
- **THEN** se muestra el mensaje "Esta sala ya no acepta respuestas"
- **AND** no se puede avanzar a la grilla

### Escenario 3: Reabrir sala cerrada

- **GIVEN** el ayudante esta en el dashboard con salas pasadas
- **WHEN** selecciona la opcion "Reabrir sala" en una sala cerrada
- **THEN** el estado de la sala cambia a `active` en Firestore
- **AND** la sala vuelve a aparecer en la seccion "Salas activas"
- **AND** los alumnos pueden volver a responder

### Escenario 4: Eliminar sala

- **GIVEN** el ayudante esta en el dashboard
- **WHEN** selecciona la opcion "Eliminar sala" en una sala
- **THEN** se muestra un mensaje de confirmacion "¿Eliminar esta sala? Esta accion no se puede deshacer"
- **AND** al confirmar, el estado de la sala cambia a `archived`
- **AND** la sala desaparece del dashboard

### Escenario 5: Otro ayudante no puede modificar la sala

- **GIVEN** un ayudante ve una sala que no creo
- **THEN** no se muestran las opciones de cerrar, reabrir ni eliminar
- **AND** Firestore Security Rules rechaza cualquier intento de escritura directo

---

## Comportamiento Visual (UI/UX)

- **Cerrar sala:** Opcion en el menu de acciones de la card (o boton). Mostrar dialogo de confirmacion antes de ejecutar. Tras cerrar, la card se mueve a "Salas pasadas" con badge "Cerrada"
- **Reabrir sala:** Opcion disponible solo en salas cerradas. Mostrar en la seccion de salas pasadas. Sin confirmacion adicional
- **Eliminar sala:** Opcion en el menu de acciones. Dialogo de confirmacion con advertencia. Tras eliminar, la sala desaparece del dashboard
- **Confirmaciones:** Usar un dialogo/modal simple con titulo, mensaje y botones "Confirmar"/"Cancelar"

---

## Definition of Done (DoD)

- [ ] Cerrar una sala cambia su estado a `closed` en Firestore y bloquea nuevas respuestas
- [ ] Reabrir una sala cambia su estado a `active` y permite nuevas respuestas
- [ ] Eliminar una sala cambia su estado a `archived` y la oculta del dashboard
- [ ] Las confirmaciones se muestran antes de cerrar/eliminar
- [ ] Firestore Security Rules validan que solo el creador puede modificar la sala
- [ ] La HU cumple con los criterios de aceptacion validados por QA


]

Notas: revisar el archivo pencil, para revisar los diseños desktop

Recuerda no implementar nada que no se haga mencion y tambien nunca aplicar cambios sin antes preguntarme, por otro lado si tienes algo que proponer, consultalo conmigo primero para poder aprobarlo o desaprobarlo.
Limitate siempre a seguir las instrucciones de los archivos .md (CLAUDE.md y skills) y no intentes hacer cambios en archivos que no se mencionen en el requerimiento.
