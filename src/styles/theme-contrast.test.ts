import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * RC-016 (HU-14, Escenario 6): contraste WCAG AA de los pares texto/fondo de
 * `theme.css`, en modo claro y oscuro.
 *
 * Los valores se **parsean del propio `theme.css`** en vez de copiarse a
 * constantes del test: así el test es una guarda de regresión real — si
 * alguien retoca un token, este archivo lo mide de nuevo y falla solo. Con
 * constantes duplicadas mediría la copia y no el estilo que llega al usuario.
 *
 * La fórmula de contraste es la de WCAG 2.1 implementada acá mismo (unas 15
 * líneas): el proyecto no suma dependencias solo para esto.
 */

// Ruta desde la raíz del proyecto: bajo el entorno jsdom de Vitest,
// `import.meta.url` no es una URL `file:` y `fileURLToPath` la rechaza.
const CSS = readFileSync(resolve(process.cwd(), 'src/styles/theme.css'), 'utf8');

/** Umbral AA para texto normal (WCAG 2.1, criterio de éxito 1.4.3). */
const AA_NORMAL_TEXT = 4.5;

type Rgba = readonly [number, number, number, number];

const WHITE: Rgba = [255, 255, 255, 1];

/** Extrae el cuerpo de un bloque de reglas. Ninguno anida llaves en theme.css. */
function readBlock(selector: string): string {
  const start = CSS.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`theme.css no contiene el bloque "${selector}"`);
  const end = CSS.indexOf('\n}', start);
  if (end === -1) throw new Error(`El bloque "${selector}" de theme.css no cierra`);
  return CSS.slice(start, end);
}

function readTokens(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const match of block.matchAll(/(--mc-[a-z0-9-]+):\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name && value) tokens[name] = value.trim();
  }
  return tokens;
}

const LIGHT_TOKENS = readTokens(readBlock(':root'));
/** En oscuro solo se redefine parte de la paleta; el resto se hereda de `:root`. */
const DARK_TOKENS = { ...LIGHT_TOKENS, ...readTokens(readBlock("[data-theme='dark']")) };

type Mode = 'claro' | 'oscuro';

function tokensOf(mode: Mode): Record<string, string> {
  return mode === 'claro' ? LIGHT_TOKENS : DARK_TOKENS;
}

/** Acepta las dos notaciones que usa theme.css: `#rrggbb` y `rgb(r g b / n%)`. */
function parseColor(value: string): Rgba {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex?.[1]) {
    const int = Number.parseInt(hex[1], 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255, 1];
  }
  const rgb = /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*(\d+)%\s*)?\)$/.exec(value);
  if (rgb?.[1] && rgb[2] && rgb[3]) {
    const alpha = rgb[4] === undefined ? 1 : Number(rgb[4]) / 100;
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), alpha];
  }
  throw new Error(`Color no soportado por el test de contraste: "${value}"`);
}

function colorOf(mode: Mode, token: string): Rgba {
  const value = tokensOf(mode)[`--mc-${token}`];
  if (!value) throw new Error(`theme.css no define --mc-${token} en modo ${mode}`);
  return parseColor(value);
}

/** Compone un color translúcido sobre su fondo (los `*-bg` en oscuro usan alpha). */
function flatten(color: Rgba, backdrop: Rgba): Rgba {
  const alpha = color[3];
  if (alpha === 1) return color;
  return [
    color[0] * alpha + backdrop[0] * (1 - alpha),
    color[1] * alpha + backdrop[1] * (1 - alpha),
    color[2] * alpha + backdrop[2] * (1 - alpha),
    1,
  ];
}

function relativeLuminance(color: Rgba): number {
  const channel = (raw: number): number => {
    const value = raw / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color[0]) + 0.7152 * channel(color[1]) + 0.0722 * channel(color[2]);
}

function contrastRatio(foreground: Rgba, background: Rgba): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

/** Contraste de un token de texto sobre un token de fondo, ambos de `theme.css`. */
function ratioBetween(mode: Mode, textToken: string, backgroundToken: string): number {
  const surface = colorOf(mode, backgroundToken);
  return contrastRatio(flatten(colorOf(mode, textToken), surface), surface);
}

const MODES: Mode[] = ['claro', 'oscuro'];
const SURFACES = ['card', 'surface', 'surface-alt'];

