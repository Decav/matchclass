import { test, expect } from '@playwright/test';
import { HELPER_EMAIL } from './fixtures';

test.describe('Recuperar contraseña', () => {
  test('email con cuenta existente muestra el estado de confirmación (Escenario 1)', async ({
    page,
  }) => {
    await page.goto('/recuperar');

    await page.getByLabel('Email').fill(HELPER_EMAIL);
    await page.getByRole('button', { name: 'Enviar link' }).click();

    await expect(page.getByRole('heading', { name: 'Revisa tu email' })).toBeVisible();
  });

  test('email sin cuenta asociada muestra el mismo estado de confirmación, sin diferencia visible (Escenario 2)', async ({
    page,
  }) => {
    const email = `nadie.${Date.now()}@matchclass.cl`;

    await page.goto('/recuperar');

    await page.getByLabel('Email').fill(email);
    await page.getByRole('button', { name: 'Enviar link' }).click();

    await expect(page.getByRole('heading', { name: 'Revisa tu email' })).toBeVisible();
  });

  test('desde la confirmación, "Volver al inicio" regresa a /acceso con el tab Ayudante activo (Escenario 6)', async ({
    page,
  }) => {
    await page.goto('/recuperar');

    await page.getByLabel('Email').fill(HELPER_EMAIL);
    await page.getByRole('button', { name: 'Enviar link' }).click();
    await expect(page.getByRole('heading', { name: 'Revisa tu email' })).toBeVisible();

    await page.getByRole('button', { name: 'Volver al inicio' }).click();

    await expect(page).toHaveURL('/acceso');
    await expect(page.getByRole('tab', { name: 'Ayudante', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
