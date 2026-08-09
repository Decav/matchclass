# Feedback para Disenador — Iteracion 9: Resultados (Heatmap + Ranking)

**De:** Jefe de Proyecto
**Para:** Disenador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Nueva pantalla: Resultados de la Sala

El ayudante accede desde la card de una sala en el dashboard (accion "Abrir"). Es una pantalla dentro del AppShell (sidebar + topbar) que muestra dos cosas:

1. **Heatmap:** grilla de 50 celdas coloreadas segun disponibilidad
2. **Ranking:** top 3 slots con mejor porcentaje

---

## Layout

```
[Sidebar] | [Topbar: "Estructuras de Datos · Secc 1"]
          |
          |  [Pestaña: Resultados]  [Pestaña: Respuestas]
          |
          |  ┌───────────────┐  ┌─────────────────────┐
          |  │   HEATMAP     │  │   TOP 3             │
          |  │                │  │                      │
          |  │  Lun Mar Mie.. │  │  #1  Martes 9-10    │
          |  │  ██  ░░  ██   │  │      14:40 - 15:50  │
          |  │  ░░  ██  ░░   │  │      32/35 (91%)    │
          |  │  ...          │  │                      │
          |  │                │  │  #2  Jueves 11-12   │
          |  │  Leyenda       │  │      16:15 - 17:15  │
          |  └───────────────┘  │      29/35 (83%)    │
          |                      │                      │
          |                      │  #3  Viernes 5-6    │
          |                      │      11:05 - 12:15  │
          |                      │      28/35 (80%)    │
          |                      └─────────────────────┘
```

### Seccion: Heatmap

| Elemento | Comportamiento |
|---|---|
| Cabecera de dias | Lun-Vie, 5 columnas |
| Columna de horarios | JetBrains Mono, horarios USM |
| 50 celdas coloreadas | Cada celda muestra porcentaje numerico |
| Leyenda | 5 colores con su significado |
| Total de respuestas | "35 alumnos respondieron" |

**Colores por celda:**

| Estado | Color | Threshold |
|---|---|---|
| `high` | `$heatmap-high` (#10B981) verde | ≥ 70% |
| `medium` | `$heatmap-medium` (#FBBF24) ambar | 40% – 69% |
| `low` | `$heatmap-low` (#F97316) naranja | 10% – 39% |
| `conflict` | `$heatmap-conflict` (#EF4444) rojo | < 10% |
| `blocked` | `$heatmap-blocked` (#6B7280) gris | Restriccion del ayudante |

Cada celda debe mostrar el porcentaje como texto (accesibilidad — el color por si solo no comunica el nivel).

### Seccion: Ranking Top 3

| Elemento | Comportamiento |
|---|---|
| Numero de ranking | Badge circular: #1, #2, #3 |
| Dia + bloque | "Martes 9-10" |
| Horario | "14:40 – 15:50" |
| Badge de porcentaje | "91%" con color del heatmap |
| Total disponible | "32/35 alumnos" |

## Pestaña: Respuestas (futuro)

Dejar espacio para una segunda pestana "Respuestas" que mostraria la lista de alumnos que respondieron (nombre + bloques marcados). No disenar ahora, solo dejar el tab visible pero deshabilitado o gris.

## Estados

| Estado | Comportamiento |
|---|---|
| **Cargando** | Skeletons del heatmap y ranking |
| **Con datos** | Heatmap coloreado + ranking top 3 |
| **Sin respuestas** | Empty state: "Nadie respondio todavia. Comparti el codigo de la sala con tus alumnos." |
| **Error** | Error alert + boton "Intentar de nuevo" |

## Especificaciones

- **Layout:** AppShell (sidebar + topbar). Contenido en dos columnas o apilado segun espacio. Heatmap a la izquierda, ranking a la derecha
- **Grilla del heatmap:** Mismas dimensiones que `Configurar Mis Bloques` — 10 filas x 5 columnas
- **Componentes existentes:** `Heatmap Component` y `Top 3 Card` en el Design System pueden reutilizarse con adaptaciones
- **Desktop:** >= 1024px. Mobile postergado
- **Paleta:** `docs/tech-document.md §6`
- **Idioma:** Espanol neutro, forma "tu"

## Ojo con el Heatmap Component

El `Heatmap Component` actual tiene solo 4 filas. Debe actualizarse a **10 filas** (como se hizo con `Configurar Mis Bloques`).

## Referencias

- `Configurar Mis Bloques` (estructura de grilla base)
- `Heatmap Component` y `Top 3 Card` en el Design System
- RC-006: `docs/tech-document.md`
