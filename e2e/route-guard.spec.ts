import { test, expect } from '@playwright/test';
import { HELPER_EMAIL, HELPER_PASSWORD } from './fixtures';

/**
 * RC-005 (HU-03): guard de `/dashboard` vía `Q5ProtectedRoute`. Cubre los
 * escenarios 1, 2 y 3 de `docs/hu-03-guard-rutas.md` — el escenario 4 (sin
 * flash de `/acceso` durante la restauración de sesión) ya está cubierto por
 * el test "sesión ya activa..." de `auth.spec.ts`, y el 5 (logout) queda
 * fuera de alcance de este RC.
 */
test.describe('Q5ProtectedRoute', () => {
  test('sesión activa → /dashboard se renderiza directo, sin pasar por /acceso (Escenario 1)', async ({
    page,
  }) => {
    await page.goto('/acceso');
    await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
    await page.getByLabel('Contraseña', { exact: true }).fill(HELPER_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/dashboard');

    // Navegación directa con sesión ya activa: nunca debe pasar por /acceso.
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Mis salas' })).toBeVisible();
  });

  test('sin sesión → /dashboard redirige a /acceso, la URL cambia, y "atrás" no vuelve a /dashboard (Escenario 2)', async ({
    page,
  }) => {
    // Cada test de Playwright arranca con un contexto de navegador nuevo
    // (sin IndexedDB compartido) — no hay sesión de Firebase restaurable.
    // Se visita `/` primero para tener una entrada de historial previa real
    // (distinta de `about:blank`) contra la cual verificar "atrás".
    await page.goto('/');
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/acceso');
    await expect(page.getByRole('tablist')).toBeVisible();

    // `replace` en la redirección: la entrada de `/dashboard` en el
    // historial fue reemplazada por `/acceso`, así que "atrás" va a `/`, no
    // a `/dashboard`.
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('sin sesión → /, /acceso, /registro se renderizan sin redirección (Escenario 3)', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');

    await page.goto('/acceso');
    await expect(page).toHaveURL('/acceso');
    await expect(page.getByRole('tablist')).toBeVisible();

    await page.goto('/registro');
    await expect(page).toHaveURL('/registro');
  });
});
