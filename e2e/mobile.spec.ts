import { test, expect, type Page } from '@playwright/test';
import {
  DASHBOARD_HELPER_EMAIL,
  DASHBOARD_HELPER_PASSWORD,
  MOBILE_GRID_ROOM_CODE,
  MOBILE_GRID_ROOM_NAME,
  RESULTS_HELPER_EMAIL,
  RESULTS_HELPER_PASSWORD,
  RESULTS_ROOM_ID,
} from './fixtures';

/**
 * RC-020 (HU-17): adaptación mobile. Cubre los seis escenarios de
 * `docs/hu-17-responsive-mobile.md` en un viewport de 375×667 (iPhone SE).
 *
 * Spec propio con `test.use` en vez de un proyecto nuevo en
 * `playwright.config.ts` (RC-020 D4): duplicar los 48 specs de desktop en dos
 * viewports multiplicaría el tiempo de CI para cubrir flujos que no dependen del
 * ancho. Acá van solo los casos donde el ancho **es** lo que se prueba.
 *
 * El caso que motiva el RC es el del sidebar: hasta ahora el overlay se pintaba
 * encima del propio menú (`--mc-z-sidebar` 50 vs `--mc-z-overlay` 100) y el
 * toque sobre un ítem lo interceptaba la capa de fondo, que cerraba el panel en
 * vez de navegar.
 */
test.use({ viewport: { width: 375, height: 667 } });

/** Mínimo táctil de la HU (Escenario 6). */
const MIN_TOUCH_PX = 44;

/**
 * Los `evaluate` van como `string` y no como función: `e2e/**` se type-checkea
 * bajo `tsconfig.node.json`, que no incluye la lib `DOM`, así que `document` no
 * resolvería tipos acá. Mismo criterio que `theme.spec.ts` y `dashboard.spec.ts`.
 */
async function bodyScrollMetrics(page: Page): Promise<{ scrollWidth: number; clientWidth: number }> {
  return page.evaluate<{ scrollWidth: number; clientWidth: number }>(
    '({ scrollWidth: document.body.scrollWidth, clientWidth: document.body.clientWidth })',
  );
}

/** DoD de la HU: ninguna pantalla en 375px scrollea en horizontal. */
async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await bodyScrollMetrics(page);
  expect(scrollWidth, `el body desborda ${scrollWidth - clientWidth}px en horizontal`).toBe(clientWidth);
}

async function scrollMetrics(page: Page, selector: string): Promise<{ scrollWidth: number; clientWidth: number }> {
  return page.evaluate<{ scrollWidth: number; clientWidth: number }>(
    `(() => {
      const el = document.querySelector('${selector}');
      if (!el) throw new Error('No se encontró ${selector}');
      return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
    })()`,
  );
}

async function scrollHorizontally(page: Page, selector: string, left: number): Promise<void> {
  await page.evaluate(
    `(() => {
      const el = document.querySelector('${selector}');
      if (!el) throw new Error('No se encontró ${selector}');
      el.scrollLeft = ${left};
    })()`,
  );
}

/** Clases del elemento que está en un punto de la pantalla — para el Escenario 4. */
async function classNameAtPoint(page: Page, x: number, y: number): Promise<string> {
  return page.evaluate<string>(`String(document.elementFromPoint(${x}, ${y})?.className ?? '')`);
}

async function boxOf(page: Page, selector: string, index = 0) {
  const box = await page.locator(selector).nth(index).boundingBox();
  if (!box) throw new Error(`${selector} (${index}) no tiene caja visible`);
  return box;
}

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/acceso');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/dashboard');
}

async function fillRoomCode(page: Page, code: string): Promise<void> {
  const cells = page.locator('.mc-code-cell');
  for (let i = 0; i < code.length; i += 1) {
    await cells.nth(i).fill(code[i] ?? '');
  }
}

