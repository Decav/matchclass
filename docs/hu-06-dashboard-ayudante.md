# HU-06: Dashboard del ayudante

**Proyecto:** MatchClass

**Epica:** Gestion de Salas / Dashboard

**Prioridad:** Alta

**Story Points:** 5

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** ver un dashboard con mis salas de coordinacion, estadisticas y acceso rapido a cada una,

**para** gestionar de un vistazo el estado de mis ayudantias.

---

## Descripcion / Contexto

Es la pantalla donde el ayudante cae despues de iniciar sesion (ruta `/dashboard`). Introduce el **AppShell** (sidebar + topbar) que se reutiliza en toda el area autenticada.

Muestra:
- KPIs: salas totales, respuestas recibidas, salas activas
- Lista de salas activas (cards con nombre, codigo, progreso de respuestas, acciones)
- Lista de salas pasadas (compactas, con badge "Cerrada")
- Acceso al flujo de "Nueva sala" (HU-07)
- Cierre de sesion en el sidebar (HU-04)

El guard de rutas (HU-03) protege esta ruta: sin sesion activa redirige a `/acceso`.

---

## Especificaciones / Contrato

- **Consulta de salas:** Firestore — `getDocs(collection(db, 'rooms'))` filtrado por `createdBy == currentUser.uid`
- **Orden:** Salas activas primero (por `createdAt` DESC), luego las cerradas
- **KPIs:**
  - Salas totales: cantidad de salas del ayudante
  - Respuestas recibidas: suma de respuestas de todas las salas
  - Salas activas: cantidad con `status: 'active'`
- **Datos por card de sala:** `name`, `code`, cantidad de respuestas (count de subcoleccion), `status`, `createdAt`
- **Avatar del usuario:** Inicial del `displayName` desde `users/{uid}`

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Dashboard con salas activas y pasadas

- **GIVEN** el ayudante tiene sesion activa y posee salas en Firestore
- **WHEN** navega a `/dashboard`
- **THEN** se muestran los KPIs (salas totales, respuestas, activas) con los valores reales
- **AND** se listan las salas activas con nombre, codigo, respuestas y estado "Activa"
- **AND** se listan las salas pasadas con badge "Cerrada"
- **AND** el sidebar muestra el nombre, email e inicial del ayudante

### Escenario 2: Dashboard sin salas (empty state)

- **GIVEN** el ayudante tiene sesion activa pero no posee salas
- **WHEN** navega a `/dashboard`
- **THEN** se muestra el empty state con "Aun no tienes salas"
- **AND** se muestra un boton "Crear primera sala"

### Escenario 3: Dashboard cargando (skeletons)

- **GIVEN** el ayudante navega a `/dashboard`
- **WHEN** las salas aun se estan cargando desde Firestore
- **THEN** se muestran skeletons en lugar de las cards y los KPIs
- **AND** el sidebar y topbar se renderizan normalmente

### Escenario 4: Dashboard con error de carga

- **GIVEN** el ayudante navega a `/dashboard`
- **WHEN** la consulta a Firestore falla
- **THEN** se muestra el estado de error con mensaje y boton "Intentar de nuevo"
- **AND** al presionar el boton, se reintenta la consulta

### Escenario 5: Acceso al flujo de nueva sala

- **GIVEN** el ayudante esta en el dashboard
- **WHEN** presiona "Nueva sala" o "Crear primera sala"
- **THEN** es redirigido al flujo de creacion de sala (HU-07)

### Escenario 6: Cierre de sesion desde el sidebar

- **GIVEN** el ayudante esta en el dashboard
- **WHEN** presiona "Cerrar sesion" en el sidebar
- **THEN** se ejecuta el logout (HU-04)
- **AND** es redirigido a `/acceso`

### Escenario 7: Sin sesion activa

- **GIVEN** el ayudante no tiene sesion activa
- **WHEN** navega a `/dashboard`
- **THEN** el guard de rutas lo redirige a `/acceso`

---

## Comportamiento Visual (UI/UX)

- **Layout AppShell:** Sidebar de 280px fijo a la izquierda (fondo navy), topbar de 64px sticky arriba, area de contenido con el resto del espacio
- **Sidebar:** Logo, navegacion (Dashboard activo, Mis salas), usuario con avatar + nombre + email, boton "Cerrar sesion" al pie
- **KPIs:** Cards con valor grande en JetBrains Mono y label en Inter
- **Cards de sala activa:** Nombre, badge de estado, codigo en JetBrains Mono, contador de respuestas, barra de progreso, acciones "Abrir" y "Copiar codigo"
- **Salas pasadas:** Lista mas compacta con badge "Cerrada"
- **Estados de carga:** Skeletons de los KPIs y las cards
- **Empty state:** Icono + "Aun no tienes salas" + boton "Crear primera sala"
- **Error:** Card de error con mensaje y boton "Intentar de nuevo"
- **Prioridad desktop:** >= 1024px. Mobile postergado
- **Idioma:** Espanol neutro, forma "tu"

---

## Definition of Done (DoD)

- [ ] El AppShell (sidebar + topbar) se renderiza con el usuario autenticado
- [ ] Los KPIs muestran valores reales desde Firestore
- [ ] Las salas activas y pasadas se listan con sus datos
- [ ] El empty state, los skeletons y el estado de error funcionan correctamente
- [ ] El boton de cerrar sesion ejecuta el logout y redirige a `/acceso`
- [ ] El guard de rutas protege `/dashboard`
- [ ] La interfaz sigue el diseno aprobado en `matchclass_design.pen`
- [ ] La HU cumple con los criterios de aceptacion validados por QA
