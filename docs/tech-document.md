# MatchClass — Documento Técnico

**Versión:** 1.0
**Propósito:** Descripción general del proyecto, entidades de dominio y Requirements Charters (RC)
**Proyecto:** Plataforma de coordinación de ayudantías académicas
**Institución:** Universidad Técnica Federico Santa María (USM)

---

## 1. Descripción General del Proyecto

MatchClass es una plataforma web que automatiza la programación de ayudantías académicas. Su innovación principal es la **inversión de carga de entrada de datos**: en lugar de que el alumno marque sus bloques libres en una grilla (tarea lenta y propensa a errores), solo marca sus bloques ocupados.

El ayudante crea una sala, define sus propias restricciones horarias, y comparte un código corto con los alumnos. Los alumnos ingresan anónimamente, marcan sus bloques ocupados en una grilla de 20 bloques (matriz USM), y el sistema genera automáticamente un mapa de calor y un ranking de los mejores horarios disponibles.

### Flujo de Alto Nivel

```
Ayudante                     Alumno                      Sistema
   │                           │                           │
   ├─ Crea sala ───────────────┤                           │
   ├─ Marca sus bloques ───────┤                           │
   ├─ Comparte código ────────>│                           │
   │                           ├─ Ingresa con código ─────>│
   │                           ├─ Marca bloques ocupados ─>│
   │                           ├─ Envía respuesta ────────>│
   │<──────────────────────────┼─── Recalcula matching ───┤
   ├─ Ve heatmap + ranking ────┤                           │
   └─ Decide horario ──────────┘                           └─
```

### Actores

| Actor | Descripción | Autenticación |
|---|---|---|
| Ayudante | Estudiante avanzado que dicta ayudantías | Sí (email + password) |
| Alumno | Estudiante que responde su disponibilidad | No (acceso anónimo por código) |
| Administrador | Profesor/coordinador que supervisa (futuro) | Sí (con rol admin) |

---

## 2. Entidades de Dominio

### 2.1 Sala (Room)

Representa un espacio virtual de coordinación para una ayudantía.

| Campo | Tipo | Valores posibles | Descripción |
|---|---|---|---|
| `id` | string (UUID) | Autogenerado | Identificador único del documento Firestore |
| `code` | string (3-6 chars) | Ej: "EDS101", "MAT202" | Código corto para compartir con alumnos. Generado automáticamente |
| `name` | string | Ej: "Estructuras de Datos - Secc 1" | Nombre visible de la sala |
| `subject` | string | Ej: "Estructuras de Datos" | Nombre de la asignatura |
| `section` | string | Ej: "1", "2" | Sección del curso |
| `createdBy` | string (UID) | Firebase Auth UID | Identificador del ayudante que creó la sala |
| `createdAt` | Timestamp | — | Fecha y hora de creación |
| `status` | enum | `active`, `closed`, `archived` | Estado actual de la sala |
| `helperBlockedSlots` | number[] | Ej: `[3, 4, 7, 8]` | Bloques 1–20 donde el ayudante tiene clase y NO puede dictar ayudantía. Hard constraint |
| `studentLimit` | number (opcional) | Ej: `100` | Límite máximo de respuestas (opcional) |

**Invariantes:**
- `code` debe ser único en el sistema
- `helperBlockedSlots` debe contener valores entre 1 y 20
- Solo el usuario `createdBy` puede modificar la sala

**Posibles estados:**
```
active ──> closed ──> archived
  │         │
  │         └──> active (reabrir)
  │                     │
  └─────> archived ────┘
```

### 2.2 Respuesta (Response)

Representa la respuesta de disponibilidad de un alumno.

| Campo | Tipo | Valores posibles | Descripción |
|---|---|---|---|
| `id` | string | Autogenerado | Identificador único |
| `roomId` | string (ref) | ID de Sala | Sala a la que pertenece esta respuesta |
| `studentName` | string | Ej: "Diego Pérez" | Nombre visible del alumno |
| `occupiedBlocks` | number[] | Ej: `[1, 2, 5, 6, 9, 10]` | Bloques 1–20 donde el alumno tiene clase/trabajo |
| `createdAt` | Timestamp | — | Fecha y hora de creación |
| `updatedAt` | Timestamp | — | Fecha y hora de última modificación |

