# HU-02: Registro de ayudante

**Proyecto:** MatchClass

**Épica:** Autenticación de Ayudante

**Prioridad:** Alta

**Story Points:** 3

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** registrarme con mi email y una contraseña,

**para** crear una cuenta y poder gestionar salas de coordinación.

---

## Descripción / Contexto

El ayudante nuevo llega desde la pantalla de login a través del link "Registrarse". Completar el registro crea la cuenta en Firebase Auth y, simultáneamente, un documento `users/{uid}` en Firestore con su información básica y rol `helper`.

Esta HU no maneja inicio de sesión automático post-registro — si Firebase Auth lo hace por defecto, se aprovecha.

---

## Especificaciones / Contrato

- **Creación de cuenta:** Firebase Auth — `createUserWithEmailAndPassword(email, password)`
- **Documento en Firestore:** Al registrarse, crear `users/{uid}` con `displayName`, `email`, `role: helper` y `createdAt`
- **Rol por defecto:** `helper`. El registro no permite elegir rol.
- **Redirección post-registro:** Al dashboard (misma lógica que login)

---

## Criterios de Aceptación (Gherkin)

### Escenario 1: Flujo feliz — registro exitoso

- **GIVEN** el ayudante está en la pantalla de registro con los campos vacíos
- **WHEN** completa nombre, email y contraseña, y presiona "Crear cuenta"
- **THEN** el botón muestra un spinner y los campos se deshabilitan
- **AND** Firebase Auth crea la cuenta con email y contraseña
- **AND** se crea el documento `users/{uid}` en Firestore con `displayName`, `email`, `role: helper` y `createdAt`
- **AND** el ayudante es redirigido al dashboard

### Escenario 2: Email ya registrado

- **GIVEN** el ayudante está en la pantalla de registro
- **WHEN** ingresa un email que ya tiene una cuenta y presiona "Crear cuenta"
- **THEN** se muestra el mensaje "Este email ya está registrado. Iniciá sesión"
- **AND** el botón vuelve a su estado activo

### Escenario 3: Contraseña débil

- **GIVEN** el ayudante está en la pantalla de registro
- **WHEN** ingresa una contraseña de menos de 6 caracteres
- **THEN** se muestra el mensaje "La contraseña debe tener al menos 6 caracteres"
- **AND** el botón permanece deshabilitado

### Escenario 4: Validación de campos vacíos

- **GIVEN** el ayudante está en la pantalla de registro
- **WHEN** presiona "Crear cuenta" sin completar nombre, email o contraseña
- **THEN** los campos vacíos muestran borde rojo y mensaje "Este campo es obligatorio"
- **AND** no se ejecuta la llamada a Firebase

### Escenario 5: Confirmación de contraseña no coincide

- **GIVEN** el ayudante está en la pantalla de registro
- **WHEN** ingresa una contraseña en "Contraseña" y una distinta en "Confirmar contraseña"
- **THEN** se muestra el mensaje "Las contraseñas no coinciden"
- **AND** el botón permanece deshabilitado

### Escenario 6: Error de red

- **GIVEN** el ayudante está en la pantalla de registro
- **WHEN** completa los campos válidos pero no hay conexión
- **THEN** se muestra el mensaje "Error de conexión. Intentá de nuevo"
- **AND** el botón vuelve a su estado activo

---

## Comportamiento Visual (UI/UX)

- **Controles:** Botón "Crear cuenta" deshabilitado si algún campo obligatorio está vacío. Campo "Confirmar contraseña" con toggle de visibilidad al igual que el campo contraseña. Link "Ya tengo cuenta" que vuelve al login
- **Estados de carga:** Botón muestra spinner y se deshabilita. Campos se deshabilitan para evitar doble envío
- **Transición:** Al registrarse correctamente, redirigir al dashboard. Misma transición que login

---

## Definition of Done (DoD)

- [ ] La interfaz se adapta a desktop y mobile siguiendo el mismo patrón visual que el login
- [ ] Las validaciones bloquean el envío si hay campos vacíos, email inválido, contraseña débil o confirmación no coincide
- [ ] Al registrarse, el documento `users/{uid}` en Firestore se crea correctamente con todos los campos requeridos
- [ ] Los estados de error muestran mensajes claros sin caídas de la app
- [ ] La HU cumple con los criterios de aceptación validados por QA
