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

/**
 * Salas de `student-grid.spec.ts` (RC-013, HU-11), del mismo ayudante
 * genérico. Cada test tiene la suya y se resiembran con `reset: true`: el
 * spec escribe `occupiedBlocks` en la subcolección `responses`, así que un
 * run dejaría al siguiente con bloques ya marcados. El borrado de las
 * respuestas previas lo hace `resetResponses` en `global-setup.ts`.
 */
export const STUDENT_GRID_ROOM_ID = 'e2e-student-grid';
export const STUDENT_GRID_ROOM_CODE = 'GRD001';
export const STUDENT_GRID_ROOM_NAME = 'Programación Avanzada · Secc 2';

/** Sala cerrada para probar la entrada por URL directa a `/sala/:roomId` (RC-013 D3). */
export const STUDENT_GRID_CLOSED_ROOM_ID = 'e2e-student-grid-closed';
export const STUDENT_GRID_CLOSED_ROOM_CODE = 'GRD002';
export const STUDENT_GRID_CLOSED_ROOM_NAME = 'Redes de Computadores · Secc 1';

/**
 * Cuenta y salas de `results.spec.ts` (RC-014, HU-12), aisladas del resto.
 * La sala "con datos" se siembra con respuestas fijas y bloqueos conocidos
 * para poder afirmar porcentajes exactos; el spec solo lee, nunca escribe
 * sobre ella (el test de tiempo real usa su propia sala).
 */
export const RESULTS_HELPER_EMAIL = 'ayudante.resultados.e2e@matchclass.cl';
export const RESULTS_HELPER_PASSWORD = 'Test1234!';
export const RESULTS_HELPER_DISPLAY_NAME = 'Ayudante Resultados E2E';

export const RESULTS_ROOM_ID = 'e2e-results-room';
export const RESULTS_ROOM_CODE = 'RES001';
export const RESULTS_ROOM_NAME = 'Álgebra Abstracta · Secc 1';
/** Bloqueos del ayudante: se muestran en gris con "—" (HU-12 Escenario 1). */
export const RESULTS_ROOM_BLOCKED_SLOTS = [4, 23, 33];
/**
 * 4 respuestas sembradas: la celda 1 la ocupan 3 de 4 (25% → `low`), la
 * celda 2 la ocupan los 4 (0% → `conflict`), y el resto queda al 100%.
 */
export const RESULTS_ROOM_RESPONSES: number[][] = [[1, 2], [1, 2], [1, 2], [2]];
export const RESULTS_ROOM_TOTAL = RESULTS_ROOM_RESPONSES.length;

/** Sala del mismo ayudante, sin respuestas — Escenario 3 (empty state). */
export const RESULTS_EMPTY_ROOM_ID = 'e2e-results-empty';
export const RESULTS_EMPTY_ROOM_CODE = 'RES002';
export const RESULTS_EMPTY_ROOM_NAME = 'Topología · Secc 1';

/** Sala del test de tiempo real: el alumno responde con la pantalla abierta (Escenario 4). */
export const RESULTS_LIVE_ROOM_ID = 'e2e-results-live';
export const RESULTS_LIVE_ROOM_CODE = 'RES003';
export const RESULTS_LIVE_ROOM_NAME = 'Teoría de Grafos · Secc 1';

/**
 * Cuenta y salas de `landing.spec.ts` (RC-015, HU-13), aisladas del resto.
 * Las dos salas son de solo lectura para este spec: la landing únicamente
 * consulta `findByCode` y redirige, así que no hace falta `reset: true`.
 * El helper propio existe para el Escenario 5 (sesión activa → `/dashboard`)
 * sin cruzarse con los specs que corren en paralelo sobre otras cuentas.
 */
export const LANDING_HELPER_EMAIL = 'ayudante.landing.e2e@matchclass.cl';
export const LANDING_HELPER_PASSWORD = 'Test1234!';
export const LANDING_HELPER_DISPLAY_NAME = 'Ayudante Landing E2E';

export const LANDING_ROOM_ID = 'e2e-landing-room';
export const LANDING_ROOM_CODE = 'LND001';
export const LANDING_ROOM_NAME = 'Sistemas Operativos · Secc 1';

/** Sala cerrada: la landing redirige igual y el error lo da `/acceso` (D4). */
export const LANDING_CLOSED_ROOM_ID = 'e2e-landing-closed';
export const LANDING_CLOSED_ROOM_CODE = 'LND002';
export const LANDING_CLOSED_ROOM_NAME = 'Compiladores · Secc 1';

/** Código que ninguna sala sembrada usa — Escenario 3. */
export const LANDING_UNKNOWN_CODE = 'ZZZZZZ';

/**
 * Sala propia de `mobile.spec.ts` (RC-020, HU-17). Existe aparte de
 * `STUDENT_GRID_ROOM_*` porque entrar como alumno **escribe**: el paso del
 * nombre crea el documento de respuesta antes de mostrar la grilla. Compartir la
 * sala metería respuestas ajenas en el conjunto que afirma otro spec, y los dos
 * corren en paralelo (`fullyParallel: true`).
 *
 * Se resiembra con `reset: true` y se le borran las respuestas: el uid anónimo
 * es distinto en cada corrida, así que sin el borrado el run siguiente arrancaría
 * con celdas ya marcadas.
 */
export const MOBILE_GRID_ROOM_ID = 'e2e-mobile-grid';
export const MOBILE_GRID_ROOM_CODE = 'MOB001';
export const MOBILE_GRID_ROOM_NAME = 'Cálculo Diferencial · Secc 8';