**Invariantes:**
- `occupiedBlocks` debe contener valores entre 1 y 20 (puede estar vacío si el alumno está completamente libre)
- `studentName` debe tener al menos 2 caracteres
- `roomId` debe referenciar una Sala existente con status `active`

### 2.3 Resultado de Sala (RoomResult)

Representa el resultado del matching para una sala. Se calcula a partir de todas las respuestas y se persiste en Firestore. Se actualiza cada vez que un alumno envía o modifica su respuesta.

| Campo | Tipo | Valores posibles | Descripción |
|---|---|---|---|
| `roomId` | string (ref) | ID de Sala | Sala asociada |
| `totalResponses` | number | Ej: `35` | Cantidad total de alumnos que respondieron |
| `heatmap` | mapa (ver §2.3.1) | — | Mapa de disponibilidad por bloque |
| `ranking` | array (ver §2.3.2) | — | Bloques ordenados por disponibilidad descendente |
| `lastUpdated` | Timestamp | — | Momento del último cálculo |

#### 2.3.1 HeatmapEntry

Cada entrada del heatmap representa la disponibilidad de un bloque específico.

| Campo | Tipo | Valores posibles | Descripción |
|---|---|---|---|
| `block` | number | 1–20 | Número de bloque |
| `day` | string | `Lunes`, `Martes`, `Miércoles`, `Jueves`, `Viernes` | Día de la semana |
| `timeRange` | string | Ej: `"08:15 – 09:25"` | Horario del bloque |
| `available` | number | Ej: `32` | Alumnos disponibles en este bloque |
| `total` | number | Ej: `35` | Total de alumnos que respondieron |
| `percentage` | number (0–100) | Ej: `91.4` | Porcentaje de disponibilidad |
| `status` | enum | `high`, `medium`, `low`, `conflict`, `blocked` | Categoría semántica. `high` ≥70%, `medium` 40-69%, `low` 10-39%, `conflict` <10%, `blocked` (restricción absoluta) |

#### 2.3.2 RankingEntry

Cada entrada del ranking es un bloque ordenado por mejor disponibilidad. El ranking contiene los top 3 bloques.

Mismos campos que HeatmapEntry.

### 2.4 Bloque Horario (ScheduleBlock)

Configuración estática de la matriz horaria USM. Cada ScheduleBlock representa un bloque específico en un día específico. Total: 100 combinaciones (20 bloques × 5 días). No persiste en DB, vive como constante en la aplicación.

| Campo | Tipo | Valores posibles | Descripción |
|---|---|---|---|
| `day` | string | `Lunes`, `Martes`, `Miércoles`, `Jueves`, `Viernes` | Día de la semana |
| `blockNumber` | number | 1–20 | Identificador del par de módulos |
| `displayName` | string | `"Bloque 1-2"` | Nombre visible |
| `modules` | string | `"Módulos 1 y 2"` | Módulos USM que lo componen |
| `startTime` | string | Ej: `"08:15"` | Hora de inicio |
| `endTime` | string | Ej: `"09:25"` | Hora de término |
| `isVespertine` | boolean | `true`, `false` | Indica si pertenece a la jornada vespertina |

**Matriz de horarios (20 bloques, aplican igual todos los días Lunes–Viernes):**

| Bloque | Módulos | Horario | Jornada |
|---|---|---|---|
| 1-2 | 1 y 2 | 08:15 – 09:25 | Diurna |
| 3-4 | 3 y 4 | 09:40 – 10:50 | Diurna |
| 5-6 | 5 y 6 | 11:05 – 12:15 | Diurna |
| 7-8 | 7 y 8 | 12:30 – 13:40 | Diurna |
| 9-10 | 9 y 10 | 14:40 – 15:50 | Diurna |
| 11-12 | 11 y 12 | 16:15 – 17:15 | Diurna |
| 13-14 | 13 y 14 | 17:30 – 18:40 | Diurna |
| 15-16 | 15 y 16 | 18:50 – 20:00 | Diurna |
| 17-18 | 17 y 18 | — | Vespertina |
| 19-20 | 19 y 20 | — | Vespertina |

Combinaciones resultantes: 20 bloques × 5 días = 100 slots (`Lunes-Bloque1-2`, `Martes-Bloque9-10`, `Viernes-Bloque5-6`, etc.). El heatmap y ranking operan sobre estas combinaciones día+bloque.

