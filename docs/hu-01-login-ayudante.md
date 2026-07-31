# HU-01: Página de acceso con tabs Ayudante y Alumno

**Proyecto:** MatchClass

**Épica:** Autenticación de Ayudante / Ingreso de Alumno

**Prioridad:** Alta

**Story Points:** 5

---

## Narrativa (INVEST)

**Como** usuario de MatchClass (ayudante o alumno),

**quiero** acceder a la plataforma desde una misma página con dos tabs —uno para login del ayudante y otro para ingreso del alumno por código—,

**para** que cada actor llegue rápidamente a lo que necesita sin pantallas separadas.

---

## Descripción / Contexto

Una sola página en la ruta `/acceso` con dos tabs: **"Ayudante"** y **"Alumno"**. Cada tab tiene su propio formulario. El tab activo se refleja en la URL vía query param: `/acceso` (default, ayudante) o `/acceso?tipo=alumno`.

El tab **Ayudante** muestra el formulario de inicio de sesión (email + password). Firebase Auth maneja la autenticación y la persistencia de sesión en IndexedDB. Si el ayudante ya tiene sesión activa al cargar la app, se redirige automáticamente al dashboard sin pasar por esta página.

El tab **Alumno** permite ingresar un código de sala corto. Al ingresar un código válido, la misma página muestra el formulario de nombre del alumno. Firebase Anonymous Auth le asigna un `uid` persistente que se usa como ID de su documento de respuesta. No requiere ningún tipo de registro.

El registro de nuevo ayudante (HU-02) tiene su propia pantalla fuera de esta página.

---

## Especificaciones / Contrato

- **Autenticación ayudante:** Firebase Auth — `signInWithEmailAndPassword(email, password)`
- **Autenticación alumno:** Firebase Auth — `signInAnonymously()` al ingresar el código
- **Persistencia de sesión:** Firebase Auth persiste en IndexedDB por defecto
- **Validación de código de sala:** Leer documento `rooms/{roomId}` donde `code` coincida. Firestore query con `where('code', '==', input)`
- **Lectura de datos del usuario:** Al iniciar sesión el ayudante, leer `users/{uid}` para `displayName` y `role`
- **Respuesta del alumno:** Al enviar nombre, crear documento en `rooms/{roomId}/responses/{anonymousUid}` con `studentName`, `occupiedBlocks: []` y `createdByUid`
- **URL del tab activo:** `/acceso` para ayudante, `/acceso?tipo=alumno` para alumno

---

## Criterios de Aceptación (Gherkin)

### TAB AYUDANTE

#### Escenario 1: Flujo feliz — credenciales válidas

- **GIVEN** el ayudante está en `/acceso` con el tab "Ayudante" activo y los campos vacíos
- **WHEN** ingresa un email y contraseña válidos y presiona "Iniciar sesión"
- **THEN** el botón muestra un spinner y los campos se deshabilitan
- **AND** Firebase Auth valida las credenciales
- **AND** se lee el documento `users/{uid}` desde Firestore
- **AND** el ayudante es redirigido al dashboard

#### Escenario 2: Credenciales inválidas

- **GIVEN** el ayudante está en la pantalla de login del tab Ayudante
- **WHEN** ingresa un email o contraseña incorrectos y presiona "Iniciar sesión"
- **THEN** se muestra el mensaje "Email o contraseña incorrectos" sobre el formulario
- **AND** los campos mantienen los valores ingresados (no se limpian)
- **AND** el botón vuelve a su estado activo

#### Escenario 3: Validación de campos

- **GIVEN** el ayudante está en el tab Ayudante
- **WHEN** presiona "Iniciar sesión" sin completar email o password, o ingresa un email sin formato válido
- **THEN** el campo con error muestra borde rojo y mensaje "Este campo es obligatorio" o "Ingresá un email válido"
- **AND** no se ejecuta la llamada a Firebase

#### Escenario 4: Sesión activa al cargar la app

- **GIVEN** el ayudante ya inició sesión previamente
- **WHEN** abre la aplicación
- **THEN** es redirigido automáticamente al dashboard sin ver la página de acceso

#### Escenario 5: Error de red

- **GIVEN** el ayudante está en el tab Ayudante
- **WHEN** ingresa credenciales válidas pero no hay conexión
- **THEN** se muestra el mensaje "Error de conexión. Intentá de nuevo"
- **AND** el botón vuelve a su estado activo

### TABS — GENERAL

#### Escenario 6: Tab Ayudante activo por defecto

- **GIVEN** un usuario navega a `/acceso` sin query params
- **WHEN** la página carga
- **THEN** el tab "Ayudante" está activo
- **AND** se muestra el formulario de email + password
- **AND** el contenido del tab Alumno está oculto

#### Escenario 7: URL con query param `?tipo=alumno`

- **GIVEN** un usuario navega a `/acceso?tipo=alumno`
- **WHEN** la página carga
- **THEN** el tab "Alumno" está activo
- **AND** se muestra el campo de código de sala
- **AND** el formulario de login está oculto

#### Escenario 8: Cambio de tab no pierde datos

- **GIVEN** un usuario completó datos en el tab Ayudante
- **WHEN** cambia al tab Alumno y vuelve al tab Ayudante
- **THEN** los campos email y password mantienen los valores escritos

