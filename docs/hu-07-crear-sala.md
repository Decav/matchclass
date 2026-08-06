# HU-07: Crear sala

**Proyecto:** MatchClass

**Epica:** Gestion de Salas

**Prioridad:** Alta

**Story Points:** 3

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** crear una sala de coordinacion con nombre, asignatura y seccion,

**para** empezar a recibir respuestas de disponibilidad de mis alumnos.

---

## Descripcion / Contexto

El ayudante llega desde el boton "Nueva sala" del dashboard. El flujo tiene dos pasos dentro del AppShell (sidebar + topbar):

1. **Formulario:** ingresa nombre de la sala, asignatura y seccion. Al crear, el sistema genera un codigo corto unico automaticamente (3-6 caracteres alfanumericos) y guarda la sala en Firestore.
2. **Confirmacion:** se muestra el codigo generado con opcion de copiarlo y dos caminos: "Configurar mis bloques" (HU-08 de restricciones) o "Ir al dashboard".

La sala se crea con `status: 'active'` y `helperBlockedSlots: []` (vacio — las restricciones se configuran en HU-08).

---

## Especificaciones / Contrato

- **Creacion del documento:** Firestore — `addDoc(collection(db, 'rooms'), { name, subject, section, code: generateCode(), createdBy: uid, createdAt: serverTimestamp(), status: 'active', helperBlockedSlots: [] })`
- **Generacion de codigo:** Funcion que genera un string alfanumerico de 3-6 caracteres en mayusculas. Debe ser unico en la coleccion `rooms`
- **Deteccion de colision:** Si el codigo generado ya existe, reintentar hasta 3 veces antes de fallar
- **Dueño:** `createdBy` se asigna al `uid` del ayudante autenticado (`auth.currentUser.uid`)

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Flujo feliz — creacion exitosa

- **GIVEN** el ayudante esta en el formulario "Crear nueva sala" con los campos vacios
- **WHEN** completa nombre, asignatura y seccion, y presiona "Crear sala"
- **THEN** el boton muestra un spinner y los campos se deshabilitan
- **AND** el sistema genera un codigo unico y crea el documento en `rooms`
- **AND** se muestra la pantalla de confirmacion con el nombre de la sala y el codigo generado en JetBrains Mono
- **AND** el codigo tiene entre 3 y 6 caracteres en mayusculas

### Escenario 2: Validacion de campos vacios

- **GIVEN** el ayudante esta en el formulario de creacion
- **WHEN** presiona "Crear sala" sin completar uno o mas campos
- **THEN** los campos vacios muestran borde rojo y mensaje "Este campo es obligatorio"
- **AND** no se crea ningun documento en Firestore

### Escenario 3: Cancelar vuelve al dashboard

- **GIVEN** el ayudante esta en el formulario de creacion
- **WHEN** presiona "Cancelar"
- **THEN** es redirigido al dashboard sin crear la sala

### Escenario 4: Copiar codigo desde la confirmacion

- **GIVEN** el ayudante esta en la pantalla de confirmacion con el codigo visible
- **WHEN** presiona el boton de copiar
- **THEN** el codigo se copia al portapapeles
- **AND** se muestra una confirmacion visual (cambio de icono o tooltip "Copiado")

### Escenario 5: Ir al dashboard desde la confirmacion

- **GIVEN** el ayudante esta en la pantalla de confirmacion
- **WHEN** presiona "Ir al dashboard"
- **THEN** es redirigido al dashboard
- **AND** la nueva sala aparece en la lista de salas activas

### Escenario 6: Configurar mis bloques

- **GIVEN** el ayudante esta en la pantalla de confirmacion
- **WHEN** presiona "Configurar mis bloques"
- **THEN** es redirigido al flujo de configuracion de restricciones (HU-08)

### Escenario 7: Error de red al crear

- **GIVEN** el ayudante completo los campos validos
- **WHEN** presiona "Crear sala" pero no hay conexion
- **THEN** se muestra el mensaje "Error de conexion. Intenta de nuevo"
- **AND** el boton vuelve a su estado activo
- **AND** los datos del formulario no se pierden

---

## Comportamiento Visual (UI/UX)

- **Layout:** Dentro del AppShell (sidebar + topbar existentes). No redirige a una pagina sin sidebar
- **Topbar:** Titulo "Nueva sala" en el paso 1, "Sala creada" en el paso 2
- **Formulario:** Card de 480px. Campos con labels y validacion inline. Boton "Crear sala" deshabilitado si hay campos vacios
- **Confirmacion:** Card centrado con icono check verde, nombre de sala, codigo en JetBrains Mono con boton de copiar, mensaje "Comparte este codigo con tus alumnos..."
- **Prioridad desktop:** >= 1024px. Mobile postergado
- **Idioma:** Espanol neutro, forma "tu"

---

## Definition of Done (DoD)

- [ ] El formulario de creacion se renderiza dentro del AppShell
- [ ] Al crear, se genera un codigo unico y se guarda en Firestore con todos los campos requeridos
- [ ] La pantalla de confirmacion muestra el codigo y permite copiarlo
- [ ] Los botones "Cancelar", "Ir al dashboard" y "Configurar mis bloques" navegan correctamente
- [ ] Los estados de validacion y error funcionan sin caidas
- [ ] La interfaz sigue el diseno aprobado en `matchclass_design.pen` (frames `Crear Sala - Formulario` y `Crear Sala - Confirmacion`)
- [ ] La HU cumple con los criterios de aceptacion validados por QA