### 2.5 Usuario (User)

Representa un ayudante registrado en la plataforma. Manejado por Firebase Auth.

| Campo | Tipo | Valores posibles | Descripción |
|---|---|---|---|
| `uid` | string | Firebase Auth UID | Identificador único de usuario |
| `email` | string | Ej: `"ayudante@usm.cl"` | Correo electrónico |
| `displayName` | string | Ej: `"María González"` | Nombre visible |
| `role` | enum | `helper`, `admin` | Rol dentro de la plataforma |
| `createdAt` | Timestamp | — | Fecha de registro |

**Nota:** Firebase Auth maneja la autenticación. El documento en Firestore (`users/{uid}`) almacena datos adicionales como `displayName` y `role`. El `uid` se obtiene de `auth.currentUser.uid`.

---

## 3. Requirements Charters (RCs)

### Resumen de RCs

| RC | Nombre | Módulo | Depende de | Descripción breve |
|---|---|---|---|---|
| RC-001 | Bootstrapping del proyecto | infraestructura | — | Inicializar proyecto Vite + Firebase + estructura base |
| RC-002 | Design System | global | RC-001 | Definir tokens visuales y componentes base |
| RC-003 | Autenticación de ayudante | authentication | RC-001 | Registro, login, cierre de sesión, guard de rutas |
| RC-004 | Gestión de salas | rooms | RC-003 | CRUD de salas, restricciones del ayudante |
| RC-005 | Respuesta del alumno | scheduling | RC-004 | Ingreso con código, grilla de bloques, envío |
| RC-006 | Matching y resultados | results | RC-005 | Algoritmo de matching, heatmap, ranking |
| RC-007 | Página pública y dashboard | home | RC-003 | Landing, dashboard del ayudante, listado de salas |
| RC-008 | Modo oscuro y responsive | global | RC-002 | Toggle dark/light, adaptación mobile |

### RC-001: Bootstrapping del Proyecto

**Propósito:** Inicializar el proyecto con todas las herramientas necesarias para comenzar el desarrollo.

**Alcance:**
- Crear proyecto Vite + React + TypeScript
- Configurar Firebase (Auth + Firestore + emuladores)
- Configurar Tailwind CSS, PrimeReact, y dependencias base
- Establecer aliases de importación (paths)
- Crear estructura de directorios inicial
- Configurar herramientas de calidad (ESLint, Prettier, TypeScript strict)

**Criterios de aceptación:**
- `npm run dev` levanta servidor en http://localhost:5173
- Firebase emuladores Auth (9099) y Firestore (8080) responden
- TypeScript strict mode sin errores
- Build de producción genera `dist/` sin errores

---

### RC-002: Design System

**Propósito:** Definir el lenguaje visual de MatchClass con tokens CSS y componentes base.

**Alcance:**
- Variables CSS `--mc-*` (colores brand, neutrales, semánticos, tipografía, espaciado)
- Tema claro y oscuro (`data-theme="dark"`)
- Configuración de fuentes (Inter + JetBrains Mono)
- Layout base (AppShell con sidebar + topbar)
- Componentes atómicos: botones, inputs, badges, loading spinner
- Configuración de PrimeReact con overrides de color

**Criterios de aceptación:**
- Sidebar se muestra en desktop, oculto en mobile con toggle
- Toggle dark/light cambia todas las variables
- Botón primario usa el color brand definido
- Layout es responsive (mobile < 768px, desktop >= 1024px)

---

### RC-003: Autenticación de Ayudante

**Propósito:** Permitir que ayudantes se registren, inicien sesión y accedan a rutas protegidas.

**Alcance:**
- Registro con email + password (Firebase Auth)
- Creación del documento `users/{uid}` en Firestore con rol `helper` al registrarse
- Inicio de sesión con email + password
- Persistencia de sesión (al recargar la página)
- Guard de rutas: redirigir a /login si no hay sesión
- Cierre de sesión
- Recuperación de contraseña (email de reset)

**Criterios de aceptación:**
- Usuario se registra y queda autenticado
- Al registrarse, se crea el documento `users/{uid}` en Firestore con `displayName`, `email` y `role: helper`
- Usuario inicia sesión y es redirigido al dashboard
- Sin sesión, /dashboard redirige a /login
- Al cerrar sesión, redirige a /login
- Recuperación de contraseña envía email

---

