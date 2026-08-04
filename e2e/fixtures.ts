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