/**
 * Tokens de texto que se miden contra las tres superficies.
 *
 * Exclusión explícita: `--mc-text-disabled`. WCAG 2.1 exime del criterio 1.4.3
 * el texto de componentes deshabilitados, y bajarle el tono a AA lo volvería
 * indistinguible del texto activo — que es justo lo que ese token comunica.
 */
const TEXT_TOKENS = ['text-primary', 'text-secondary', 'text-body', 'text-strong', 'accent-text'];

/** Pares texto/fondo semánticos: el `*-text` sobre su propio `*-bg`. */
const SEMANTIC_PAIRS = ['success', 'warning', 'danger', 'info'];

describe('Contraste WCAG AA de los tokens de theme.css', () => {
  for (const mode of MODES) {
    describe(`modo ${mode}`, () => {
      for (const textToken of TEXT_TOKENS) {
        for (const surface of SURFACES) {
          it(`--mc-${textToken} sobre --mc-${surface} cumple ${AA_NORMAL_TEXT}:1`, () => {
            expect(ratioBetween(mode, textToken, surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
          });
        }
      }

      for (const semantic of SEMANTIC_PAIRS) {
        it(`--mc-${semantic}-text sobre --mc-${semantic}-bg cumple ${AA_NORMAL_TEXT}:1`, () => {
          // Los `*-bg` en oscuro son translúcidos: se componen sobre la card.
          const card = colorOf(mode, 'card');
          const background = flatten(colorOf(mode, `${semantic}-bg`), card);
          const text = flatten(colorOf(mode, `${semantic}-text`), background);
          expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
        });
      }

      it(`--mc-text-on-accent sobre --mc-accent cumple ${AA_NORMAL_TEXT}:1`, () => {
        expect(ratioBetween(mode, 'text-on-accent', 'accent')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      });

      it(`--mc-text-on-brand sobre --mc-brand-primary cumple ${AA_NORMAL_TEXT}:1`, () => {
        expect(ratioBetween(mode, 'text-on-brand', 'brand-primary')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      });
    });
  }

  /**
   * `--mc-text-tertiary` es el token que motivó la D3: fallaba en los dos
   * modos y contra las tres superficies. Se mide aparte del resto para que el
   * fallo, si vuelve, apunte directo a la decisión que lo cambió.
   */
  describe('--mc-text-tertiary (RC-016 D3)', () => {
    for (const mode of MODES) {
      for (const surface of SURFACES) {
        it(`en ${mode}, sobre --mc-${surface} cumple ${AA_NORMAL_TEXT}:1`, () => {
          expect(ratioBetween(mode, 'text-tertiary', surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
        });
      }
    }
  });

  /**
   * Heatmap de RC-014: el porcentaje de la celda va en blanco y no cambia con
   * el tema, así que se mide una sola vez contra el color de fondo de la celda.
   */
  describe('celdas del heatmap con texto blanco (RC-016 D4)', () => {
    for (const cell of ['conflict', 'blocked']) {
      it(`--mc-heatmap-${cell} cumple ${AA_NORMAL_TEXT}:1 con texto blanco`, () => {
        expect(contrastRatio(WHITE, colorOf('claro', `heatmap-${cell}`))).toBeGreaterThanOrEqual(
          AA_NORMAL_TEXT,
        );
      });
    }

    /**
     * EXCLUIDAS A PROPÓSITO: `high`, `medium` y `low`.
     *
     * Con texto blanco dan 2.54, 1.67 y 2.80 y no cumplen el criterio 1.4.3.
     * Es una desviación aceptada a nivel de producto en `rc016.md` D4: el
     * porcentaje numérico ya comunica el nivel y el color solo refuerza la
     * categoría, así que el criterio 1.4.1 ("el color no es el único canal")
     * sí se cumple. Cambiar el texto a oscuro fue evaluado y descartado.
     *
     * La aserción de abajo es deliberadamente laxa — solo comprueba que los
     * tokens siguen existiendo y son medibles. Si mañana alguien mejora esos
     * ratios, este test no se lo impide.
     */
    for (const cell of ['high', 'medium', 'low']) {
      it(`--mc-heatmap-${cell} queda excluido del umbral AA (desviación aceptada)`, () => {
        expect(contrastRatio(WHITE, colorOf('claro', `heatmap-${cell}`))).toBeGreaterThan(1);
      });
    }
  });
});
