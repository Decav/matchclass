# RC-012: Cerrar, reabrir y eliminar sala (HU-10)

> **Estado:** `draft`
> **Módulo:** `rooms` *(épica "Gestión de Salas"; el código vive en `src/modules/home/` — ver Notas)*
> **Autor:** Diego Canelo / Claude
> **Fecha:** 2026-08-07
> **Aprobado por:** — pendiente

---

## 1. Contexto y Problema

Una sala creada (RC-009) queda `active` para siempre: no hay forma de cerrarla cuando termina la ayudantía, reabrirla si se necesita, ni eliminarla si ya no sirve. El dashboard (RC-008) tampoco distingue salas archivadas — hoy las mostraría igual que las cerradas en "Salas pasadas".

## 2. Objetivo

Agregar las tres acciones de ciclo de vida (cerrar/reabrir/eliminar) desde la card de sala del dashboard, con diálogo de confirmación reutilizable para las dos acciones destructivas, y excluir las salas `archived` del dashboard por completo.

---

## 3. Entidades y Value Objects

No se agregan entidades: `Room`/`RoomStatus` (RC-003) ya tienen los tres estados (`active`/`closed`/`archived`). Este RC es el primero en escribir `closed` y `archived` (antes solo se creaba `active`).

## 4. Errores de Dominio

| Error | Origen | Manejo | Escenario |
|-------|--------|--------|-----------|
| (sin tipo propio) | falla de red/Firestore al actualizar `status` | Toast genérico "No se pudo actualizar la sala. Intenta de nuevo" (reusa `Q1Toast`, RC-010) — la HU no define un mensaje ni un escenario Gherkin para este caso, se agrega por consistencia con el resto de la app, no porque lo pida la HU | — |

**`RoomClosedError` (Escenario 2) ya existe y ya funciona — no es trabajo nuevo.** RC-003 ya implementó el rechazo de código de sala cerrada con el mensaje exacto "Esta sala ya no acepta respuestas" (`Q4RoomCodeForm`). Este RC no lo toca, solo lo deja como regresión a no romper.

## 5. Puertos (Interfaces)

- **RoomRepository** (`src/library/repositories/room.repository.ts`) — se agrega:
  - `updateStatus(roomId: string, status: RoomStatus): Promise<void>` — `updateDoc(doc(db,'rooms',roomId), { status })`, un solo método genérico para las tres transiciones (cerrar→`closed`, reabrir→`active`, eliminar→`archived`) en vez de tres métodos casi idénticos

- **RoomService** (`src/library/services/room.service.ts`) — `getDashboardRooms` se modifica: excluye las salas `status: 'archived'` del arreglo devuelto (hoy las incluye junto con `closed`). Sin esto, "eliminar" no cumpliría el Escenario 4 ("la sala desaparece del dashboard") — seguiría viéndose en "Salas pasadas"

- **Q2ConfirmDialog** (`src/global/components/q2-confirm-dialog/`, nuevo, sin conocer dominios): modal genérico — props `open`, `title`, `message`, `confirmLabel`, `confirmVariant: 'primary' | 'danger'`, `onConfirm`, `onCancel`. Implementa el frame reusable `Confirm Dialog Component` (`lwsXI`) del `.pen`

- **Menú de acciones de sala** (`src/modules/home/components/q2-room-actions-menu/`, nuevo, en `home` — sí conoce el dominio: sus opciones son literalmente "Cerrar sala"/"Reabrir sala"/"Eliminar sala"): dropdown anclado al botón kebab (`⋮`), ya diseñado en `Room Card Component` (`uksGB`) pero sin su contenido desplegado especificado — ver Notas

## 6. Use Case

| Use Case | Input | Output | Errores posibles |
|----------|-------|--------|-------------------|
| UpdateRoomStatus | roomId, `status` destino | `void` → refetch del dashboard | Error de red (toast genérico) |

