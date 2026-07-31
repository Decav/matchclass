import { test, expect } from '@playwright/test';
import { HELPER_EMAIL, HELPER_PASSWORD } from './fixtures';

test.describe('Tab Ayudante', () => {
  test('credenciales válidas redirige a /dashboard (Escenario 1)', async ({ page }) => {
    await page.goto('/acceso');

    await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill(HELPER_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard en construcción')).toBeVisible();
  });

  test('sesión ya activa abre la app directo en /dashboard, sin ver /acceso (Escenario 4)', async ({
    page,
  }) => {
    await page.goto('/acceso');
    await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill(HELPER_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/dashboard');

    // Firebase Auth persiste la sesión en IndexedDB del mismo contexto de
    // navegador: volver a /acceso debe redirigir de inmediato, sin tabs.
    await page.goto('/acceso');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('tablist')).not.toBeVisible();
  });

  test('credenciales inválidas muestra error sin redirigir (Escenario 2)', async ({ page }) => {
    await page.goto('/acceso');

    await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill('contraseña-incorrecta');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByRole('alert')).toHaveText('Email o contraseña incorrectos');
    await expect(page).toHaveURL('/acceso');
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue(HELPER_EMAIL);
  });
});
