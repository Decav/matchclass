import { test, expect, type Page } from '@playwright/test';
import { ACTIVE_ROOM_CODE, ACTIVE_ROOM_NAME, RETURNING_ROOM_CODE, RETURNING_ROOM_NAME } from './fixtures';

async function fillRoomCode(page: Page, code: string) {
  const cells = page.locator('.mc-code-cell');
  for (let i = 0; i < code.length; i += 1) {
    await cells.nth(i).fill(code[i] ?? '');
  }
}

test.describe('Tab Alumno', () => {
  test('código válido de sala nueva -> nombre -> grilla (Escenarios 9, 14)', async ({ page }) => {
    await page.goto('/acceso?tipo=alumno');

    await fillRoomCode(page, ACTIVE_ROOM_CODE);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByText(ACTIVE_ROOM_NAME)).toBeVisible();

    await page.getByLabel('Tu nombre').fill('Juan Pérez');
    await page.getByRole('button', { name: 'Entrar a la grilla' }).click();

    await expect(page).toHaveURL(/\/sala\/.+/);
    await expect(page.getByText('Grilla en construcción')).toBeVisible();
  });

  test('código de sala donde ya respondió salta directo a la grilla (Escenario 16)', async ({
    page,
  }) => {
    await page.goto('/acceso?tipo=alumno');
    await fillRoomCode(page, RETURNING_ROOM_CODE);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText(RETURNING_ROOM_NAME)).toBeVisible();

    await page.getByLabel('Tu nombre').fill('María López');
    await page.getByRole('button', { name: 'Entrar a la grilla' }).click();
    await expect(page).toHaveURL(/\/sala\/.+/);
    const roomUrl = page.url();

    // Misma sesión anónima (persistida en IndexedDB del mismo contexto):
    // volver a ingresar el código no debe volver a pedir el nombre.
    await page.goto('/acceso?tipo=alumno');
    await fillRoomCode(page, RETURNING_ROOM_CODE);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page).toHaveURL(roomUrl);
    await expect(page.getByLabel('Tu nombre')).not.toBeVisible();
  });
});