### TAB ALUMNO — CÓDIGO

#### Escenario 9: Código válido — muestra pantalla de nombre

- **GIVEN** el alumno está en el tab Alumno con las 6 celdas de código vacías
- **WHEN** completa un código de sala válido (6 caracteres) y presiona "Ingresar"
- **THEN** se crea una sesión anónima de Firebase Auth
- **AND** se muestra en el mismo card el nombre de la sala y el campo "Tu nombre"
- **AND** el nombre de la sala coincide con el de la sala encontrada

#### Escenario 10: Código inválido

- **GIVEN** el alumno está en el tab Alumno
- **WHEN** completa un código que no existe y presiona "Ingresar"
- **THEN** las celdas muestran borde rojo
- **AND** se muestra el mensaje "Código inválido. Revisá con tu ayudante"
- **AND** el campo de código no se limpia

#### Escenario 11: Sala cerrada

- **GIVEN** el alumno está en el tab Alumno
- **WHEN** completa un código de una sala con estado `closed`
- **THEN** se muestra el mensaje "Esta sala ya no acepta respuestas"
- **AND** no se avanza a la pantalla de nombre

#### Escenario 12: Código incompleto

- **GIVEN** el alumno está en el tab Alumno
- **WHEN** no completa las 6 celdas del código
- **THEN** el botón "Ingresar" permanece deshabilitado

#### Escenario 13: Código válido pero error de red

- **GIVEN** el alumno está en el tab Alumno
- **WHEN** completa un código válido y presiona "Ingresar" pero no hay conexión
- **THEN** se muestra el mensaje "Error de conexión. Intentá de nuevo"
- **AND** el botón vuelve a su estado activo

### TAB ALUMNO — NOMBRE

#### Escenario 14: Ingreso de nombre válido

- **GIVEN** el alumno está en la pantalla de nombre (post-código válido) con el nombre de la sala visible
- **WHEN** ingresa un nombre de al menos 2 caracteres y presiona "Entrar a la grilla"
- **THEN** se crea el documento `rooms/{roomId}/responses/{anonymousUid}` con `studentName`, `occupiedBlocks: []` y `createdByUid`
- **AND** el alumno es redirigido a la grilla de bloques de la sala

#### Escenario 15: Nombre vacío o muy corto

- **GIVEN** el alumno está en la pantalla de nombre
- **WHEN** presiona "Entrar a la grilla" sin nombre o con menos de 2 caracteres
- **THEN** el campo muestra borde rojo y mensaje "El nombre debe tener al menos 2 caracteres"
- **AND** no se crea el documento en Firestore

#### Escenario 16: Persistencia — alumno vuelve a la sala

- **GIVEN** el alumno ya respondió previamente (tiene un documento en `rooms/{roomId}/responses/{uid}`)
- **WHEN** vuelve a ingresar el código de la misma sala
- **THEN** se le muestra la grilla con su respuesta anterior cargada
- **AND** no se le pide el nombre nuevamente

---

## Comportamiento Visual (UI/UX)

- **Tabs:** Dos tabs "Ayudante" | "Alumno" alineados horizontalmente debajo del logo. El tab activo tiene indicador visual (línea inferior de color brand). Al cambiar de tab, se oculta/muestra el formulario correspondiente sin recargar la página
- **Tab Ayudante:** Botón "Iniciar sesión" deshabilitado si email o password vacíos. Toggle de visibilidad en password
- **Tab Alumno - Código:** 6 celdas individuales de 44×54px. El foco salta automáticamente a la siguiente celda al escribir. Botón "Ingresar" deshabilitado hasta que las 6 celdas estén completas
- **Tab Alumno - Nombre:** Muestra el nombre de la sala como badge/confirmación. Campo "Tu nombre" con placeholder. Botón "Entrar a la grilla"
- **Nota de privacidad:** Texto pequeño "Tu nombre solo lo verá el ayudante" visible en la pantalla de nombre
- **Estados de carga:** Botón muestra spinner y se deshabilita durante operaciones asíncronas
- **Transiciones:** Al iniciar sesión → dashboard. Al ingresar código válido → pantalla de nombre. Al enviar nombre → grilla de bloques

---

## Definition of Done (DoD)

- [ ] La página `/acceso` renderiza los tabs "Ayudante" y "Alumno", con el default en Ayudante
- [ ] La URL refleja el tab activo (`/acceso` o `/acceso?tipo=alumno`)
- [ ] El tab Ayudante permite login con email + password con todas las validaciones
- [ ] Firebase Auth persiste la sesión al recargar; sesión activa redirige al dashboard
- [ ] El tab Alumno permite ingresar código de 6 caracteres con validación contra Firestore
- [ ] Al código válido, se crea sesión anónima y se avanza a la pantalla de nombre
- [ ] Al enviar nombre, se crea el documento de respuesta en Firestore
- [ ] Si el alumno vuelve, su respuesta anterior se recupera sin pedir nombre de nuevo
- [ ] Todos los estados de error muestran mensajes claros sin caídas de la app
- [ ] La HU cumple con los criterios de aceptación validados por QA
