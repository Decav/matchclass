# Feedback para Disenador — Iteracion 7: Grilla del Alumno

**De:** Jefe de Proyecto
**Para:** Disenador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Nueva pantalla: Grilla de bloques del alumno

El alumno llega aca despues de ingresar su codigo y nombre (flujo del tab Alumno en `/acceso`). Esta pantalla **no usa el AppShell** — el alumno no esta autenticado como ayudante y no tiene sidebar ni dashboard.

Es la pantalla donde el alumno marca los bloques horarios donde **tiene clase o trabajo**. Mismo principio de inversion de carga de todo MatchClass: marcar ocupados, no libres.

---

## Layout

```
┌────────────────────────────────────────────────┐
│  Logo MC    Estructuras de Datos · Secc 1      │
│                                                 │
│  "Marca los bloques donde tienes clase"         │
│  "Selecciona solo los horarios ocupados"        │
│                                                 │
│  ┌──────┬────────┬────────┬────────┬──────┬────┐│
│  │      │  Lun   │  Mar   │  Mie   │ Jue  │ Vie││
│  ├──────┼────────┼────────┼────────┼──────┼────┤│
│  │08:15 │  [ ]   │  [X]   │  [ ]   │ [ ]  │ [ ]││
│  │09:25 │        │        │        │      │    ││ 
│  ├──────┼────────┼────────┼────────┼──────┼────┤│
│  │  ...    ...      ...      ...     ...   ... ││
│  └──────┴────────┴────────┴────────┴──────┴────┘│
│                                                 │
│  Leyenda:  [ ] Libre  [X] Ocupado              │
│                                                 │
│  "Tu seleccion se guarda automaticamente"       │
│                                                 │
│  [Enviar respuesta]                             │
└────────────────────────────────────────────────┘
```

## Elementos

| Elemento | Comportamiento |
|---|---|
| Header | Logo MC + nombre de la sala. Sin sidebar ni topbar ni navegacion |
| Titulo | "Marca los bloques donde tienes clase" |
| Subtitulo | "Selecciona solo los horarios ocupados. El sistema calcula tu disponibilidad automaticamente" |
| Grilla de 50 celdas | 10 filas (bloques USM) x 5 columnas (Lun-Vie). Misma estructura que `Configurar Mis Bloques` pero con proposito opuesto: el alumno marca donde NO puede |
| Leyenda | Libre (blanco) vs Ocupado (navy) |
| Boton "Enviar respuesta" | Boton primario, full-width. Envia los cambios a Firestore |
| Indicador de guardado | Texto sutil que cambia segun estado: "Cambios sin guardar" / "Respuesta guardada" |
| Nota de privacidad | "Tu nombre solo lo vera el ayudante" |

## Estados de celda

| Estado | Visual |
|---|---|
| **Libre** (no marcado) | Fondo `$grid-resting` (#FFFFFF). Sin icono |
| **Ocupado** (tengo clase) | Fondo `$grid-occupied` (#1B2A4A). Icono de libro o clase |
| **Hover** | Cambio sutil de color |

## Estados de la pantalla

| Estado | Comportamiento |
|---|---|
| **Primera visita** | Grid vacio. Boton "Enviar respuesta" deshabilitado. Sin indicador de guardado |
| **Con cambios sin guardar** | Indicador "Cambios sin guardar". Boton habilitado |
| **Cargando** | Boton con spinner al enviar |
| **Respuesta guardada** | Indicador "Respuesta guardada". Toast o feedback visual |
| **Modificando respuesta previa** | Si el alumno ya respondio, la grilla carga sus bloques marcados. Al modificar, vuelve a "Cambios sin guardar" |
| **Error** | Error alert si falla Firestore |

## Diseño responsive

| Breakpoint | Comportamiento |
|---|---|
| **Desktop (>= 1024px)** | Disenar ahora — card centrado con ancho maximo 800px. La grilla necesita espacio para 5 columnas |
| **Mobile (< 768px)** | Postergado — la grilla de 5 columnas en mobile requiere scroll horizontal o rediseno |

La grilla es mas ancha que los cards de 400px usados en auth. Necesita al menos 600-700px para que las celdas de 88px x 5 columnas entren comodamente.

## Nota sobre persistencia

Cuando el alumno vuelve a ingresar el codigo de una sala donde ya respondio, la grilla debe mostrar sus bloques marcados previamente. El sistema usa el `uid` anonimo de Firebase Auth para recuperar el documento `rooms/{roomId}/responses/{uid}`.

## Especificaciones

- **Desktop primero:** >= 1024px. Mobile postergado
- **Grilla:** Reutilizar estructura de `Configurar Mis Bloques`. Mismas dimensiones, misma cabecera de dias, mismas celdas de 88x52px
- **Paleta:** `docs/tech-document.md §6` — `$grid-resting`, `$grid-occupied`
- **Tipografia:** Inter para textos, JetBrains Mono para horarios
- **Iconografia:** Lucide, trazo 2px
- **Idioma:** Espanol neutro, forma "tu" (`docs/estandar-idioma.md`)
- **Sin AppShell:** Esta pantalla no tiene sidebar ni topbar. Es una vista publica

## Referencias

- Grilla base: `Configurar Mis Bloques` en `matchclass_design.pen` — copiar estructura de 50 celdas
- HU-01: `docs/hu-01-login-ayudante.md` (flujo del alumno desde el tab Alumno)
- Entidad Response: `docs/tech-document.md §2.2`
