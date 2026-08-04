# Feedback para Disenador — Iteracion 4: Dashboard del Ayudante

**De:** Jefe de Proyecto
**Para:** Disenador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Nueva pantalla: Dashboard del Ayudante

Ruta: `/dashboard`. Es la pantalla donde el ayudante cae despues de iniciar sesion. Es la **primera vista del area autenticada** e introduce el layout AppShell (sidebar + topbar) que se reutiliza en toda la seccion.

---

## Layout general (AppShell)

```
+------------------+------------------------------------------------+
|                  |  TOPBAR: [menu mobile]  [titulo]      [salir] |
|   SIDEBAR        +------------------------------------------------+
|   (280px, navy)  |                                                |
|                  |  CONTENT:                                       |
|   Logo           |                                                |
|   -------        |  Header: "Mis salas"  [+ Nueva sala]           |
|   Dashboard      |                                                |
|   Mis salas      |  Cards / lista de salas activas                |
|   (futuro)       |                                                |
|   (futuro)       |  Seccion salas pasadas                          |
|   -------        |                                                |
|   Usuario        |                                                |
|   [salir]        |                                                |
+------------------+------------------------------------------------+
```

## Elementos del layout

### Sidebar (siempre dark, 280px)

| Elemento | Comportamiento |
|---|---|
| Logo MatchClass | Arriba del sidebar, fondo navy |
| Item "Dashboard" | Activo por defecto. Icono + label |
| Item "Mis salas" | Navega a `/salas` (futuro) |
| Divisor | Separador visual |
| Info de usuario | Nombre + email del ayudante (de `users/{uid}`) |
| Boton "Cerrar sesion" | Icono `LogOut` + label. Acciona HU-04 |

### Topbar (64px, sticky)

| Elemento | Comportamiento |
|---|---|
| Boton menu (mobile) | Visible solo en < 1024px (postergado) |
| Titulo de seccion | "Dashboard" o el contexto actual |
| Toggle dark/light | Icono sol/luna (futuro, RC-008) |

### Content area

| Elemento | Comportamiento |
|---|---|
| Header "Mis salas" | Titulo de la seccion principal |
| Boton "+ Nueva sala" | Accion primaria, abre el flujo de creacion (HU-06, futura) |
| Stats cards (opcional) | 2-3 KPIs: total salas, respuestas recibidas, salas activas |
| Lista de salas activas | Cards con nombre, codigo, cantidad de respuestas, estado |
| Seccion "Salas pasadas" | Salas cerradas, mas compactas |

## Cards de sala (referencia)

Cada sala activa se muestra como una card con:

| Campo | Descripcion |
|---|---|
| Nombre de la sala | "Estructuras de Datos · Secc 1" |
| Codigo corto | "EDS101" (en JetBrains Mono) |
| Respuestas | "12/30 alumnos respondieron" |
| Estado | Badge "Activa" / "Cerrada" |
| Acciones | Abrir / copiar codigo / cerrar |

## Estados

| Estado | Comportamiento |
|---|---|
| **Cargando** | Skeletons de las cards mientras cargan las salas |
| **Sin salas** | Empty state: icono + "Aun no tienes salas" + boton "Crear primera sala" |
| **Con salas** | Cards en grid (responsive) |
| **Error** | Error alert + boton "Intentar de nuevo" |

## Especificaciones

- **Prioridad desktop:** Disenar solo para >= 1024px. Mobile postergado
- **Paleta:** Sidebar usa `$brand-primary` (#1B2A4A) de fondo. Ver `docs/tech-document.md §6`
- **Tipografia:** Inter para textos, JetBrains Mono para codigo y numeros
- **Iconografia:** Lucide, trazo 2px, 22px default
- **Idioma:** Espanol neutro, forma "tu" (`docs/estandar-idioma.md`)

## Referencias

- HU-04: `docs/hu-04-cierre-sesion.md` (boton salir en el sidebar/topbar)
- HU-08: `docs/tech-document.md` RC-004 (listar salas)
- RC-007: `docs/tech-document.md` (dashboard con resumen)
- Patron de sidebar/topbar ya definido en el Design System