### UpdateRoomStatus
1. **Cerrar** (solo visible si `status === 'active'`): clic en "Cerrar sala" → `Q2ConfirmDialog` (`confirmVariant: 'primary'`, título "¿Cerrar esta sala?", mensaje "No se aceptarán más respuestas de alumnos", botón "Cerrar sala") → al confirmar, `RoomRepository.updateStatus(roomId, 'closed')` → invalida `queryKeys.rooms.byOwner(uid)` → la sala pasa a "Salas pasadas" con badge "Cerrada" (Escenario 1)
2. **Reabrir** (solo visible en salas pasadas, que en el dashboard siempre son `closed` — las `archived` ya no se muestran, ver §5): clic en "Reabrir sala" → **sin diálogo de confirmación** (HU explícita en esto) → `RoomRepository.updateStatus(roomId, 'active')` de inmediato → la sala vuelve a "Salas activas" (Escenario 3)
3. **Eliminar** (siempre visible, cualquier estado): clic en "Eliminar sala" → `Q2ConfirmDialog` (`confirmVariant: 'danger'`, título "¿Eliminar esta sala?", mensaje "Esta acción no se puede deshacer", botón "Eliminar") → al confirmar, `RoomRepository.updateStatus(roomId, 'archived')` → la sala desaparece del dashboard (Escenario 4)
4. Falla de red en cualquiera de las tres → toast genérico, la sala se queda en su estado anterior (optimista no se aplica: se espera confirmación de Firestore antes de refetch)

**Escenario 5 (otro ayudante no puede modificar) — ya cubierto sin código nuevo:**
- El dashboard solo lista salas con `createdBy === uid` (`RoomRepository.listByOwner`, RC-008) — nunca renderiza la sala de otro ayudante, así que las opciones de cerrar/reabrir/eliminar nunca se muestran para una sala ajena, sin necesidad de una comprobación adicional
- `firestore.rules` ya exige `resource.data.createdBy == request.auth.uid` para `update`/`delete` en `rooms` (RC-003) — no se modifica

---

## 7. Contrato (Firebase)

| Operación | Método Firestore | Input | Output | Errores |
|-----------|-------------------|-------|--------|---------|
| Cambiar estado de sala | `updateDoc(doc(db,'rooms',roomId), { status })` | roomId, `'active' \| 'closed' \| 'archived'` | `void` | `unavailable`, `permission-denied` (no debería ocurrir para el propio dueño) |

---

## 8. Modelo de Datos

Sin cambios de esquema. `Room.status` ya admite los tres valores (RC-003). `firestore.rules` ya protege `update`/`delete` por `createdBy` — verificado, no se toca.

---

## 9. Criterios de Aceptación

### Componente / Hook (Vitest + Testing Library)
- [ ] `Q2ConfirmDialog`: renderiza título/mensaje/botones según props; `onCancel` al presionar "Cancelar"; `onConfirm` al presionar el botón de acción; `confirmVariant: 'danger'` pinta el botón de confirmar en rojo, `'primary'` en navy
- [ ] `Q2RoomActionsMenu` (o el nombre que uses): sala `active` muestra "Cerrar sala" + "Eliminar sala"; sala `closed` muestra "Reabrir sala" + "Eliminar sala"
- [ ] Cerrar sala: clic → aparece el diálogo → confirmar → `RoomRepository.updateStatus(roomId, 'closed')` (Escenario 1)
- [ ] Reabrir sala: clic → **no** aparece diálogo → `RoomRepository.updateStatus(roomId, 'active')` directo (Escenario 3)
- [ ] Eliminar sala: clic → aparece el diálogo con el mensaje de advertencia → confirmar → `RoomRepository.updateStatus(roomId, 'archived')` (Escenario 4)
- [ ] Cancelar en cualquiera de los dos diálogos → no se llama a `updateStatus`
- [ ] `RoomService.getDashboardRooms`: una sala `archived` en el resultado de `listByOwner` no aparece en el arreglo devuelto (Escenario 4)
- [ ] `RoomRepository.updateStatus`: sin `any`

