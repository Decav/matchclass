import { test, expect, type Page } from '@playwright/test';
import {
  ROOM_BLOCKS_HELPER_EMAIL,
  ROOM_BLOCKS_HELPER_PASSWORD,
  ROOM_BLOCKS_PRELOADED_ROOM_ID,
} from './fixtures';

/**
 * RC-010 (HU-08): configurar restricciones horarias del ayudante. Cubre los
 * Escenarios 1 (marcar y guardar, con re-lectura post-guardado) y 2 (precarga
 * de una sala con `helperBlockedSlots` ya sembrados) de
 * `docs/hu-08-restricciones-ayudante.md`.
 */
async function login(page: Page, email: string, password: string) {
  await page.goto('/acceso');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/dashboard');
}

// Celda 3 = fila 0 (08:15–09:25), columna 2 (Miércoles) → 0*5+2+1.
const CELL_3_LABEL = 'Miércoles, 08:15 – 09:25';
// Celda 8 = fila 1 (09:40–10:50), columna 2 (Miércoles) → 1*5+2+1.
const CELL_8_LABEL = 'Miércoles, 09:40 – 10:50';

test.describe('Restricciones del ayudante', () => {
  test('marcar bloques, guardar, y confirmar releyendo el documento sembrado (Escenario 1)', async ({ page }) => {
    await login(page, ROOM_BLOCKS_HELPER_EMAIL, ROOM_BLOCKS_HELPER_PASSWORD);

    // Sala nueva vía el flujo real de `/salas/nueva` (RC-009) — arranca
    // siempre con `helperBlockedSlots: []`, sin depender de un doc sembrado
    // que un run anterior pudo haber dejado con bloques ya marcados.
    await page.goto('/salas/nueva');
    const roomName = `Sala Bloques E2E ${Date.now()}`;
    await page.getByLabel('Nombre de la sala').fill(roomName);
    await page.getByLabel('Asignatura').fill('Programación');
    await page.getByLabel('Sección').fill('1');
    await page.getByRole('button', { name: 'Crear sala' }).click();
    await expect(page.getByRole('heading', { name: '¡Sala creada!' })).toBeVisible();

    await page.getByRole('button', { name: 'Configurar mis bloques' }).click();
    await expect(page).toHaveURL(/\/salas\/[^/]+\/bloques$/);
    const roomUrl = page.url();

    await expect(page.getByRole('heading', { name: 'Configura tus bloques ocupados' })).toBeVisible();
    const saveButton = page.getByRole('button', { name: 'Guardar cambios' });
    await expect(saveButton).toBeDisabled();

    await page.getByRole('button', { name: CELL_3_LABEL }).click();
    await page.getByRole('button', { name: CELL_8_LABEL }).click();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page.getByRole('status')).toHaveText('Cambios guardados');
    // El toast se autodescarta (~1.5s) y ahí navega a /dashboard (Escenario 1).
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Re-lectura: vuelve directo a la misma sala y confirma que las 2 celdas
    // marcadas quedaron persistidas en `helperBlockedSlots`.
    await page.goto(roomUrl);
    await expect(page.getByRole('button', { name: CELL_3_LABEL })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: CELL_8_LABEL })).toHaveAttribute('aria-pressed', 'true');
    // "Guardar cambios" vuelve a deshabilitado: lo recién guardado ya es lo precargado.
    await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  test('abrir una sala con restricciones ya sembradas marca las celdas correctas (Escenario 2)', async ({
    page,
  }) => {
    await login(page, ROOM_BLOCKS_HELPER_EMAIL, ROOM_BLOCKS_HELPER_PASSWORD);

    await page.goto(`/salas/${ROOM_BLOCKS_PRELOADED_ROOM_ID}/bloques`);
    await expect(page.getByRole('heading', { name: 'Configura tus bloques ocupados' })).toBeVisible();

    // `ROOM_BLOCKS_PRELOADED_SLOTS = [2, 4, 6, 8]` (fixtures.ts) — celda 2 =
    // fila 0, columna 1 (Martes, 08:15–09:25); celda 4 = fila 0, columna 3
    // (Jueves, 08:15–09:25).
    await expect(page.getByRole('button', { name: 'Martes, 08:15 – 09:25' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Jueves, 08:15 – 09:25' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // El resto queda libre — ej. la celda 1 (Lunes, 08:15–09:25).
    await expect(page.getByRole('button', { name: 'Lunes, 08:15 – 09:25' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });
});
