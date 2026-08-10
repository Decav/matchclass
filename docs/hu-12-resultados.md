# HU-12: Resultados — Heatmap y Ranking

**Proyecto:** MatchClass

**Epica:** Resultados (Matching)

**Prioridad:** Alta

**Story Points:** 5

---

## Narrativa (INVEST)

**Como** ayudante,

**quiero** ver un mapa de calor con la disponibilidad de mis alumnos y un ranking de los 3 mejores horarios,

**para** decidir en segundos cual es el mejor bloque para dictar la ayudantia.

---

## Descripcion / Contexto

El ayudante accede desde la card de una sala en el dashboard (accion "Abrir"). La pantalla muestra dos secciones:

1. **Heatmap:** grilla de 50 celdas (10 bloques USM x 5 dias) coloreadas segun el porcentaje de disponibilidad. Las celdas con restricciones del ayudante aparecen como "bloqueado" en gris, con prioridad sobre cualquier porcentaje.
2. **Ranking Top 3:** los tres slots con mayor porcentaje de alumnos disponibles, excluyendo los bloqueados.

Los datos se recalculan cada vez que el ayudante abre la pantalla, leyendo todas las respuestas de la sala y aplicando las restricciones del ayudante. Tambien se actualizan cuando un alumno nuevo responde.

La pestana "Respuestas" queda como placeholder para una HU futura.

---

## Especificaciones / Contrato

- **Lectura de sala:** `getDoc(doc(db, 'rooms', roomId))` para obtener `helperBlockedSlots`
- **Lectura de respuestas:** `getDocs(collection(db, 'rooms', roomId, 'responses'))` para obtener todas las respuestas
- **Algoritmo de matching (lado cliente):**
  1. Por cada celda (1-50), contar cuantos alumnos NO la tienen en `occupiedBlocks`
  2. Calcular porcentaje: `disponibles / totalRespuestas * 100`
  3. Si la celda esta en `helperBlockedSlots`, asignar `status: 'blocked'` (gris), sin importar el porcentaje
  4. Para el resto de celdas, asignar color segun porcentaje
- **Categorias de color:**

| Estado | Umbral | Color |
|---|---|---|
| `high` | ≥ 70% | `$heatmap-high` #10B981 verde |
| `medium` | 40% – 69% | `$heatmap-medium` #FBBF24 ambar |
| `low` | 10% – 39% | `$heatmap-low` #F97316 naranja |
| `conflict` | < 10% | `$heatmap-conflict` #EF4444 rojo |
| `blocked` | — | `$heatmap-blocked` #6B7280 gris |

- **Ranking:** Ordenar celdas por porcentaje DESC, excluir `blocked`, tomar top 3
- **Actualizacion en tiempo real:** Usar `onSnapshot` sobre la subcoleccion `responses` para recalcular el heatmap cuando un alumno responde

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Heatmap con datos

- **GIVEN** la sala tiene 35 respuestas y el ayudante bloqueo las celdas 4, 23 y 33
- **WHEN** el ayudante abre los resultados
- **THEN** las 50 celdas muestran su porcentaje numerico con el color correspondiente
- **AND** las celdas 4, 23 y 33 aparecen en gris con "—" (bloqueado), sin importar el porcentaje real
- **AND** la leyenda muestra los 5 colores con sus umbrales

### Escenario 2: Ranking Top 3

- **GIVEN** la sala tiene respuestas con distintos porcentajes de disponibilidad
- **WHEN** el ayudante ve los resultados
- **THEN** los 3 slots con mayor disponibilidad aparecen en el ranking
- **AND** cada item muestra: posicion (#1, #2, #3), dia + bloque, horario, porcentaje y alumnos disponibles
- **AND** los slots bloqueados por el ayudante no aparecen en el ranking

### Escenario 3: Sin respuestas

- **GIVEN** la sala no tiene ninguna respuesta
- **WHEN** el ayudante abre los resultados
- **THEN** se muestra el empty state: "Nadie respondio todavia"
- **AND** se muestra un mensaje "Comparti el codigo de la sala con tus alumnos"
- **AND** el ranking esta vacio

### Escenario 4: Actualizacion en tiempo real

- **GIVEN** el ayudante esta viendo el heatmap con 35 respuestas
- **WHEN** un alumno nuevo envia su respuesta
- **THEN** el heatmap se recalcula automaticamente (sin recargar la pagina)
- **AND** los porcentajes y colores se actualizan
- **AND** el ranking se reordena si cambia el top 3

### Escenario 5: Todos los alumnos disponibles en un slot

- **GIVEN** en una celda ningun alumno la tiene en `occupiedBlocks`
- **WHEN** el heatmap se calcula
- **THEN** esa celda muestra 100% en verde (`high`)
- **AND** si es una de las 3 mejores, aparece en el ranking

### Escenario 6: Todos los alumnos ocupados en un slot

- **GIVEN** en una celda todos los alumnos la tienen en `occupiedBlocks`
- **WHEN** el heatmap se calcula
- **THEN** esa celda muestra 0% en rojo (`conflict`)

### Escenario 7: Cargando resultados

- **GIVEN** el ayudante abre los resultados
- **WHEN** las respuestas aun se estan cargando desde Firestore
- **THEN** se muestran skeletons en el heatmap y el ranking
- **AND** el sidebar y topbar se renderizan normalmente

### Escenario 8: Error al cargar

- **GIVEN** el ayudante abre los resultados
- **WHEN** falla la lectura de Firestore
- **THEN** se muestra el estado de error con mensaje y boton "Intentar de nuevo"

---

## Comportamiento Visual (UI/UX)

- **Layout:** Dentro del AppShell (sidebar + topbar). Dos columnas: heatmap a la izquierda, ranking a la derecha
- **Topbar:** Nombre de la sala + tema toggle
- **Tabs:** "Resultados" (activo) y "Respuestas" (inactivo, placeholder gris)
- **Heatmap:** 50 celdas con porcentaje en JetBrains Mono. Color de fondo segun la escala. Celdas bloqueadas con "—" en gris. Leyenda debajo
- **Ranking:** 3 items con badge de posicion (#1 dorado, #2/#3 gris), dia+bloque, horario, badge de porcentaje coloreado, contador de alumnos
- **Accesibilidad:** El color por si solo no comunica el nivel — cada celda debe mostrar el porcentaje numerico. Las celdas bloqueadas deben ser distinguibles por texto y color
- **Estados de carga:** Skeletons de celdas y ranking
- **Prioridad desktop:** >= 1024px. Mobile postergado
- **Idioma:** Espanol neutro, forma "tu"

---

## Definition of Done (DoD)

- [ ] El heatmap de 50 celdas se renderiza con porcentajes y colores correctos
- [ ] Las restricciones del ayudante (`helperBlockedSlots`) se muestran como bloqueadas (gris, "—"), con prioridad sobre el porcentaje
- [ ] El ranking muestra el top 3 excluyendo bloqueados
- [ ] El heatmap se actualiza en tiempo real al recibir una nueva respuesta
- [ ] Los estados de carga, vacio y error funcionan correctamente
- [ ] La pestana "Respuestas" aparece como placeholder inactivo
- [ ] La interfaz sigue el diseno aprobado en `matchclass_design.pen` (frame `Resultados Sala`)
- [ ] La HU cumple con los criterios de aceptacion validados por QA
