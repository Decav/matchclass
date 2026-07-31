# HU-04: Cierre de sesion

**Proyecto:** MatchClass

**Epica:** Autenticacion de Ayudante

**Prioridad:** Alta

**Story Points:** 1

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** cerrar sesion desde el dashboard,

**para** proteger mi cuenta cuando termino de usar la plataforma.

---

## Descripcion / Contexto

El ayudante autenticado debe poder cerrar su sesion en cualquier momento. No es una pantalla nueva — es una accion disponible desde el dashboard (boton o icono de salir en el sidebar o topbar).

Al cerrar sesion:
1. Firebase Auth cierra la sesion (`signOut`)
2. El store de auth se limpia (`accessToken = null`, `user = null`)
3. El guard de rutas (HU-03) detecta que no hay sesion y redirige a `/acceso`

---

## Especificaciones / Contrato

- **Cierre de sesion:** Firebase Auth — `signOut(auth)`
- **Limpieza de store:** Resetear `useAuthStore` a estado inicial (`user: null`, `accessToken: null`, `status: 'unauthenticated'`)
- **Redireccion:** React Router — `<Navigate to="/acceso" replace />`
- **Ubicacion:** El boton de cerrar sesion debe estar visible en el dashboard, tipicamente en el sidebar o topbar. No requiere una pantalla de confirmacion

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Flujo feliz — cierre de sesion

- **GIVEN** el ayudante esta en el dashboard con sesion activa
- **WHEN** hace clic en "Cerrar sesion"
- **THEN** Firebase Auth ejecuta `signOut`
- **AND** el store de auth se limpia (`user: null`, `accessToken: null`)
- **AND** es redirigido a `/acceso`
- **AND** el tab "Ayudante" aparece con los campos limpios

### Escenario 2: No puede volver al dashboard

- **GIVEN** el ayudante cerro sesion y fue redirigido a `/acceso`
- **WHEN** intenta navegar manualmente a `/dashboard`
- **THEN** el guard de rutas lo redirige de nuevo a `/acceso`
- **AND** no puede acceder al contenido protegido

### Escenario 3: Persistencia del cierre de sesion

- **GIVEN** el ayudante cerro sesion
- **WHEN** recarga la pagina
- **THEN** sigue viendo `/acceso` sin sesion activa
- **AND** no se restaura automaticamente la sesion anterior

---

## Comportamiento Visual (UI/UX)

- **Ubicación:** Icono o boton de salir en el sidebar/topbar del dashboard. Texto "Cerrar sesion" o icono de Lucide (`LogOut`)
- **Sin confirmacion:** No se necesita un modal de confirmacion. La accion es inmediata
- **Transicion:** Redireccion instantanea a `/acceso`. Sin animacion

---

## Definition of Done (DoD)

- [ ] El boton de cerrar sesion esta visible en el dashboard
- [ ] Al hacer clic, Firebase Auth cierra la sesion y el store se limpia
- [ ] La redireccion a `/acceso` es inmediata
- [ ] Despues de cerrar sesion, las rutas protegidas no son accesibles
- [ ] La HU cumple con los criterios de aceptacion validados por QA
