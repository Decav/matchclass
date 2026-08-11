import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * RC-020 (HU-17, Escenario 4): orden de las capas `--mc-z-*` de `theme.css`.
 *
 * Es **la** regresión que motiva el RC. Hasta acá `--mc-z-sidebar` valía 50 y
 * `--mc-z-overlay` 100: el overlay del menú mobile se pintaba encima del propio
 * sidebar, los ítems se veían atenuados y cualquier toque sobre ellos lo
 * capturaba la capa de fondo, que cerraba el panel en vez de navegar. Ningún
 * test de componente puede verlo — jsdom no calcula layout ni resuelve `var()`,
 * y el z-index no cambia nada del árbol renderizado.
 *
 * Se parsean los valores del propio `theme.css` en vez de copiarlos a
 * constantes, mismo criterio que `theme-contrast.test.ts`: con constantes
 * duplicadas el test mediría la copia y no lo que le llega al usuario.
 */

// Ruta desde la raíz del proyecto: bajo el entorno jsdom de Vitest,
// `import.meta.url` no es una URL `file:` y `fileURLToPath` la rechaza.
const CSS = readFileSync(resolve(process.cwd(), 'src/styles/theme.css'), 'utf8');

/** Extrae el cuerpo de un bloque de reglas. Ninguno anida llaves en theme.css. */
function readBlock(selector: string): string {
  const start = CSS.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`theme.css no contiene el bloque "${selector}"`);
  const end = CSS.indexOf('\n}', start);
  if (end === -1) throw new Error(`El bloque "${selector}" de theme.css no cierra`);
  return CSS.slice(start, end);
}

const ROOT = readBlock(':root');

/** Lee un token `--mc-z-*` de `:root` como número. */
function layer(name: string): number {
  const match = new RegExp(`--mc-z-${name}:\\s*(\\d+);`).exec(ROOT);
  if (!match?.[1]) throw new Error(`theme.css no define --mc-z-${name} en :root`);
  return Number(match[1]);
}

describe('Escala de z-index de theme.css', () => {
  it('el sidebar queda por encima de su overlay (RC-020 D1)', () => {
    expect(layer('sidebar')).toBeGreaterThan(layer('overlay'));
  });

  /**
   * El arreglo del sidebar no debía reordenar el resto de la escala: esos tokens
   * los usan también `.mc-dialog-overlay` (modal) y `.mc-toast`, y el design
   * system pide no tocarlos sin coordinación. Estas aserciones evitan que un
   * futuro ajuste del sidebar se lleve por delante el diálogo o el toast.
   */
  it('modal, toast y tooltip siguen por encima del sidebar y del overlay', () => {
    const sidebar = layer('sidebar');

    expect(layer('modal')).toBeGreaterThan(sidebar);
    expect(layer('toast')).toBeGreaterThan(layer('modal'));
    expect(layer('tooltip')).toBeGreaterThan(layer('toast'));
  });

  it('las capas de contenido quedan por debajo del overlay', () => {
    const overlay = layer('overlay');

    for (const name of ['base', 'dropdown', 'sticky', 'fixed']) {
      expect(layer(name)).toBeLessThan(overlay);
    }
  });

  /**
   * El overlay se declara con la clase `.mc-sidebar-overlay` de `theme.css` y no
   * con una utilidad Tailwind de `z-index` arbitrario, que es como estaba:
   * el z-index de esta pieza tiene que quedar junto al del sidebar para poder
   * leerse y testearse en un solo lugar (RC-020 D1).
   */
  it('.mc-sidebar y .mc-sidebar-overlay toman su z-index de los tokens', () => {
    expect(readBlock('.mc-sidebar')).toContain('z-index: var(--mc-z-sidebar);');
    expect(readBlock('.mc-sidebar-overlay')).toContain('z-index: var(--mc-z-overlay);');
  });
});
