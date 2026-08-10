import { test, expect } from '@playwright/test';
import {
  LANDING_HELPER_EMAIL,
  LANDING_HELPER_PASSWORD,
  LANDING_ROOM_CODE,
  LANDING_CLOSED_ROOM_CODE,
  LANDING_UNKNOWN_CODE,
} from './fixtures';

/**
 * RC-015 (HU-13): landing pública en `/`. Cubre los 5 escenarios de
 * `docs/hu-13-landing.md`, la decisión D4 (sala cerrada) y la D2 (el
 * diagnóstico de Firebase se mudó a `/health`).
 */
test.describe('Landing pública', () => {
  test('sin sesión, / muestra la landing completa (Escenario 1)', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: 'MatchClass' })).toBeVisible();
    await expect(page.getByText('Coordinación de ayudantías sin fricción')).toBeVisible();

    await expect(page.getByPlaceholder('Ingresa el código de tu sala')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Cómo funciona' })).toBeVisible();
    await expect(page.locator('.mc-landing-card')).toHaveCount(3);
    await expect(page.getByRole('heading', { name: 'Crea una sala' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Comparte el código' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Descubre el mejor horario' })).toBeVisible();

    await expect(page.getByText('¿Eres ayudante?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inicia sesión' })).toBeVisible();
  });

  test('código válido redirige a /acceso con el tab Alumno y el código precargado (Escenario 2)', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByPlaceholder('Ingresa el código de tu sala').fill(LANDING_ROOM_CODE);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(`/acceso?tipo=alumno&codigo=${LANDING_ROOM_CODE}`);
    await expect(page.getByRole('tab', { name: 'Alumno' })).toHaveAttribute('aria-selected', 'true');

    const cells = page.locator('.mc-code-cell');
    for (let i = 0; i < LANDING_ROOM_CODE.length; i += 1) {
      await expect(cells.nth(i)).toHaveValue(LANDING_ROOM_CODE[i] ?? '');
    }
  });

  test('código inexistente muestra el error sin cambiar la URL (Escenario 3)', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Ingresa el código de tu sala').fill(LANDING_UNKNOWN_CODE);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert')).toHaveText('Código inválido. Revisa con tu ayudante');
    await expect(page).toHaveURL('/');
    await expect(page.locator('.mc-landing-code__bar--error')).toBeVisible();
  });

  test('"Inicia sesión" navega a /acceso con el tab Ayudante activo (Escenario 4)', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Inicia sesión' }).click();

    await expect(page).toHaveURL('/acceso');
    await expect(page.getByRole('tab', { name: 'Ayudante' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('con sesión de ayudante activa, / redirige a /dashboard (Escenario 5)', async ({ page }) => {
    await page.goto('/acceso');
    await page.getByLabel('Email', { exact: true }).fill(LANDING_HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill(LANDING_HELPER_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Mis salas' })).toBeVisible();
  });

  test('código de una sala cerrada redirige igual y el error lo da /acceso (D4)', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByPlaceholder('Ingresa el código de tu sala').fill(LANDING_CLOSED_ROOM_CODE);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // La landing no muestra error propio: solo verifica que la sala exista.
    await expect(page).toHaveURL(`/acceso?tipo=alumno&codigo=${LANDING_CLOSED_ROOM_CODE}`);

    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('alert')).toHaveText('Esta sala ya no acepta respuestas');
  });

  test('/health sigue mostrando el diagnóstico de Firebase, y / ya no (D2)', async ({ page }) => {
    await page.goto('/health');
    await expect(page.getByText('Firebase Auth')).toBeVisible();
    await expect(page.getByText('Cloud Firestore')).toBeVisible();

    await page.goto('/');
    await expect(page.getByText('Firebase Auth')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'MatchClass' })).toBeVisible();
  });
});
