# HU-13: Landing page publica

**Proyecto:** MatchClass

**Epica:** General

**Prioridad:** Media

**Story Points:** 3

---

## Narrativa (INVEST)

**Como** visitante,

**quiero** ver una pagina de inicio que explique que es MatchClass y me permita ingresar un codigo de sala,

**para** entender rapidamente de que se trata la plataforma y entrar directo a una sala si ya tengo un codigo.

---

## Descripcion / Contexto

La landing page (`/`) es la pagina de inicio publica. No requiere autenticacion. Es lo primero que ve cualquier persona.

Tiene dos objetivos:
1. Explicar que es MatchClass y como funciona (3 cards)
2. Permitir ingresar un codigo de sala directamente desde la landing

El campo de codigo redirige al flujo del alumno (tab Alumno en `/acceso`). El link "Inicia sesion" redirige a `/acceso` con el tab Ayudante activo.

---

## Especificaciones / Contrato

- **Sin autenticacion:** Ruta publica, accesible sin sesion
- **Redireccion de codigo:** Si el usuario ingresa un codigo valido en la landing, redirigir a `/acceso?tipo=alumno&codigo=XXX` para precargar el codigo en el tab Alumno
- **Redireccion de login:** El link "Inicia sesion" redirige a `/acceso`

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Carga de la landing

- **GIVEN** un visitante sin sesion
- **WHEN** navega a `/`
- **THEN** se muestra el logo de MatchClass
- **AND** se muestra el tagline "Coordinacion de ayudantias sin friccion"
- **AND** se muestra el campo de codigo con placeholder y boton "Entrar"
- **AND** se muestran las 3 cards de "Como funciona"
- **AND** se muestra el link "Inicia sesion" al pie

### Escenario 2: Ingreso de codigo valido desde la landing

- **GIVEN** el visitante esta en la landing
- **WHEN** ingresa un codigo de sala valido y presiona "Entrar"
- **THEN** es redirigido a `/acceso?tipo=alumno&codigo=EDS101`
- **AND** el tab Alumno queda activo con el codigo precargado

### Escenario 3: Codigo invalido desde la landing

- **GIVEN** el visitante esta en la landing
- **WHEN** ingresa un codigo que no existe y presiona "Entrar"
- **THEN** el campo muestra borde rojo y mensaje "Codigo invalido. Revisa con tu ayudante"

### Escenario 4: Acceso como ayudante desde la landing

- **GIVEN** el visitante esta en la landing
- **WHEN** presiona "Inicia sesion"
- **THEN** es redirigido a `/acceso`
- **AND** el tab "Ayudante" aparece activo

### Escenario 5: Ayudante con sesion activa

- **GIVEN** el ayudante ya tiene sesion activa
- **WHEN** navega a `/`
- **THEN** es redirigido automaticamente al dashboard (misma logica que HU-03)

---

## Comportamiento Visual (UI/UX)

- **Layout:** Pagina centrada, ancho maximo 1000px. Sin sidebar ni topbar. Fondo `$bg-page`
- **Hero:** Logo MC + titulo "MatchClass" + tagline + campo de codigo con boton "Entrar"
- **Cards:** 3 cards en fila con icono, titulo y descripcion: "Crea una sala", "Comparte el codigo", "Descubre el mejor horario"
- **Footer:** "¿Eres ayudante?" + link "Inicia sesion"
- **Prioridad desktop:** >= 1024px. Mobile postergado
- **Idioma:** Espanol neutro, forma "tu"

---

## Definition of Done (DoD)

- [ ] La landing page se renderiza en `/` sin autenticacion
- [ ] El campo de codigo valida contra Firestore y redirige a `/acceso` con query params
- [ ] El codigo invalido muestra error sin redirigir
- [ ] El link "Inicia sesion" redirige a `/acceso`
- [ ] Si hay sesion activa, redirige automaticamente al dashboard
- [ ] La interfaz sigue el diseno aprobado en `matchclass_design.pen` (frame `Landing Page`)
- [ ] La HU cumple con los criterios de aceptacion validados por QA