### E2E (Playwright)
- [ ] Cerrar una sala activa sembrada → confirmar → recargar el dashboard → aparece en "Salas pasadas" con badge "Cerrada" (Escenario 1)
- [ ] Reabrir una sala cerrada sembrada → aparece en "Salas activas" sin haber visto ningún diálogo (Escenario 3)
- [ ] Eliminar una sala sembrada → confirmar → ya no aparece en ninguna sección del dashboard (Escenario 4)
- [ ] (Regresión) Alumno con código de una sala `closed` sembrada → sigue viendo "Esta sala ya no acepta respuestas" (Escenario 2)

### Definition of Done
- [ ] `tsc --noEmit` sin errores
- [ ] Lint sin errores
- [ ] `npm run build` exitoso
- [ ] Ningún `any` en el código
- [ ] Ningún componente importa `firebase/*` (solo `src/library/repositories/*`)
- [ ] La interfaz replica el `Confirm Dialog Component` (`lwsXI`) de `matchclass_design.pen`, leído con `Get(...,{resolveVariables:true})`
- [ ] La HU cumple los 5 escenarios de `docs/hu-10-gestionar-sala.md`, validados por QA

---

## 10. Notas

**El contenido del menú kebab no está diseñado — solo el botón.** `design-feedback-08.md` pidió agregar el kebab a `Room Card Component` y el diseñador lo hizo (`RC Kebab Button`, `s5GbWH`), pero ningún frame muestra el menú desplegado (revisé la lista completa de nodos, no hay ninguno con "menu"/"Cerrar sala"/"Eliminar sala" como contenido). El propio feedback dice "a elección del diseñador" para esta parte. Se construye un dropdown simple (blanco, sombra, ítems con ícono + label, "Eliminar sala" en rojo) siguiendo el lenguaje visual ya establecido — no un componente de Pencil, es diseño de implementación.

**Confirmar "Cerrar sala" usa el botón navy, no el rojo del componente base.** El nodo `lwsXI` tal como está en el `.pen` tiene el botón de confirmar en rojo (`#EF4444`) con label "Cerrar sala" — pero `design-feedback-08.md` es explícito: *"botón confirmar: botón danger (rojo) para delete, botón primario/default para close"*. Se interpreta el rojo del nodo base como el estado por defecto del componente reusable, y la instancia de "cerrar" lo overridea a `--mc-brand-primary` (navy) según el texto del feedback, no según el color literal del nodo.

**Sin acciones en `Q2PastRoomRow` todavía — se le agrega un kebab.** El frame `Dashboard Ayudante` (`Mc5BH`) diseña las filas de "Salas pasadas" sin ningún botón de acción (son de antes de HU-10). Pero la HU exige "Reabrir sala" y "Eliminar sala" accesibles ahí ("Reabrir... disponible solo en salas cerradas... mostrar en la sección de salas pasadas"). Se agrega el mismo botón kebab + menú a `Q2PastRoomRow`, sin frame de referencia — mismo criterio que el punto anterior.

**`Q2PastRoomRow` en este dashboard siempre es `closed`, nunca `archived`.** Como `getDashboardRooms` excluye `archived` del arreglo completo, cualquier sala que llegue a renderizarse como fila pasada ya es `closed` por descarte — el menú de esa fila no necesita distinguir entre los dos estados, siempre ofrece "Reabrir sala".

**`RoomService` vs. `RoomRepository` para las tres transiciones.** No se agrega un método de servicio por transición (`closeRoom`/`reopenRoom`/`deleteRoom`): son una sola llamada a un solo repositorio, no combinan nada — no cumplen el criterio de la capa `services/` (combinar múltiples repositorios) que sí cumple `getDashboardRooms`/`createRoom`. Los hooks llaman `RoomRepository.updateStatus` directo.

**Fuera de alcance:** cualquier acción sobre `/salas/:roomId` (la HU es explícita: las acciones se ejecutan "desde la card de la sala en el dashboard", no desde el detalle de sala, que sigue siendo placeholder), notificar al alumno cuando su sala se cierra/reabre, deshacer un archivado, listar/gestionar salas archivadas en algún lugar (quedan invisibles para siempre en la UI, aunque el documento persiste en Firestore).

---

## Historial

| Fecha | Acción | Autor |
|-------|--------|-------|
| 2026-08-07 | Creación (draft, pendiente de aprobación) | Diego Canelo / Claude |
