/**
 * Datos sembrados por `global-setup.ts` en los emuladores de Firebase antes
 * de correr los specs. Únicos valores compartidos entre el seed y los tests
 * — evita duplicar strings mágicos.
 */
export const HELPER_EMAIL = 'ayudante.e2e@matchclass.cl';
export const HELPER_PASSWORD = 'Test1234!';
export const HELPER_DISPLAY_NAME = 'Ayudante E2E';

export const ACTIVE_ROOM_CODE = 'ABCDEF';
export const ACTIVE_ROOM_NAME = 'Estructuras de Datos · Secc 1';

export const RETURNING_ROOM_CODE = 'GHIJKL';
export const RETURNING_ROOM_NAME = 'Bases de Datos · Secc 2';

export const CLOSED_ROOM_CODE = 'CLOSED';

/**
 * Cuenta dedicada al dashboard (RC-008, HU-06 Escenario 1): salas propias,
 * exclusivas de este helper — no las tocan `auth.spec.ts`/`student-access.
 * spec.ts` (que sí escriben respuestas en `ACTIVE_ROOM_CODE`/
 * `RETURNING_ROOM_CODE`). Evita condiciones de carrera entre specs que
 * corren en paralelo (`fullyParallel: true`) sobre las mismas salas.
 */
export const DASHBOARD_HELPER_EMAIL = 'ayudante.dashboard.e2e@matchclass.cl';
export const DASHBOARD_HELPER_PASSWORD = 'Test1234!';
export const DASHBOARD_HELPER_DISPLAY_NAME = 'Ayudante Dashboard E2E';

export const DASHBOARD_ACTIVE_ROOM_CODE = 'DASH01';
export const DASHBOARD_ACTIVE_ROOM_NAME = 'Cálculo Avanzado · Secc 3';
export const DASHBOARD_ACTIVE_ROOM_RESPONSES = 3;
export const DASHBOARD_ACTIVE_ROOM_STUDENT_LIMIT = 10;

export const DASHBOARD_ACTIVE_ROOM_2_CODE = 'DASH02';
export const DASHBOARD_ACTIVE_ROOM_2_NAME = 'Química Orgánica · Secc 1';
export const DASHBOARD_ACTIVE_ROOM_2_RESPONSES = 1;

export const DASHBOARD_CLOSED_ROOM_CODE = 'DASH03';
export const DASHBOARD_CLOSED_ROOM_NAME = 'Historia Universal · Secc 2';

export const DASHBOARD_TOTAL_ROOMS = 3;
export const DASHBOARD_ACTIVE_ROOMS_COUNT = 2;
export const DASHBOARD_TOTAL_RESPONSES = DASHBOARD_ACTIVE_ROOM_RESPONSES + DASHBOARD_ACTIVE_ROOM_2_RESPONSES;

/** Cuenta sin ninguna sala — Escenario 2 (empty state) de HU-06. */
export const EMPTY_HELPER_EMAIL = 'ayudante.sin-salas.e2e@matchclass.cl';
export const EMPTY_HELPER_PASSWORD = 'Test1234!';
export const EMPTY_HELPER_DISPLAY_NAME = 'Ayudante Sin Salas E2E';

/**
 * Cuenta dedicada a `create-room.spec.ts` (RC-009, HU-07): sin salas
 * sembradas — el flujo feliz y el de cancelar corren sobre esta misma
 * cuenta (ninguno de los dos depende de que sea la única sala existente),
 * aislada del resto para no interferir con otros specs en paralelo.
 */
export const CREATE_ROOM_HELPER_EMAIL = 'ayudante.crear-sala.e2e@matchclass.cl';
export const CREATE_ROOM_HELPER_PASSWORD = 'Test1234!';
export const CREATE_ROOM_HELPER_DISPLAY_NAME = 'Ayudante Crear Sala E2E';

/**
 * Cuenta dedicada a `room-blocks.spec.ts` (RC-010, HU-08), aislada del resto.
 * Escenario 1 (marcar y guardar) crea su propia sala nueva vía el flujo real
 * de `/salas/nueva` — así siempre arranca con `helperBlockedSlots: []`, sin
 * depender de un doc sembrado que un run anterior pudo haber dejado con
 * bloques ya marcados. Escenario 2 (precarga) sí usa una sala sembrada con
 * un id fijo (`ROOM_BLOCKS_PRELOADED_ROOM_ID`) — ese test solo lee, nunca
 * escribe, así que es seguro reutilizarla entre corridas.
 */
export const ROOM_BLOCKS_HELPER_EMAIL = 'ayudante.bloques.e2e@matchclass.cl';
export const ROOM_BLOCKS_HELPER_PASSWORD = 'Test1234!';
export const ROOM_BLOCKS_HELPER_DISPLAY_NAME = 'Ayudante Bloques E2E';

export const ROOM_BLOCKS_PRELOADED_ROOM_ID = 'e2e-room-blocks-preloaded';
export const ROOM_BLOCKS_PRELOADED_ROOM_CODE = 'BLK002';
export const ROOM_BLOCKS_PRELOADED_ROOM_NAME = 'Cálculo I · Secc 2';
export const ROOM_BLOCKS_PRELOADED_SLOTS = [2, 4, 6, 8];

/**
 * Cuenta dedicada a `room-actions.spec.ts` (RC-012, HU-10), aislada del
 * resto: sus tres salas se cierran, reabren y archivan durante la corrida.
 * Por eso se siembran con `reset: true` (id fijo + sobrescritura) — sin eso
 * la segunda corrida arrancaría con el estado que dejó la primera y los
 * tests fallarían por datos, no por código. Una sala por escenario, para que
 * los tests puedan correr en paralelo sin pisarse.
 */
export const ROOM_ACTIONS_HELPER_EMAIL = 'ayudante.acciones.e2e@matchclass.cl';
export const ROOM_ACTIONS_HELPER_PASSWORD = 'Test1234!';
export const ROOM_ACTIONS_HELPER_DISPLAY_NAME = 'Ayudante Acciones E2E';

export const ROOM_ACTIONS_CLOSE_ROOM_ID = 'e2e-room-actions-close';
export const ROOM_ACTIONS_CLOSE_ROOM_CODE = 'ACT001';
export const ROOM_ACTIONS_CLOSE_ROOM_NAME = 'Física General · Secc 4';

export const ROOM_ACTIONS_REOPEN_ROOM_ID = 'e2e-room-actions-reopen';
export const ROOM_ACTIONS_REOPEN_ROOM_CODE = 'ACT002';
export const ROOM_ACTIONS_REOPEN_ROOM_NAME = 'Álgebra Lineal · Secc 5';

export const ROOM_ACTIONS_DELETE_ROOM_ID = 'e2e-room-actions-delete';
export const ROOM_ACTIONS_DELETE_ROOM_CODE = 'ACT003';
export const ROOM_ACTIONS_DELETE_ROOM_NAME = 'Termodinámica · Secc 6';

/**
 * Sala cerrada exclusiva de la regresión del Escenario 2 (el alumno con el
 * código de una sala cerrada sigue viendo "Esta sala ya no acepta
 * respuestas"). Separada de las tres de arriba porque nadie la reabre.
 */
export const ROOM_ACTIONS_CLOSED_ROOM_ID = 'e2e-room-actions-closed';
export const ROOM_ACTIONS_CLOSED_ROOM_CODE = 'ACT004';
export const ROOM_ACTIONS_CLOSED_ROOM_NAME = 'Estadística · Secc 7';