### RC-004: Gestión de Salas

**Propósito:** Permitir que el ayudante cree, configure y administre salas de coordinación.

**Alcance:**
- Crear sala con nombre, asignatura, sección
- Generar código corto único automáticamente
- Configurar bloques ocupados del ayudante (hard constraints)
- Listar salas del ayudante (activas y pasadas)
- Compartir sala (copiar enlace + código)
- Cambiar estado de sala: cerrar / reabrir
- Eliminar sala (soft delete)

**Criterios de aceptación:**
- Ayudante autenticado crea sala y recibe código único
- Código generado tiene 3-6 caracteres alfanuméricos
- Bloques del ayudante se guardan como restricción
- Solo el creador puede modificar/eliminar la sala
- Al cerrar sala, no se aceptan más respuestas

---

### RC-005: Respuesta del Alumno

**Propósito:** Permitir que el alumno ingrese a una sala y marque su disponibilidad sin registrarse.

**Alcance:**
- Página de entrada con código corto
- Visualización de nombre de la sala al ingresar
- Registro de nombre del alumno (solo nombre, no email)
- Grilla interactiva de 20 bloques USM
- Interacción táctil optimizada (tap para marcar/desmarcar)
- Envío de respuesta y confirmación visual
- Modificación de respuesta ya enviada

**Criterios de aceptación:**
- Alumno ingresa código y ve la grilla de la sala
- Alumno marca sus bloques ocupados con un tap
- Alumno envía respuesta y ve confirmación ("¡Gracias!")
- Datos persisten aunque el alumno cierre el navegador (puede modificar después)
- No se requiere registro ni autenticación

---

### RC-006: Matching y Resultados

**Propósito:** Implementar el algoritmo de matching y visualizar los resultados al ayudante.

**Alcance:**
- Algoritmo de matching: cruzar respuestas con restricciones del ayudante
- Mapa de calor: grilla 5 días × 4 bloques con código de colores
- Ranking automático: top 3 bloques con mejor disponibilidad
- Categorías de color (verde ≥70%, ámbar 40-69%, naranja 10-39%, rojo <10%, gris bloqueado)
- Actualización al recibir nueva respuesta
- Los bloques del ayudante se muestran como "bloqueados" en gris

**Criterios de aceptación:**
- Heatmap muestra los 20 bloques con su color correspondiente
- Ranking ordena bloques por disponibilidad descendente
- Bloques del ayudante aparecen como "bloqueados" en gris
- Si un alumno nuevo responde, los resultados se actualizan
- Se muestra el porcentaje numérico en cada bloque

---

### RC-007: Página Pública y Dashboard

**Propósito:** Landing page pública y dashboard principal del ayudante.

**Alcance:**
- Landing page con descripción de MatchClass
- Campo para ingresar código de sala (desde la landing)
- Dashboard del ayudante con resumen de salas activas
- Acceso rápido a salas recientes
- Estadísticas básicas (total salas, respuestas recibidas)

**Criterios de aceptación:**
- Landing page se muestra sin autenticación
- Desde la landing se puede acceder a una sala con código
- Dashboard muestra salas activas del ayudante autenticado
- Dashboard muestra cantidad de respuestas por sala

---

### RC-008: Modo Oscuro y Diseño Responsive

**Propósito:** Soportar modo oscuro y adaptación a dispositivos móviles.

**Alcance:**
- Toggle modo claro/oscuro con persistencia (localStorage)
- Todos los componentes se adaptan al tema activo
- Diseño responsive: mobile, tablet, desktop
- Sidebar colapsable en mobile
- Grilla de bloques táctil en mobile

**Criterios de aceptación:**
- Toggle cambia entre modo claro y oscuro
- Preferencia persiste al recargar la página
- En mobile (< 768px), sidebar se oculta y se abre con botón
- Grilla de bloques es usable con el dedo en mobile
- Todos los textos mantienen contraste WCAG AA en ambos modos

---

## 4. Mapa de Dependencias entre RCs

```
RC-001 (Bootstrapping)
  ├── RC-002 (Design System)
  │     └── RC-008 (Modo oscuro)
  └── RC-003 (Auth)
        ├── RC-004 (Salas)
        │     └── RC-005 (Respuesta)
        │           └── RC-006 (Resultados)
        └── RC-007 (Landing/Dashboard)
```

---

