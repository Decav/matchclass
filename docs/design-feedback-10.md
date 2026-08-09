# Feedback para Disenador — Iteracion 10: Landing Page

**De:** Jefe de Proyecto
**Para:** Disenador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Nueva pantalla: Landing Page Publica

Ruta: `/`. Es la pagina de inicio publica. No requiere autenticacion. Es lo primero que ve cualquier persona que llega a MatchClass.

Tiene dos objetivos:
1. **Explicar que es MatchClass** de forma clara y rapida
2. **Permitir ingresar un codigo de sala** directamente desde la landing

---

## Layout (Desktop, >= 1024px)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│           Logo MatchClass                            │
│           "Coordinacion de ayudantias                 │
│            sin friccion"                             │
│                                                      │
│           ┌─────────────────────┐                    │
│           │ Ingresa el codigo   │ [Entrar]           │
│           │ de tu sala          │                    │
│           └─────────────────────┘                    │
│                                                      │
│                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  📋 Crea una │ │  🔗 Comparte │ │  📊 Descubre  │  │
│  │  sala        │ │  el codigo   │ │  el mejor     │  │
│  │              │ │              │ │  horario      │  │
│  │  El ayudante │ │  Sin registro│ │  Heatmap con  │  │
│  │  crea la sala│ │  ni password │ │  colores y    │  │
│  │  en segundos │ │  para alumno │ │  ranking top3 │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                      │
│     ¿Sos ayudante?  [Inicia sesion]                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Elementos

### Header / Hero

| Elemento | Comportamiento |
|---|---|
| Logo MatchClass | En grande, centrado |
| Tagline | "Coordinacion de ayudantias sin friccion" o similar. Texto secundario debajo del logo |
| Campo de codigo | Input de texto centrado + boton "Entrar". Para que cualquier persona pueda ingresar directo a una sala |

### Seccion: Como funciona (3 cards)

| Card | Icono | Titulo | Texto |
|---|---|---|---|
| 1 | Calendar o Plus | "Crea una sala" | "El ayudante crea la sala en segundos y recibe un codigo unico" |
| 2 | Share o Link | "Comparte el codigo" | "Los alumnos ingresan sin registro ni contraseña" |
| 3 | BarChart o TrendingUp | "Descubre el mejor horario" | "Heatmap de colores y ranking top 3 de los mejores bloques" |

### Footer / CTA secundario

| Elemento | Comportamiento |
|---|---|
| Texto | "¿Sos ayudante?" |
| Link "Inicia sesion" | Navega a `/acceso` (tab Ayudante) |

## Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Pagina completa con todos los elementos |
| **Codigo invalido** | Borde rojo en el input + mensaje "Codigo invalido" (mismo comportamiento que el tab Alumno) |
| **Codigo valido** | Redirige a la grilla del alumno (flujo ya definido en HU-01) |

## Especificaciones

- **Desktop:** >= 1024px. Mobile postergado
- **Layout:** Sin sidebar ni topbar. Pagina centrada, ancho maximo 900-1000px
- **Fondo:** `$bg-page` (#FAFAF8) con posibilidad de un gradiente sutil en el hero
- **Paleta:** `docs/tech-document.md §6`
- **Tipografia:** Inter para todo el texto
- **Iconografia:** Lucide, trazo 2px
- **Idioma:** Espanol neutro, forma "tu" (`docs/estandar-idioma.md`)
- **Sin AppShell:** Esta pagina es publica, no tiene sidebar ni navegacion de usuario autenticado

## Lo que NO debe tener

- ❌ Sidebar, topbar
- ❌ Boton "Cerrar sesion" ni avatar de usuario
- ❌ Tabs (Ayudante/Alumno) — eso esta en `/acceso`
- ❌ Formularios de autenticacion (email/password)
- ❌ Datos de salas o respuestas reales

## Referencias

- RC-007: `docs/tech-document.md` (Pagina publica y dashboard)
- Flujo del alumno: `docs/hu-01-login-ayudante.md` (ingreso con codigo)
- Paleta: `docs/tech-document.md §6`
