# Feedback para Disenador — Iteracion 6: Configurar Restricciones del Ayudante

**De:** Jefe de Proyecto
**Para:** Disenador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Nueva pantalla: Configurar mis bloques

Se llega desde el boton "Configurar mis bloques" en la confirmacion de creacion de sala. Tambien se puede acceder desde la card de una sala existente en el dashboard.

Es una pantalla dentro del AppShell (sidebar + topbar) donde el ayudante marca los bloques horarios donde **tiene clase y NO puede dictar ayudantia**. Es el mismo principio de inversion de carga que el alumno: marcar ocupados, no libres.

---

## Layout

```
[Sidebar] | [Topbar: "Mis bloques"]
          |
          |  "Configura tus bloques ocupados"
          |  "Marca los bloques donde tienes clase. El sistema
          |   los excluira automaticamente del calculo."
          |
          |   ┌──────┬────────┬────────┬────────┬────────┬────────┐
          |   │      │  Lun   │  Mar   │  Mie   │  Jue   │  Vie   │
          |   ├──────┼────────┼────────┼────────┼────────┼────────┤
          |   │08:15-│  [ ]   │  [ ]   │  [ ]   │  [ ]   │  [ ]   │
          |   │09:25 │        │        │        │        │        │
          |   ├──────┼────────┼────────┼────────┼────────┼────────┤
          |   │09:40-│  [ ]   │  [X]   │  [ ]   │  [X]   │  [ ]   │
          |   │10:50 │        │        │        │        │        │
          |   ├──────┼────────┼────────┼────────┼────────┼────────┤
          |   │ ...  │  ...   │  ...   │  ...   │  ...   │  ...   │
          |   └──────┴────────┴────────┴────────┴────────┴────────┘
          |
          |   Leyenda:  [ ] Libre / disponible   [X] Ocupado (tengo clase)
          |
          |   [Guardar cambios]  [Omitir]
```

## Elementos

| Elemento | Comportamiento |
|---|---|
| Topbar | Titulo "Mis bloques" |
| Titulo | "Configura tus bloques ocupados" |
| Subtitulo | Texto explicativo sobre la inversion de carga y la privacidad |
| Grilla de 20 bloques | 5 columnas (Lun-Vie) x 4 filas (bloques diurnos). Cada celda es un toggle: tap para marcar/desmarcar. Estado `$grid-resting` o `$grid-occupied` |
| Leyenda | Iconos/colores: libre vs ocupado |
| Boton "Guardar cambios" | Boton primario. Deshabilitado si no hubo cambios |
| Boton "Omitir" | Boton secundario/ghost. Guarda sin restricciones y vuelve |
| Nota de privacidad | Texto pequeno "Esta informacion es privada. Tus alumnos no veran tus bloques ocupados, solo se usan para filtrar los resultados." |

## Estados de celda

| Estado | Visual |
|---|---|
| **Libre** (no marcado) | Fondo `$grid-resting` (#FFFFFF). Sin icono |
| **Ocupado** (marcado) | Fondo `$grid-occupied` (#1B2A4A). Icono de bloqueo o X sutil |
| **Hover** | Cambio sutil de color para indicar interactividad |

## Estados de la pantalla

| Estado | Comportamiento |
|---|---|
| **Sin cambios** | Grid precargado con los bloques guardados (si edita sala existente). Boton "Guardar" deshabilitado |
| **Con cambios** | Boton "Guardar" habilitado. Indicador visual sutil de cambios pendientes |
| **Cargando** | Boton con spinner al guardar |
| **Error** | Error alert si falla la escritura a Firestore |
| **Exito** | Toast o feedback visual, redirige a donde venia (dashboard o confirmacion de creacion) |

## Especificaciones

- **Layout:** AppShell (sidebar + topbar). Ancho completo del area de contenido
- **Grilla:** Reutilizar el componente `20-Block Grid` del Design System, adaptandolo para el contexto del ayudante (marcar ocupados, no mostrar porcentajes)
- **Desktop:** >= 1024px. Mobile postergado
- **Accesibilidad:** Area tactil minima 44x44px por celda. Cada celda debe ser accesible con teclado
- **Paleta:** `docs/tech-document.md §6` — usar `$grid-resting`, `$grid-occupied`
- **Tipografia:** Inter para textos, JetBrains Mono para los horarios en la columna izquierda
- **Iconografia:** Lucide, trazo 2px
- **Idioma:** Espanol neutro, forma "tu" (`docs/estandar-idioma.md`)

## Nota sobre privacidad

El horario del ayudante **nunca se expone al frontend del alumno**. Los bloques se guardan como `helperBlockedSlots: [3, 4, 7, 8]` y desde el lado del alumno esos bloques simplemente aparecen como gris/bloqueado en el heatmap, sin revelar que son restricciones del ayudante.

---

## CORRECCION: Cantidad de bloques insuficiente

### Problema

La pantalla `Configurar Mis Bloques` y el componente `20-Block Grid` solo muestran **4 filas** (bloques 1-2 al 7-8):

```
08:15 – 09:25  (1-2)  ✅
09:40 – 10:50  (3-4)  ✅
11:05 – 12:15  (5-6)  ✅
12:30 – 13:40  (7-8)  ✅
```

Faltan **6 filas** de la matriz USM:

```
14:40 – 15:50  (9-10)   ❌ Falta
16:15 – 17:15  (11-12)  ❌ Falta
17:30 – 18:40  (13-14)  ❌ Falta
18:50 – 20:00  (15-16)  ❌ Falta
Vespertino     (17-18)  ❌ Falta
Vespertino     (19-20)  ❌ Falta
```

### Accion requerida

Agregar las 6 filas faltantes a la grilla en `Configurar Mis Bloques`. Tambien actualizar el componente `20-Block Grid` y `Heatmap Component` en el Design System para que incluyan las 10 filas completas.

Total de celdas: 10 pares de bloques × 5 dias = **50 celdas**.

Los bloques 17-18 y 19-20 (vespertinos) no tienen horario definido. Mostrar label "Vespertino" en lugar de la hora.

### Referencias

- Componente `20-Block Grid` en el Design System del .pen
- Entidad Room: `helperBlockedSlots` en `docs/tech-document.md §2.1`
- HU-07: `docs/hu-07-crear-sala.md` (desde el boton "Configurar mis bloques")
