# HU-01: Inicio de sesión del ayudante

**Proyecto:** MatchClass

**Épica:** Autenticación de Ayudante

**Prioridad:** Alta

**Story Points:** 3

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** iniciar sesión con mi email y contraseña,

**para** acceder al dashboard y gestionar mis salas de coordinación.

---

## Descripción / Contexto

Primera pantalla que ve el ayudante si no tiene una sesión activa. Es la puerta de entrada a toda la plataforma. El ayudante ya está registrado (HU-02 cubre el registro).

Firebase Auth maneja la autenticación y la persistencia de sesión en IndexedDB. Si el ayudante ya tiene sesión activa al cargar la app, debe ser redirigido automáticamente al dashboard sin pasar por esta pantalla.

---

## Especificaciones / Contrato

- **Autenticación:** Firebase Auth — `signInWithEmailAndPassword(email, password)`
- **Almacenamiento de sesión:** Firebase Auth persiste en IndexedDB por defecto. No implementar almacenamiento adicional.
- **Lectura de datos del usuario:** Al iniciar sesión, leer el documento `users/{uid}` en Firestore para obtener `displayName` y `role`.

---

## Criterios de Aceptación (Gherkin)

### Escenario 1: Flujo feliz — credenciales válidas

- **GIVEN** el ayudante está en la pantalla de login con los campos email y password vacíos
- **WHEN** ingresa un email y contraseña válidos y presiona "Iniciar sesión"
- **THEN** el botón muestra un spinner y los campos se deshabilitan
- **AND** Firebase Auth valida las credenciales
- **AND** se lee el documento `users/{uid}` desde Firestore
- **AND** el ayudante es redirigido al dashboard

### Escenario 2: Credenciales inválidas

- **GIVEN** el ayudante está en la pantalla de login
- **WHEN** ingresa un email o contraseña incorrectos y presiona "Iniciar sesión"
- **THEN** se muestra un mensaje de error "Email o contraseña incorrectos" sobre el formulario
- **AND** los campos mantienen los valores ingresados (no se limpian)
- **AND** el botón vuelve a su estado activo

### Escenario 3: Error de red

- **GIVEN** el ayudante está en la pantalla de login
- **WHEN** ingresa credenciales válidas pero no hay conexión
- **THEN** se muestra un mensaje "Error de conexión. Intentá de nuevo"
- **AND** el botón vuelve a su estado activo

### Escenario 4: Validación de campos vacíos

- **GIVEN** el ayudante está en la pantalla de login
- **WHEN** presiona "Iniciar sesión" sin completar email o password
- **THEN** el campo vacío muestra borde rojo y mensaje "Este campo es obligatorio"
- **AND** no se ejecuta la llamada a Firebase

### Escenario 5: Sesión activa al cargar la app

- **GIVEN** el ayudante ya inició sesión previamente (sesión persistente en IndexedDB)
- **WHEN** abre la aplicación
- **THEN** es redirigido automáticamente al dashboard sin ver la pantalla de login

### Escenario 6: Formato de email inválido

- **GIVEN** el ayudante está en la pantalla de login
- **WHEN** ingresa un texto sin formato de email (ej: "hola") en el campo email
- **THEN** se muestra el mensaje "Ingresá un email válido"
- **AND** el botón permanece deshabilitado

---

## Comportamiento Visual (UI/UX)

- **Controles:** Botón "Iniciar sesión" deshabilitado si email o password están vacíos. Toggle de visibilidad en el campo password (ojo abierto/cerrado)
- **Estados de carga:** Botón muestra spinner y se deshabilita. Campos se deshabilitan para evitar doble envío
- **Transición:** Al iniciar sesión correctamente, redirigir al dashboard sin animación bloqueante (máx 1.5s de transición)

---

## Definition of Done (DoD)

- [ ] La interfaz se adapta a desktop y mobile según las instrucciones del diseñador en `docs/design-instrucciones.md`
- [ ] Las validaciones de campos vacíos y formato email bloquean el envío
- [ ] Los estados de error (credenciales inválidas, error de red) muestran mensajes claros sin caídas
- [ ] Firebase Auth está correctamente integrado y la sesión persiste al recargar
- [ ] La HU cumple con los criterios de aceptación validados por QA