test.describe('Sidebar del AppShell en mobile (Escenario 4)', () => {
  test('con el menú abierto, un toque en "Dashboard" navega — no lo intercepta el overlay', async ({
    page,
  }) => {
    await login(page, DASHBOARD_HELPER_EMAIL, DASHBOARD_HELPER_PASSWORD);

    // Se parte de otra pantalla para que la navegación sea observable en la URL:
    // desde /dashboard, tocar "Dashboard" no cambiaría nada y el test no
    // distinguiría el clic que llega al ítem del clic que se come el overlay.
    await page.goto('/salas/nueva');
    await expect(page.getByRole('heading', { name: 'Crear nueva sala' })).toBeVisible();

    await expect(page.locator('.mc-sidebar--open')).toHaveCount(0);
    await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
    await expect(page.locator('.mc-sidebar--open')).toHaveCount(1);
    await expect(page.locator('.mc-sidebar-overlay')).toHaveCount(1);

    await page.getByRole('link', { name: 'Dashboard' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.mc-sidebar-overlay')).toHaveCount(0);
    await expect(page.locator('.mc-sidebar--open')).toHaveCount(0);
  });

  test('un toque en el overlay, fuera del panel, cierra el menú y no deja nada cubriendo la pantalla', async ({
    page,
  }) => {
    await login(page, DASHBOARD_HELPER_EMAIL, DASHBOARD_HELPER_PASSWORD);

    await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
    await expect(page.locator('.mc-sidebar-overlay')).toHaveCount(1);

    // El sidebar mide 280px: a la derecha de eso solo queda el overlay.
    expect(await classNameAtPoint(page, 340, 400)).toContain('mc-sidebar-overlay');
    await page.mouse.click(340, 400);

    await expect(page.locator('.mc-sidebar-overlay')).toHaveCount(0);
    await expect(page.locator('.mc-sidebar--open')).toHaveCount(0);

    // Con el panel cerrado, el centro de la pantalla devuelve contenido.
    const centerClass = await classNameAtPoint(page, 187, 333);
    expect(centerClass).not.toContain('mc-sidebar-overlay');
    await expect(page.getByRole('heading', { name: 'Mis salas' })).toBeVisible();
  });

  test('los controles del AppShell cumplen el mínimo táctil de 44px (Escenario 6)', async ({ page }) => {
    await login(page, DASHBOARD_HELPER_EMAIL, DASHBOARD_HELPER_PASSWORD);

    // Los dos botones de ícono de la topbar y el kebab de la card de sala: con
    // las medidas de desktop quedaban en 36-38px y 36×32.
    for (const name of [/Cambiar a modo/, 'Abrir menú de navegación']) {
      const box = await page.getByRole('button', { name }).boundingBox();
      if (!box) throw new Error(`El botón ${String(name)} no tiene caja visible`);
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(MIN_TOUCH_PX);
    }

    const kebab = await page.locator('.mc-room-actions__trigger').first().boundingBox();
    if (!kebab) throw new Error('El kebab de la card de sala no tiene caja visible');
    expect(Math.min(kebab.width, kebab.height)).toBeGreaterThanOrEqual(MIN_TOUCH_PX);

    await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
    for (const label of ['Dashboard', 'Mis salas']) {
      const box = await page.getByRole('link', { name: label }).boundingBox();
      if (!box) throw new Error(`El ítem "${label}" no tiene caja visible`);
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_PX);
    }
  });
});

test.describe('Landing en mobile (Escenario 1)', () => {
  test('las 3 cards apilan, el campo de código va a ancho completo y no hay scroll horizontal', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'MatchClass' })).toBeVisible();

    const cards = page.locator('.mc-landing-card');
    await expect(cards).toHaveCount(3);

    const first = await boxOf(page, '.mc-landing-card', 0);
    const second = await boxOf(page, '.mc-landing-card', 1);
    const third = await boxOf(page, '.mc-landing-card', 2);

    // Apiladas: misma abscisa, una debajo de la otra.
    expect(second.x).toBeCloseTo(first.x, 0);
    expect(third.x).toBeCloseTo(first.x, 0);
    expect(second.y).toBeGreaterThan(first.y + first.height - 1);
    expect(third.y).toBeGreaterThan(second.y + second.height - 1);

    // Ancho completo: la card llena el hero menos sus 16px de padding lateral.
    const hero = await boxOf(page, '.mc-landing__hero');
    expect(first.width).toBeCloseTo(hero.width - 32, 0);

    const codeBar = await boxOf(page, '.mc-landing-code__bar');
    expect(codeBar.width).toBeCloseTo(hero.width - 32, 0);

    await expectNoHorizontalScroll(page);
  });
});

