# HU-03: Guard de rutas protegidas

**Proyecto:** MatchClass

**Epica:** Autenticacion de Ayudante

**Prioridad:** Alta

**Story Points:** 1

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** que las rutas privadas (dashboard, salas) solo sean accesibles si inicie sesion,

**para** que nadie sin autenticacion pueda ver mis datos ni gestionar salas.

---

## Descripcion / Contexto

Una vez que el ayudante inicia sesion (HU-01), su sesion persiste en IndexedDB via Firebase Auth. Al cerrar la app y volver a abrirla, o al navegar directamente a `/dashboard`, el sistema debe verificar si hay sesion activa antes de renderizar la pagina.

Si no hay sesion, redirige a `/acceso`. Si hay sesion, deja pasar.

Aplica a todas las rutas bajo `/dashboard/*`, `/salas/*`. Son publicas: `/acceso`, `/`, `/registro`, `/recuperar`.

---

## Especificaciones / Contrato

- **Verificacion de sesion:** Leer `useAuthStore.accessToken` o suscribirse a `onAuthStateChanged` de Firebase
- **Mecanismo:** Componente wrapper (guard) que envuelve las rutas hijas protegidas
- **Redireccion:** `<Navigate to="/acceso" replace />` — `replace` evita que el usuario vuelva atras con el boton de navegacion
- **Estado de carga:** Mientras Firebase restaura la sesion (primeros ms), mostrar un spinner/skeleton. No mostrar un flash de `/acceso`

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Usuario autenticado accede a ruta protegida

- **GIVEN** el ayudante tiene una sesion activa (esta logueado)
- **WHEN** navega a `/dashboard`
- **THEN** se renderiza el dashboard correctamente
- **AND** no se muestra la pagina de acceso en ningun momento

### Escenario 2: Usuario no autenticado accede a ruta protegida

- **GIVEN** el ayudante no tiene sesion activa
- **WHEN** navega a `/dashboard`
- **THEN** es redirigido automaticamente a `/acceso`
- **AND** la URL cambia a `/acceso`
- **AND** no puede volver a `/dashboard` con el boton "atras"

### Escenario 3: Rutas publicas siempre accesibles

- **GIVEN** un usuario no tiene sesion activa
- **WHEN** navega a `/acceso`, `/`, `/registro` o `/recuperar`
- **THEN** la pagina se renderiza sin redireccion
- **AND** puede ver el contenido sin restricciones

### Escenario 4: Carga inicial con sesion restaurandose

- **GIVEN** el ayudante abre la app y Firebase aun esta restaurando la sesion
- **WHEN** la app carga inicialmente
- **THEN** se muestra un spinner / pantalla de carga
- **AND** no se ve un flash de `/acceso` antes de la redireccion al dashboard

### Escenario 5: Cierre de sesion redirige al acceso

- **GIVEN** el ayudante esta en el dashboard con sesion activa
- **WHEN** cierra sesion (HU-04)
- **THEN** es redirigido a `/acceso`
- **AND** no puede navegar a `/dashboard` sin volver a autenticarse

---

## Comportamiento Visual (UI/UX)

- **Estados de carga:** Mientras Firebase restaura la sesion, mostrar un spinner centrado con el logo de MatchClass. No debe verse `/acceso` ni el dashboard durante esta transicion
- **Transicion:** La redireccion debe ser instantanea (sin animacion)

---

## Definition of Done (DoD)

- [ ] El guard cubre todas las rutas protegidas (`/dashboard/*`, `/salas/*`)
- [ ] Rutas publicas (`/`, `/acceso`, `/registro`, `/recuperar`) son accesibles sin autenticacion
- [ ] Mientras se restaura la sesion, se muestra un spinner en lugar de un flash de `/acceso`
- [ ] Al cerrar sesion, redirige a `/acceso` con `replace`
- [ ] La HU cumple con los criterios de aceptacion validados por QA
