import { test, expect } from '@playwright/test';
import { HELPER_EMAIL } from './fixtures';

test.describe('Registro de ayudante', () => {
  test('registro exitoso crea la cuenta y redirige a /dashboard (Escenario 1)', async ({
    page,
  }) => {
    const email = `nuevo.${Date.now()}@matchclass.cl`;

    await page.goto('/registro');

    await page.getByLabel('Nombre completo').fill('Ayudante Nuevo');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Contraseña', { exact: true }).fill('Secreta123!');
    await page.getByLabel('Confirmar contraseña').fill('Secreta123!');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard en construcción')).toBeVisible();
  });

  test('email ya registrado muestra error sin redirigir (Escenario 2)', async ({ page }) => {
    await page.goto('/registro');

    await page.getByLabel('Nombre completo').fill('Ayudante Duplicado');
    await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill('Secreta123!');
    await page.getByLabel('Confirmar contraseña').fill('Secreta123!');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page.getByRole('alert')).toHaveText('Este email ya está registrado. Inicia sesión');
    await expect(page).toHaveURL('/registro');
  });

  test('link "Inicia sesión" vuelve a /acceso', async ({ page }) => {
    await page.goto('/registro');
    await page.getByRole('link', { name: 'Inicia sesión' }).click();
    await expect(page).toHaveURL('/acceso');
  });
});