test.describe('Pantallas de acceso en mobile (Escenario 2)', () => {
  test('la card de /acceso va a ancho completo y los tabs siguen operables', async ({ page }) => {
    await page.goto('/acceso');

    const main = await boxOf(page, 'main');
    const card = await boxOf(page, '.mc-access-card');
    expect(card.width).toBeCloseTo(main.width - 32, 0);

    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(2);
    await expect(page.getByRole('tab', { name: 'Ayudante' })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('tab', { name: 'Alumno' }).click();
    await expect(page.getByRole('tab', { name: 'Alumno' })).toHaveAttribute('aria-selected', 'true');

    await expectNoHorizontalScroll(page);
  });

  test('las 6 celdas del código mantienen 44px y no desbordan la card', async ({ page }) => {
    await page.goto('/acceso?tipo=alumno');

    const cells = page.locator('.mc-code-cell');
    await expect(cells).toHaveCount(6);

    for (let i = 0; i < 6; i += 1) {
      const box = await boxOf(page, '.mc-code-cell', i);
      expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_PX);
    }

    await expectNoHorizontalScroll(page);
  });

  test('/registro y /recuperar no scrollean en horizontal', async ({ page }) => {
    await page.goto('/registro');
    await expect(page.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.goto('/recuperar');
    await expectNoHorizontalScroll(page);
  });
});

test.describe('Dashboard en mobile (Escenario 5)', () => {
  test('KPIs y cards de sala en una columna, con "Nueva sala" visible', async ({ page }) => {
    await login(page, DASHBOARD_HELPER_EMAIL, DASHBOARD_HELPER_PASSWORD);

    const kpis = page.locator('.mc-kpi-card');
    await expect(kpis).toHaveCount(3);

    const firstKpi = await boxOf(page, '.mc-kpi-card', 0);
    const secondKpi = await boxOf(page, '.mc-kpi-card', 1);
    expect(secondKpi.x).toBeCloseTo(firstKpi.x, 0);
    expect(secondKpi.y).toBeGreaterThan(firstKpi.y + firstKpi.height - 1);

    // Las cards de sala activas: una por fila, a ancho completo del contenido.
    const rooms = page.locator('.mc-room-card');
    await expect(rooms).toHaveCount(2);
    const firstRoom = await boxOf(page, '.mc-room-card', 0);
    const secondRoom = await boxOf(page, '.mc-room-card', 1);
    expect(secondRoom.x).toBeCloseTo(firstRoom.x, 0);
    expect(secondRoom.y).toBeGreaterThan(firstRoom.y + firstRoom.height - 1);
    expect(firstRoom.width).toBeCloseTo(firstKpi.width, 0);

    await expect(page.getByRole('link', { name: 'Nueva sala' })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});

test.describe('Grilla del alumno en mobile (Escenario 3)', () => {
  test('la retícula scrollea en horizontal, las celdas no bajan de 44px y los horarios quedan fijos', async ({
    page,
  }) => {
    await page.goto('/acceso?tipo=alumno');
    await fillRoomCode(page, MOBILE_GRID_ROOM_CODE);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText(MOBILE_GRID_ROOM_NAME)).toBeVisible();
    await page.getByLabel('Tu nombre').fill('Alumna Mobile');
    await page.getByRole('button', { name: 'Entrar a la grilla' }).click();
    await expect(page).toHaveURL(/\/sala\/.+/);

    await expect(page.getByRole('button', { name: 'Lunes, 08:15 – 09:25' })).toBeVisible();

    // Con `flex: 1` a secas las celdas se comprimían y el contenido nunca
    // excedía el contenedor: sin `min-width` no había scroll que activar.
    const { scrollWidth, clientWidth } = await scrollMetrics(page, '.mc-schedule-grid__scroll');
    expect(scrollWidth).toBeGreaterThan(clientWidth);

    const cell = await boxOf(page, '.mc-schedule-cell');
    expect(cell.width).toBeGreaterThanOrEqual(MIN_TOUCH_PX);
    expect(cell.height).toBeGreaterThanOrEqual(MIN_TOUCH_PX);

    // Tras scrollear, la columna de horarios sigue pegada al borde izquierdo.
    const scroller = await boxOf(page, '.mc-schedule-grid__scroll');
    await scrollHorizontally(page, '.mc-schedule-grid__scroll', scrollWidth - clientWidth);
    const timeCol = await boxOf(page, '.mc-schedule-time-col');
    expect(timeCol.x).toBeCloseTo(scroller.x, 0);
    await expect(page.getByText('08:15', { exact: false }).first()).toBeVisible();

    await expectNoHorizontalScroll(page);
  });
});

test.describe('Resultados en mobile (Escenario 3 y "Resultados")', () => {
  test('el ranking queda arriba del heatmap y la retícula scrollea con las horas fijas', async ({
    page,
  }) => {
    await login(page, RESULTS_HELPER_EMAIL, RESULTS_HELPER_PASSWORD);
    await page.goto(`/salas/${RESULTS_ROOM_ID}`);
    await expect(page.locator('.mc-heatmap__cell')).toHaveCount(50);

    // RC-020 D3: el ranking es la respuesta que el ayudante busca; el heatmap de
    // 50 porcentajes de 12px es lo que peor se lee en una pantalla chica.
    const aside = await boxOf(page, '.mc-results-columns__aside');
    const heatmap = await boxOf(page, '.mc-heatmap');
    expect(aside.y).toBeLessThan(heatmap.y);

    const { scrollWidth, clientWidth } = await scrollMetrics(page, '.mc-heatmap__scroll');
    expect(scrollWidth).toBeGreaterThan(clientWidth);

    const cell = await boxOf(page, '.mc-heatmap__cell');
    expect(cell.width).toBeGreaterThanOrEqual(MIN_TOUCH_PX);

    const scroller = await boxOf(page, '.mc-heatmap__scroll');
    await scrollHorizontally(page, '.mc-heatmap__scroll', scrollWidth - clientWidth);
    const timeCol = await boxOf(page, '.mc-heatmap__time-col');
    expect(timeCol.x).toBeCloseTo(scroller.x, 0);

    await expectNoHorizontalScroll(page);
  });
});

test.describe('Pantallas internas del ayudante en mobile', () => {
  test('crear sala y configurar bloques no scrollean en horizontal', async ({ page }) => {
    await login(page, DASHBOARD_HELPER_EMAIL, DASHBOARD_HELPER_PASSWORD);

    await page.goto('/salas/nueva');
    await expect(page.getByRole('heading', { name: 'Crear nueva sala' })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.goto('/dashboard');
    await page.locator('.mc-room-card').first().getByRole('link', { name: 'Abrir' }).click();
    await expect(page).toHaveURL(/\/salas\/.+/);
    await expectNoHorizontalScroll(page);
  });
});
