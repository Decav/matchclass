# HU-17: Diseño responsive mobile

**Proyecto:** MatchClass

**Epica:** General

**Prioridad:** Alta

**Story Points:** 5

---

## Narrativa (INVEST)

**Como** usuario,

**quiero** que la plataforma sea usable desde mi celular o tablet,

**para** poder crear salas, responder disponibilidad y ver resultados sin necesidad de una computadora.

---

## Descripcion / Contexto

Hasta ahora todas las pantallas se diseñaron y desarrollaron para desktop (>= 1024px). El feedback del proyecto desplegado en `matchclass.web.app` indica que la experiencia en mobile esta rota:

1. La landing page no se adapta — las cards se desbordan y los textos no envuelven
2. Las grillas de 50 celdas (bloques del ayudante, grilla del alumno, heatmap) son imposibles de usar en pantallas chicas
3. El sidebar del AppShell ocupa toda la pantalla y bloquea el contenido

Esta HU cubre la adaptacion mobile de todas las pantallas existentes, priorizando lo que mas afecta al usuario final.

---

## Alcance por pantalla

### Landing page

| Adaptacion | Descripcion |
|---|---|
| Hero | Logo + tagline centrados, campo de codigo a ancho completo |
| Cards "Como funciona" | Apilar verticalmente en vez de fila horizontal |
| Footer | Centrado, texto ajustado |

### Pagina de acceso (`/acceso`)

| Adaptacion | Descripcion |
|---|---|
| Card | Ocupa ancho completo con padding 16px |
| Tabs | Mantener horizontales, texto reducido si es necesario |
| Codigo alumno | 6 celdas mantienen 44x54px, reducir gap si no entran |

### Paginas de auth (`/registro`, `/recuperar`)

| Adaptacion | Descripcion |
|---|---|
| Card | Mismo patron que acceso: ancho completo, padding 16px |

### Dashboard y pantallas con AppShell

| Adaptacion | Descripcion |
|---|---|
| Sidebar | Oculto por defecto en mobile, se abre con boton hamburguesa en el topbar, overlay sobre el contenido |
| Topbar | Visible siempre, incluye boton de menu |
| KPIs | Apilar verticalmente o reducir a 2 columnas |
| Cards de sala | Ocupar ancho completo, una por fila |

### Grillas de 50 celdas (bloques ayudante, alumno, heatmap)

| Adaptacion | Descripcion |
|---|---|
| Scroll horizontal | La grilla mantiene sus dimensiones y el contenedor permite scroll horizontal en mobile |
| Indicador de scroll | Sombra o gradiente en el borde para indicar que hay mas contenido |
| Header fijo | Los dias de la semana quedan fijos al hacer scroll |
| Columna de horarios | Fija al hacer scroll horizontal |

### Resultados (heatmap + ranking)

| Adaptacion | Descripcion |
|---|---|
| Columnas | Apilar: ranking arriba, heatmap abajo. Lo primero que ve el ayudante es la respuesta que busca |
| Leyenda | Reducir o colapsar |

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Landing page en mobile

- **GIVEN** un visitante abre `matchclass.web.app` desde un celular (< 768px)
- **WHEN** la landing page carga
- **THEN** el logo y tagline estan centrados y no se desbordan
- **AND** el campo de codigo ocupa todo el ancho disponible
- **AND** las 3 cards de "Como funciona" se apilan verticalmente sin desbordarse
- **AND** no aparece scroll horizontal indeseado

### Escenario 2: Pagina de acceso en mobile

- **GIVEN** un usuario abre `/acceso` desde un celular
- **WHEN** la pagina carga
- **THEN** el card de acceso ocupa el ancho completo con padding adecuado
- **AND** los tabs "Ayudante" | "Alumno" son visibles y funcionales
- **AND** los inputs y botones tienen tamaño tactil adecuado (>= 44px)

### Escenario 3: Grilla de 50 celdas en mobile

- **GIVEN** un alumno o ayudante esta en una pantalla con grilla de 50 celdas desde un celular
- **WHEN** la grilla se renderiza
- **THEN** el contenedor permite scroll horizontal para ver las 5 columnas de dias
- **AND** las celdas mantienen su tamaño (no se comprimen hasta ser inusables)
- **AND** la columna de horarios permanece visible al hacer scroll
- **AND** un indicador visual sugiere que hay mas contenido a la derecha

### Escenario 4: AppShell con sidebar en mobile

- **GIVEN** el ayudante esta en el dashboard desde un celular
- **THEN** el sidebar esta oculto por defecto
- **AND** el topbar muestra un boton de menu (hamburguesa)
- **WHEN** presiona el boton de menu
- **THEN** el sidebar se despliega como overlay con fondo semi-transparente sobre el contenido
- **AND** los botones del menu (Dashboard, Mis salas, Cerrar sesion) son funcionales y responden al toque
- **AND** al tocar un item del menu, el sidebar se cierra y navega correctamente
- **AND** al tocar el overlay fuera del sidebar, el sidebar se cierra
- **AND** el sidebar tiene mayor z-index que el overlay — los toques sobre los items del menu no son capturados por la capa de fondo

### Escenario 5: Dashboard en mobile

- **GIVEN** el ayudante esta en el dashboard desde un celular
- **WHEN** la pagina carga
- **THEN** los KPIs se apilan o reducen para caber sin desbordar
- **AND** las cards de sala ocupan el ancho completo, una por fila
- **AND** el boton "Nueva sala" es accesible y visible

### Escenario 6: Areas tactiles minimas

- **GIVEN** cualquier pantalla en mobile
- **THEN** todos los elementos interactivos (botones, celdas de grilla, tabs, links) tienen un area tactil de al menos 44x44px
- **AND** los elementos no se superponen ni quedan inaccesibles

---

## Comportamiento Visual (UI/UX)

- **Breakpoints:** Sidebar fijo desde 1024px (tablet estrecha no tiene sidebar fijo). Reflow de contenido desde 768px
- **Sidebar:** Overlay con fondo semi-transparente, animacion de deslizamiento desde la izquierda, z-index sobre el contenido
- **Grillas:** Scroll horizontal nativo. Sombra o gradiente en el borde derecho como affordance. Header de dias sticky
- **Cards:** Full-width, sin margenes laterales desperdiciados
- **Tipografia:** Sin cambios — Inter y JetBrains Mono mantienen sus tamanos
- **Colores:** Sin cambios — la paleta es la misma
- **Sin diseno de referencia:** `matchclass_design.pen` no tiene frames mobile — todas las HU anteriores declararon "Mobile postergado". Esta HU es **adaptacion de implementacion**, no replica de un diseno: las reglas de esta seccion y la tabla de "Alcance por pantalla" son el contrato visual

---

## Definition of Done (DoD)

- [ ] La landing page se ve correctamente en viewport de 375px (iPhone SE) sin scroll horizontal
- [ ] Las grillas de 50 celdas tienen scroll horizontal funcional en mobile
- [ ] Sidebar mobile: z-index del sidebar por encima del overlay. Los items del menu son funcionales y responden al toque
- [ ] Todas las pantallas de auth (acceso, registro, recuperar) se adaptan a mobile
- [ ] El dashboard y las pantallas internas se adaptan a mobile
- [ ] Los elementos interactivos cumplen area tactil minima de 44x44px
- [ ] No hay scroll horizontal indeseado en ninguna pantalla
- [ ] Los escenarios estan cubiertos por un spec E2E propio de mobile (viewport 375x667), sin duplicar la suite desktop existente
- [ ] La HU cumple con los criterios de aceptacion validados por QA
