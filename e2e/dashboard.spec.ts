import { test, expect, type Page } from '@playwright/test';
import {
  DASHBOARD_HELPER_EMAIL,
  DASHBOARD_HELPER_PASSWORD,
  DASHBOARD_HELPER_DISPLAY_NAME,
  DASHBOARD_ACTIVE_ROOM_NAME,
  DASHBOARD_ACTIVE_ROOM_CODE,
  DASHBOARD_ACTIVE_ROOM_RESPONSES,
  DASHBOARD_ACTIVE_ROOM_STUDENT_LIMIT,
  DASHBOARD_ACTIVE_ROOM_2_NAME,
  DASHBOARD_ACTIVE_ROOM_2_RESPONSES,
  DASHBOARD_CLOSED_ROOM_NAME,
  DASHBOARD_TOTAL_ROOMS,
  DASHBOARD_ACTIVE_ROOMS_COUNT,
  DASHBOARD_TOTAL_RESPONSES,
  EMPTY_HELPER_EMAIL,
  EMPTY_HELPER_PASSWORD,
} from './fixtures';

/**
 * RC-008 (HU-06): dashboard real del ayudante. Cubre los Escenarios 1
 * (con salas) y 2 (empty state) de `docs/hu-06-dashboard-ayudante.md`. El
 * Escenario 7 (sin sesión -> redirige a /acceso) ya está cubierto por
 * `route-guard.spec.ts` — solo se confirma ahí que el dashboard real no
 * rompe ese guard.
 */
async function login(page: Page, email: string, password: string) {
  await page.goto('/acceso');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/dashboard');
}

function kpiValue(page: Page, label: string) {
  return page.locator('.mc-kpi-card', { hasText: label }).locator('.mc-kpi-card__value');
}

test.describe('Dashboard del ayudante', () => {
  test('con salas sembradas muestra KPIs reales, salas activas y pasadas (Escenario 1)', async ({ page }) => {
    await login(page, DASHBOARD_HELPER_EMAIL, DASHBOARD_HELPER_PASSWORD);

    await expect(page.getByRole('heading', { name: 'Mis salas' })).toBeVisible();
    await expect(page.getByText(DASHBOARD_HELPER_DISPLAY_NAME)).toBeVisible();

    await expect(kpiValue(page, 'Salas totales')).toHaveText(String(DASHBOARD_TOTAL_ROOMS));
    await expect(kpiValue(page, 'Respuestas recibidas')).toHaveText(String(DASHBOARD_TOTAL_RESPONSES));
    await expect(kpiValue(page, 'Salas activas')).toHaveText(String(DASHBOARD_ACTIVE_ROOMS_COUNT));

    // Sala activa con studentLimit: fracción + barra de progreso (RC-008 §10).
    await expect(page.getByText(DASHBOARD_ACTIVE_ROOM_NAME)).toBeVisible();
    await expect(page.getByText(DASHBOARD_ACTIVE_ROOM_CODE)).toBeVisible();
    await expect(
      page.getByText(
        `${DASHBOARD_ACTIVE_ROOM_RESPONSES}/${DASHBOARD_ACTIVE_ROOM_STUDENT_LIMIT} alumnos respondieron`,
      ),
    ).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible();

    // Sala activa sin studentLimit: solo el conteo, sin fracción ni barra.
    await expect(page.getByText(DASHBOARD_ACTIVE_ROOM_2_NAME)).toBeVisible();
    await expect(page.getByText(`${DASHBOARD_ACTIVE_ROOM_2_RESPONSES} alumnos respondieron`)).toBeVisible();

    // Sala pasada: compacta, con badge "Cerrada".
    await expect(page.getByText(DASHBOARD_CLOSED_ROOM_NAME)).toBeVisible();
    await expect(page.getByText('Cerrada')).toBeVisible();
  });

  test('sin salas muestra el empty state "Aún no tienes salas" (Escenario 2)', async ({ page }) => {
    await login(page, EMPTY_HELPER_EMAIL, EMPTY_HELPER_PASSWORD);

    await expect(page.getByText('Aún no tienes salas')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crear primera sala' })).toBeVisible();

    await page.getByRole('link', { name: 'Crear primera sala' }).click();
    await expect(page).toHaveURL('/salas/nueva');
  });
});
