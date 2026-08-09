import { test, expect, type Page } from '@playwright/test';
import {
  ROOM_ACTIONS_HELPER_EMAIL,
  ROOM_ACTIONS_HELPER_PASSWORD,
  ROOM_ACTIONS_CLOSE_ROOM_NAME,
  ROOM_ACTIONS_REOPEN_ROOM_NAME,
  ROOM_ACTIONS_DELETE_ROOM_NAME,
  ROOM_ACTIONS_CLOSED_ROOM_CODE,
} from './fixtures';

/**
 * RC-012 (HU-10): cerrar, reabrir y eliminar sala desde el dashboard.
 * Escenarios 1, 3 y 4 en el dashboard del ayudante, más la regresión del
 * Escenario 2 (sala cerrada sigue rechazando alumnos) — ese último ya
 * funcionaba desde RC-003, se verifica acá para que no se rompa.
 *
 * El Escenario 5 (otro ayudante no puede modificar) no tiene test propio:
 * el dashboard solo lista salas con `createdBy == uid`, así que no hay forma
 * de llegar al menú de una sala ajena desde la UI (RC-012 §6).
 *
 * Los tres primeros tests escriben sobre salas distintas a propósito
 * (`fullyParallel: true`), y `global-setup.ts` las resiembra en cada corrida.
 */
async function loginAsRoomActionsHelper(page: Page) {
  await page.goto('/acceso');
  await page.getByLabel('Email', { exact: true }).fill(ROOM_ACTIONS_HELPER_EMAIL);
  await page.getByLabel('Contraseña', { exact: true }).fill(ROOM_ACTIONS_HELPER_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/dashboard');
}

function activeCard(page: Page, roomName: string) {
  return page.locator('.mc-room-card', { hasText: roomName });
}

function pastRow(page: Page, roomName: string) {
  return page.locator('.mc-past-room-row', { hasText: roomName });
}

async function fillRoomCode(page: Page, code: string) {
  const cells = page.locator('.mc-code-cell');
  for (let i = 0; i < code.length; i += 1) {
    await cells.nth(i).fill(code[i] ?? '');
  }
}

test.describe('Ciclo de vida de la sala', () => {
  test('cerrar una sala activa la manda a "Salas pasadas" con badge "Cerrada" (Escenario 1)', async ({
    page,
  }) => {
    await loginAsRoomActionsHelper(page);

    const card = activeCard(page, ROOM_ACTIONS_CLOSE_ROOM_NAME);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: `Acciones de ${ROOM_ACTIONS_CLOSE_ROOM_NAME}` }).click();
    await page.getByRole('menuitem', { name: 'Cerrar sala' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('¿Cerrar esta sala?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Cerrar sala' }).click();

    await expect(dialog).toBeHidden();

    // Recarga: el estado nuevo tiene que venir de Firestore, no del cache.
    await page.reload();
    const row = pastRow(page, ROOM_ACTIONS_CLOSE_ROOM_NAME);
    await expect(row).toBeVisible();
    await expect(row.getByText('Cerrada')).toBeVisible();
    await expect(activeCard(page, ROOM_ACTIONS_CLOSE_ROOM_NAME)).toHaveCount(0);
  });

  test('reabrir una sala cerrada la devuelve a "Salas activas" sin diálogo (Escenario 3)', async ({
    page,
  }) => {
    await loginAsRoomActionsHelper(page);

    const row = pastRow(page, ROOM_ACTIONS_REOPEN_ROOM_NAME);
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: `Acciones de ${ROOM_ACTIONS_REOPEN_ROOM_NAME}` }).click();
    await page.getByRole('menuitem', { name: 'Reabrir sala' }).click();

    await expect(page.getByRole('alertdialog')).toHaveCount(0);

    await expect(activeCard(page, ROOM_ACTIONS_REOPEN_ROOM_NAME)).toBeVisible();
    await page.reload();
    await expect(activeCard(page, ROOM_ACTIONS_REOPEN_ROOM_NAME)).toBeVisible();
    await expect(pastRow(page, ROOM_ACTIONS_REOPEN_ROOM_NAME)).toHaveCount(0);
  });

  test('eliminar una sala la saca del dashboard por completo (Escenario 4)', async ({ page }) => {
    await loginAsRoomActionsHelper(page);

    const card = activeCard(page, ROOM_ACTIONS_DELETE_ROOM_NAME);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: `Acciones de ${ROOM_ACTIONS_DELETE_ROOM_NAME}` }).click();
    await page.getByRole('menuitem', { name: 'Eliminar sala' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('¿Eliminar esta sala?')).toBeVisible();
    await expect(dialog.getByText('Esta acción no se puede deshacer')).toBeVisible();
    await dialog.getByRole('button', { name: 'Eliminar' }).click();

    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByText(ROOM_ACTIONS_DELETE_ROOM_NAME)).toHaveCount(0);
  });

  test('(regresión) el alumno con el código de una sala cerrada no puede entrar (Escenario 2)', async ({
    page,
  }) => {
    await page.goto('/acceso?tipo=alumno');

    await fillRoomCode(page, ROOM_ACTIONS_CLOSED_ROOM_CODE);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByText('Esta sala ya no acepta respuestas')).toBeVisible();
    await expect(page).toHaveURL(/\/acceso/);
  });
});
