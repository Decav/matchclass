import { test, expect } from '@playwright/test';
import { HELPER_EMAIL, HELPER_PASSWORD } from './fixtures';

/**
 * RC-006 (HU-04): cierre de sesión desde `/dashboard`. Cubre los 3
 * escenarios de `docs/hu-04-cierre-sesion.md`.
 */
test.describe('Cierre de sesión', () => {
  test('sesión activa → clic en "Cerrar sesión" redirige a /acceso con tab Ayudante vacío (Escenario 1)', async ({
    page,
  }) => {
    await page.goto('/acceso');
    await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill(HELPER_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL('/acceso');
    await expect(page.getByRole('tab', { name: 'Ayudante' })).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('Contraseña', { exact: true })).toHaveValue('');
  });

  test('tras cerrar sesión, navegar a /dashboard redirige de nuevo a /acceso (Escenario 2)', async ({
    page,
  }) => {
    await page.goto('/acceso');
    await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill(HELPER_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL('/acceso');

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/acceso');
    await expect(page.getByRole('tablist')).toBeVisible();
  });

  test('tras cerrar sesión, recargar la página sigue en /acceso sin sesión restaurada (Escenario 3)', async ({
    page,
  }) => {
    await page.goto('/acceso');
    await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill(HELPER_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL('/acceso');

    await page.reload();

    await expect(page).toHaveURL('/acceso');
    await expect(page.getByRole('tablist')).toBeVisible();
  });
});
