import { test, expect, type Page } from '@playwright/test';
import {
  STUDENT_GRID_ROOM_CODE,
  STUDENT_GRID_ROOM_NAME,
  STUDENT_GRID_CLOSED_ROOM_ID,
} from './fixtures';

/**
 * RC-013 (HU-11): grilla de bloques del alumno. Cubre los Escenarios 1, 2
 * y 3 en un solo flujo continuo — el Escenario 3 (precarga) solo tiene
 * sentido después de haber enviado una respuesta, y separarlo en dos tests
 * obligaría a compartir la misma sesión anónima entre workers.
 *
 * El Escenario 6 (código de sala cerrada) ya está cubierto por
 * `room-actions.spec.ts`; acá se prueba la otra puerta: entrar por URL
 * directa a `/sala/:roomId` de una sala cerrada (RC-013 D3).
 */
const CELL_1 = 'Lunes, 08:15 – 09:25';
const CELL_2 = 'Martes, 08:15 – 09:25';
const CELL_8 = 'Miércoles, 09:40 – 10:50';
const CELL_13 = 'Miércoles, 11:05 – 12:15';

async function fillRoomCode(page: Page, code: string) {
  const cells = page.locator('.mc-code-cell');
  for (let i = 0; i < code.length; i += 1) {
    await cells.nth(i).fill(code[i] ?? '');
  }
}

async function enterAsStudent(page: Page, studentName: string) {
  await page.goto('/acceso?tipo=alumno');
  await fillRoomCode(page, STUDENT_GRID_ROOM_CODE);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByText(STUDENT_GRID_ROOM_NAME)).toBeVisible();
  await page.getByLabel('Tu nombre').fill(studentName);
  await page.getByRole('button', { name: 'Entrar a la grilla' }).click();
  await expect(page).toHaveURL(/\/sala\/.+/);
}

test.describe('Grilla del alumno', () => {
  test('código → nombre → marcar bloques → enviar → recargar precargado (Escenarios 1, 2, 3)', async ({
    page,
  }) => {
    await enterAsStudent(page, 'Juan Pérez');

    // Escenario 1: grilla vacía, header con la sala, botón deshabilitado.
    await expect(page.getByText('Estás respondiendo a')).toBeVisible();
    await expect(page.getByText(STUDENT_GRID_ROOM_NAME)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Marca los bloques donde tienes clase' })).toBeVisible();
    await expect(page.getByRole('button', { pressed: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();

    // Escenario 2: marcar 4 celdas y enviar.
    for (const cell of [CELL_1, CELL_2, CELL_8, CELL_13]) {
      await page.getByRole('button', { name: cell }).click();
    }
    await expect(page.getByRole('status')).toContainText('Cambios sin guardar');

    await page.getByRole('button', { name: 'Enviar respuesta' }).click();
    await expect(page.getByText('Respuesta enviada')).toBeVisible();

    // Escenario 3: recargar precarga esas mismas celdas desde Firestore.
    await page.reload();
    await expect(page.getByRole('button', { name: CELL_1 })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { pressed: true })).toHaveCount(4);
    await expect(page.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();

    // Escenario 3 (segunda mitad): desmarcar una celda, enviar y recargar.
    await page.getByRole('button', { name: CELL_2 }).click();
    await page.getByRole('button', { name: 'Enviar respuesta' }).click();
    await expect(page.getByText('Respuesta enviada')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { pressed: true })).toHaveCount(3);
    await expect(page.getByRole('button', { name: CELL_2 })).toHaveAttribute('aria-pressed', 'false');
  });

  test('URL directa a una sala cerrada muestra el mensaje y ninguna grilla (RC-013 D3)', async ({ page }) => {
    // Primero se pasa por el flujo real para tener sesión anónima; sin ella
    // la pantalla redirige a /acceso y no se probaría el caso de la sala.
    await enterAsStudent(page, 'María López');

    await page.goto(`/sala/${STUDENT_GRID_CLOSED_ROOM_ID}`);

    await expect(page.getByText('Esta sala ya no acepta respuestas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar respuesta' })).toHaveCount(0);
  });

  test('sin sesión anónima, /sala/:roomId redirige a /acceso', async ({ page }) => {
    await page.goto(`/sala/${STUDENT_GRID_CLOSED_ROOM_ID}`);

    await expect(page).toHaveURL(/\/acceso/);
    await expect(page.getByRole('tab', { name: 'Alumno' })).toHaveAttribute('aria-selected', 'true');
  });
});
