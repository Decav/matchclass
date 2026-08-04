# HU-05: Recuperar contrasena

**Proyecto:** MatchClass

**Epica:** Autenticacion de Ayudante

**Prioridad:** Media

**Story Points:** 2

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** recuperar mi contrasena con un link enviado a mi email,

**para** poder volver a acceder a mi cuenta si la olvide.

---

## Descripcion / Contexto

El ayudante que olvido su contrasena llega desde el link "Olvidaste tu contrasena?" del tab Ayudante en `/acceso`. La pagina `/recuperar` tiene dos estados:

1. **Ingreso de email:** El ayudante ingresa su email y el sistema envia un link de restablecimiento.
2. **Confirmacion:** Independientemente de si el email existe o no, se muestra el mensaje generico "Revisa tu email" para no revelar que emails estan registrados (seguridad por no-verificacion).

Firebase Auth maneja el envio del email con `sendPasswordResetEmail`. No hay restablecimiento dentro de la app — el usuario completa el cambio desde el email de Firebase.

---

## Especificaciones / Contrato

- **Envio de email:** Firebase Auth — `sendPasswordResetEmail(auth, email)`
- **Estado 2 (confirmacion):** Siempre muestra el mismo mensaje, haya o no cuenta con ese email. No exponer si el email existe
- **Redireccion:** El link "Volver a inicio de sesion" regresa a `/acceso`

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Flujo feliz — email valido

- **GIVEN** el ayudante esta en `/recuperar` con el campo email vacio
- **WHEN** ingresa un email valido y presiona "Enviar link"
- **THEN** el boton muestra un spinner y el campo se deshabilita
- **AND** Firebase Auth envia el email de restablecimiento
- **AND** se muestra el estado de confirmacion "Revisa tu email"

### Escenario 2: Email no registrado (respuesta generica)

- **GIVEN** el ayudante esta en `/recuperar`
- **WHEN** ingresa un email que no tiene cuenta y presiona "Enviar link"
- **THEN** se muestra el mismo estado de confirmacion "Revisa tu email"
- **AND** el sistema no revela si el email existe o no

### Escenario 3: Email invalido

- **GIVEN** el ayudante esta en `/recuperar`
- **WHEN** ingresa un texto sin formato de email (ej: "hola")
- **THEN** el campo muestra borde rojo y mensaje "Ingresa un email valido"
- **AND** el boton permanece deshabilitado

### Escenario 4: Campo vacio

- **GIVEN** el ayudante esta en `/recuperar`
- **WHEN** presiona "Enviar link" con el email vacio
- **THEN** el campo muestra borde rojo y mensaje "Este campo es obligatorio"
- **AND** no se ejecuta la llamada a Firebase

### Escenario 5: Error de red

- **GIVEN** el ayudante esta en `/recuperar`
- **WHEN** ingresa un email valido y presiona "Enviar link" pero no hay conexion
- **THEN** se muestra el mensaje "Error de conexion. Intenta de nuevo"
- **AND** el boton vuelve a su estado activo

### Escenario 6: Volver al inicio de sesion

- **GIVEN** el ayudante esta en el estado de confirmacion
- **WHEN** presiona "Volver al inicio"
- **THEN** es redirigido a `/acceso`
- **AND** el tab "Ayudante" aparece activo

---

## Comportamiento Visual (UI/UX)

- **Patron visual:** Card centrado con ancho maximo 400px, fondo `$bg-page`. Sin tabs, sin sidebar. Prioridad desktop
- **Estado 1:** Titulo "Recupera tu contrasena", subtitulo "Te enviaremos un link para restablecerla", campo email, boton "Enviar link", link "Volver a inicio de sesion"
- **Estado 2:** Icono de email en circulo, titulo "Revisa tu email", mensaje informativo, boton "Volver al inicio"
- **Estados de carga:** Boton muestra spinner y se deshabilita durante el envio
- **Transicion:** Al enviar el email, pasar del estado 1 al estado 2 dentro de la misma pagina

---

## Definition of Done (DoD)

- [ ] La pagina `/recuperar` muestra el formulario de email y el estado de confirmacion
- [ ] El boton se deshabilita con campo vacio o email invalido
- [ ] El envio de email funciona via Firebase Auth
- [ ] El estado de confirmacion es generico (no revela si el email existe)
- [ ] Los estados de error muestran mensajes claros sin caidas de la app
- [ ] La HU cumple con los criterios de aceptacion validados por QA