## 5. Glosario

| Término | Definición |
|---|---|
| **Sala** | Espacio virtual de coordinación para una ayudantía |
| **Bloque** | Unidad horaria de 2 módulos académicos (80-110 min) |
| **Inversión de carga** | Metodología donde el alumno marca ocupados en vez de libres |
| **Hard constraint** | Restricción absoluta del ayudante (bloques donde no puede) |
| **Heatmap** | Visualización por colores de la disponibilidad por bloque |
| **Ranking** | Lista ordenada de bloques recomendados según disponibilidad |
| **Matching** | Algoritmo que cruza restricciones + respuestas |
| **Código corto** | Identificador único de 3-6 caracteres para compartir |
| **Módulo USM** | Unidad mínima de 45 min de la matriz horaria USM |
| **RC** | Requirements Charter — definición de feature a implementar |

---

## 6. Referencia de Diseño

### Paleta de Colores

#### Colores de Marca

| Variable | HEX | Rol |
|---|---|---|
| `$brand-primary` | `#1B2A4A` | Color principal — botones, headers, navegación, grilla ocupada |
| `$brand-secondary` | `#4F46E5` | Acento secundario — links, info badges, elementos interactivos |
| `$brand-accent` | `#E8A838` | Acento cálido — CTAs principales, highlights, badges |
| `$brand-accent-dark` | `#D97706` | Hover de acento, warning |

#### Paleta Neutra

| Variable | HEX | Uso |
|---|---|---|
| `$neutral-50` | `#F8F9FA` | Fondos sutiles, hover de filas |
| `$neutral-100` | `#E5E7EB` | Bordes, divisores |
| `$neutral-300` | `#9CA3AF` | Texto deshabilitado, placeholders |
| `$neutral-500` | `#6B7280` | Texto secundario, metadatos, bloques bloqueados |
| `$neutral-600` | `#4B5563` | Texto corporal |
| `$neutral-700` | `#374151` | Texto de alto contraste |
| `$neutral-900` | `#1F2937` | Texto principal oscuro |

#### Texto y Fondos

| Variable | HEX | Uso |
|---|---|---|
| `$text-primary` | `#1F2937` | Texto principal |
| `$text-secondary` | `#6B7280` | Texto secundario, descripciones |
| `$text-muted` | `#9CA3AF` | Texto de menor jerarquía |
| `$text-inverse` | `#FFFFFF` | Texto sobre fondos oscuros |
| `$bg-page` | `#FAFAF8` | Fondo general de la app |
| `$bg-card` | `#FFFFFF` | Fondo de tarjetas, paneles |
| `$bg-elevated` | `#F9FAFB` | Fondo de filas elevadas |
| `$border-default` | `#E5E7EB` | Bordes generales |

#### Mapa de Calor (Heatmap)

| Variable | HEX | Threshold | Significado |
|---|---|---|---|
| `$heatmap-high` | `#10B981` | ≥ 70% | Verde esmeralda — disponibilidad alta |
| `$heatmap-medium` | `#FBBF24` | 40% – 69% | Ámbar — disponibilidad media |
| `$heatmap-low` | `#F97316` | 10% – 39% | Naranja — disponibilidad baja |
| `$heatmap-conflict` | `#EF4444` | < 10% | Rojo — conflicto / superposición |
| `$heatmap-blocked` | `#6B7280` | — | Gris — bloqueado por ayudante |

#### Estados UI

| Variable | HEX | Uso |
|---|---|---|
| `$success` | `#10B981` | Éxito, confirmación |
| `$warning` | `#FBBF24` | Advertencia |
| `$danger` | `#EF4444` | Error, destructivo |
| `$info` | `#4F46E5` | Informativo |

#### Grilla de Bloques

| Variable | HEX | Estado |
|---|---|---|
| `$grid-resting` | `#FFFFFF` | Bloque libre / no tocado |
| `$grid-occupied` | `#1B2A4A` | Bloque ocupado (con clase) |
| `$grid-disabled` | `#F3F4F6` | Bloque fuera de rango |

### Tipografía

| Fuente | Uso |
|---|---|
| **Inter** | Headings y texto de UI |
| **JetBrains Mono** | Datos numéricos, celdas de grilla, horarios, porcentajes |

### Iconografía

**Lucide** — lineal, trazo 2px, tamaño default 22px.
