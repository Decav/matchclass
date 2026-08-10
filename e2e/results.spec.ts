import { test, expect, type Page } from '@playwright/test';
import {
  RESULTS_HELPER_EMAIL,
  RESULTS_HELPER_PASSWORD,
  RESULTS_ROOM_ID,
  RESULTS_ROOM_NAME,
  RESULTS_ROOM_BLOCKED_SLOTS,
  RESULTS_ROOM_TOTAL,
  RESULTS_EMPTY_ROOM_ID,
  RESULTS_LIVE_ROOM_ID,
  RESULTS_LIVE_ROOM_CODE,
  RESULTS_LIVE_ROOM_NAME,
} from './fixtures';

/**
 * RC-014 (HU-12): heatmap y ranking. Escenarios 1, 2, 3 y 4.
 *
 * Los porcentajes afirmados salen de las respuestas sembradas en
 * `global-setup.ts` (`RESULTS_ROOM_RESPONSES`): 3 de 4 alumnos ocupan la
 * celda 1 (25%), los 4 ocupan la celda 2 (0%), el resto queda al 100%.
 */
async function loginAsResultsHelper(page: Page) {
  await page.goto('/acceso');
  await page.getByLabel('Email', { exact: true }).fill(RESULTS_HELPER_EMAIL);
  await page.getByLabel('Contraseña', { exact: true }).fill(RESULTS_HELPER_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/dashboard');
}

function cells(page: Page) {
  return page.locator('.mc-heatmap__cell');
}

async function fillRoomCode(page: Page, code: string) {
  const codeCells = page.locator('.mc-code-cell');
  for (let i = 0; i < code.length; i += 1) {
    await codeCells.nth(i).fill(code[i] ?? '');
  }
}

test.describe('Resultados de la sala', () => {
  test('"Abrir" desde el dashboard lleva al heatmap con porcentajes y bloqueos (Escenarios 1, 2)', async ({
    page,
  }) => {
    await loginAsResultsHelper(page);

    const card = page.locator('.mc-room-card', { hasText: RESULTS_ROOM_NAME });
    await card.getByRole('link', { name: 'Abrir' }).click();

    await expect(page).toHaveURL(`/salas/${RESULTS_ROOM_ID}`);
    await expect(page.getByText('Mapa de disponibilidad')).toBeVisible();
    await expect(page.getByText(`${RESULTS_ROOM_TOTAL} alumnos respondieron`)).toBeVisible();

    // Las 50 celdas, con el porcentaje como texto (el color no es el único canal).
    await expect(cells(page)).toHaveCount(50);
    await expect(cells(page).nth(0)).toHaveText('25%');
    await expect(cells(page).nth(1)).toHaveText('0%');

    // Las tres bloqueadas: gris con guion, sin importar su porcentaje real.
    await expect(page.locator('.mc-heatmap__cell--blocked')).toHaveCount(RESULTS_ROOM_BLOCKED_SLOTS.length);
    for (const slot of RESULTS_ROOM_BLOCKED_SLOTS) {
      await expect(cells(page).nth(slot - 1)).toHaveText('—');
    }

    // Leyenda con los 5 estados.
    await expect(page.getByText('≥70% disponible')).toBeVisible();
    await expect(page.getByText('Bloqueado')).toBeVisible();

    // Ranking: 3 ítems, ninguno de una celda bloqueada (las 3 están al 100%).
    const ranking = page.locator('.mc-ranking-item');
    await expect(ranking).toHaveCount(3);
    await expect(ranking.first()).toContainText('100%');
    await expect(ranking.first()).toContainText(`${RESULTS_ROOM_TOTAL}/${RESULTS_ROOM_TOTAL} alumnos`);
    await expect(page.locator('.mc-ranking-item', { hasText: 'Jueves 1-2' })).toHaveCount(0);
  });

  test('la pestaña "Respuestas" aparece inactiva junto a "Resultados"', async ({ page }) => {
    await loginAsResultsHelper(page);
    await page.goto(`/salas/${RESULTS_ROOM_ID}`);

    await expect(page.locator('.mc-results-tabs__tab--active')).toHaveText('Resultados');
    await expect(page.locator('.mc-results-tabs__tab', { hasText: 'Respuestas' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Respuestas' })).toHaveCount(0);
  });

  test('sala sin respuestas muestra el empty state (Escenario 3)', async ({ page }) => {
    await loginAsResultsHelper(page);
    await page.goto(`/salas/${RESULTS_EMPTY_ROOM_ID}`);

    await expect(page.getByText('Nadie respondió todavía')).toBeVisible();
    await expect(page.getByText('Comparte el código de la sala con tus alumnos', { exact: false })).toBeVisible();
    await expect(page.locator('.mc-ranking-item')).toHaveCount(0);
    await expect(cells(page)).toHaveCount(0);
  });

  test('una respuesta nueva actualiza el heatmap sin recargar (Escenario 4)', async ({ page, browser }) => {
    await loginAsResultsHelper(page);
    await page.goto(`/salas/${RESULTS_LIVE_ROOM_ID}`);

    await expect(page.getByText('Nadie respondió todavía')).toBeVisible();

    // Otro contexto = otra sesión anónima: el alumno responde en paralelo,
    // con la pantalla de resultados abierta y sin tocarla.
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    await studentPage.goto('/acceso?tipo=alumno');
    await fillRoomCode(studentPage, RESULTS_LIVE_ROOM_CODE);
    await studentPage.getByRole('button', { name: 'Ingresar' }).click();
    await expect(studentPage.getByText(RESULTS_LIVE_ROOM_NAME)).toBeVisible();
    await studentPage.getByLabel('Tu nombre').fill('Alumno Tiempo Real');
    await studentPage.getByRole('button', { name: 'Entrar a la grilla' }).click();
    await studentPage.getByRole('button', { name: 'Lunes, 08:15 – 09:25' }).click();
    await studentPage.getByRole('button', { name: 'Enviar respuesta' }).click();
    await expect(studentPage.getByText('Respuesta enviada')).toBeVisible();

    // La pantalla del ayudante se recalcula sola: ningún reload de por medio.
    await expect(page.getByText('1 alumno respondió')).toBeVisible();
    await expect(cells(page).nth(0)).toHaveText('0%');
    await expect(cells(page).nth(1)).toHaveText('100%');

    await studentContext.close();
  });
});
