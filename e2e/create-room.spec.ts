import { test, expect, type Page } from '@playwright/test';
import { CREATE_ROOM_HELPER_EMAIL, CREATE_ROOM_HELPER_PASSWORD } from './fixtures';

/**
 * RC-009 (HU-07): crear sala. Cubre los Escenarios 1 (flujo feliz, con el
 * código generado apareciendo luego en el dashboard — Escenario 5 también) y
 * 3 (cancelar) de `docs/hu-07-crear-sala.md`.
 */
async function login(page: Page, email: string, password: string) {
  await page.goto('/acceso');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/dashboard');
}

test.describe('Crear sala', () => {
  test('flujo feliz: formulario → confirmación con código válido → aparece en el dashboard (Escenario 1, 5)', async ({
    page,
  }) => {
    await login(page, CREATE_ROOM_HELPER_EMAIL, CREATE_ROOM_HELPER_PASSWORD);

    // Navegación directa (no vía el link del dashboard): esta cuenta puede o
    // no tener salas ya sembradas por una corrida anterior de este mismo
    // spec, y el dashboard muestra "Crear primera sala" (empty state) o
    // "Nueva sala" (con salas) según ese conteo — `dashboard.spec.ts` ya
    // cubre ambos links por separado.
    await page.goto('/salas/nueva');
    await expect(page.getByRole('heading', { name: 'Crear nueva sala' })).toBeVisible();

    const roomName = `Sala E2E ${Date.now()}`;
    await page.getByLabel('Nombre de la sala').fill(roomName);
    await page.getByLabel('Asignatura').fill('Programación');
    await page.getByLabel('Sección').fill('1');
    await page.getByRole('button', { name: 'Crear sala' }).click();

    await expect(page.getByRole('heading', { name: '¡Sala creada!' })).toBeVisible();
    await expect(page.getByText(roomName)).toBeVisible();

    const code = await page.locator('.mc-create-room-code-box').innerText();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);

    await page.getByRole('button', { name: 'Ir al dashboard' }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(roomName)).toBeVisible();
    await expect(page.getByText(code)).toBeVisible();
  });

  test('cancelar desde el formulario vuelve al dashboard sin crear la sala (Escenario 3)', async ({ page }) => {
    await login(page, CREATE_ROOM_HELPER_EMAIL, CREATE_ROOM_HELPER_PASSWORD);

    await page.goto('/salas/nueva');
    const roomName = `Sala Cancelada E2E ${Date.now()}`;
    await page.getByLabel('Nombre de la sala').fill(roomName);
    await page.getByLabel('Asignatura').fill('Programación');
    await page.getByLabel('Sección').fill('1');

    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(roomName)).not.toBeVisible();
  });
});
