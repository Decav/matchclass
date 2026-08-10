import { test, expect, type Page } from '@playwright/test';
import { HELPER_EMAIL, HELPER_PASSWORD } from './fixtures';

/**
 * RC-016 (HU-14): modo oscuro. Cubre los Escenarios 1, 2, 3, 4 y 5 de
 * `docs/hu-14-modo-oscuro.md` más el requisito "sin flash" de la sección de
 * comportamiento visual. El Escenario 6 (contraste AA) no se verifica acá:
 * se mide sobre los tokens en `src/styles/theme-contrast.test.ts`.
 *
 * Este spec no escribe datos en Firestore — solo inicia sesión con el ayudante
 * genérico y alterna el tema, que vive en el `localStorage` del contexto y por
 * lo tanto está aislado entre tests.
 */

/** `--mc-surface` bajo `[data-theme='dark']` en theme.css (#0f1729). */
const DARK_SURFACE = 'rgb(15, 23, 41)';
/** `--mc-card` bajo `[data-theme='dark']` en theme.css (#1b2a4a). */
const DARK_CARD = 'rgb(27, 42, 74)';

async function login(page: Page): Promise<void> {
  await page.goto('/acceso');
  await page.getByLabel('Email', { exact: true }).fill(HELPER_EMAIL);
  await page.getByLabel('Contraseña', { exact: true }).fill(HELPER_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/dashboard');
}

/**
 * Se evalúa como `string` y no como función: el código corre en el navegador y
 * `tsconfig.node.json` (bajo el que se type-checkea `e2e/**`) no incluye la lib
 * `DOM`, así que `localStorage` no resolvería tipos acá. Mismo criterio que el
 * stub de clipboard de `dashboard.spec.ts`.
 */
async function storedTheme(page: Page): Promise<string | null> {
  return page.evaluate<string | null>("localStorage.getItem('matchclass-theme')");
}

test.describe('Modo oscuro', () => {
  test('el toggle del topbar pasa la app a oscuro y persiste la preferencia (Escenario 1)', async ({
    page,
  }) => {
    await login(page);

    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', DARK_SURFACE);
    expect(await storedTheme(page)).toBe('dark');
  });

  test('recargar mantiene el modo oscuro y el toggle muestra el sol (Escenario 3)', async ({
    page,
  }) => {
    await login(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Cambiar a modo claro' })).toBeVisible();
  });

  test('una pantalla pública se ve en oscuro tras cambiar el tema en el AppShell (Escenario 5)', async ({
    page,
  }) => {
    await login(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // `/acceso` redirige al dashboard con sesión activa, así que se llega a la
    // pantalla pública por el camino real del usuario: cerrando sesión.
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL('/acceso');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', DARK_SURFACE);
    await expect(page.getByLabel('Email', { exact: true })).toHaveCSS('background-color', DARK_CARD);
  });

  test('el tema ya está aplicado en el HTML inicial, antes de que monte React (sin flash)', async ({
    page,
  }) => {
    await page.addInitScript("localStorage.setItem('matchclass-theme', 'dark');");
    // Se bloquea el módulo de entrada: si `data-theme` está puesto con el
    // bundle caído, solo pudo aplicarlo el script inline del `<head>`. Comparar
    // tiempos tras un `goto` normal sería una carrera contra el dev server.
    await page.route('**/src/app/main.tsx*', (route) => route.abort());

    await page.goto('/', { waitUntil: 'commit' });

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#root')).toBeEmpty();
  });
});

test.describe('Modo oscuro sin preferencia guardada', () => {
  test.use({ colorScheme: 'dark' });

  test('con el sistema operativo en oscuro, la app arranca en oscuro (Escenario 4)', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', DARK_SURFACE);
    // RC-016 D2: el tema derivado del sistema no se congela en localStorage
    // mientras el usuario no elija uno con el toggle.
    expect(await storedTheme(page)).toBeNull();
  });
});
