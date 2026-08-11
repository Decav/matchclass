/**
 * @vitest-environment node
 *
 * Entorno `node` en vez del `jsdom` global: este test lee archivos del disco y
 * bajo jsdom `import.meta.url` no es una URL `file:`, así que `fileURLToPath`
 * falla. Además no monta nada de React.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

/**
 * RC-019/D5: la configuración de despliegue se valida por test, no por
 * memoria. Dos regresiones concretas y caras:
 *
 * - sin el rewrite `**` → `/index.html`, Hosting devuelve 404 en cualquier
 *   ruta que no sea `/` (React Router es client-side) — Escenario 6 de HU-16
 * - sin `firestore.database`, `firebase deploy --only firestore:rules`
 *   publicaría las reglas en la base `(default)`, que en este proyecto no
 *   existe / está vacía — Escenario 3 y D1
 *
 * JSON no admite comentarios, así que el porqué vive acá y en
 * `docs/despliegue.md`.
 */

const firebaseJsonPath = fileURLToPath(new URL('../../../firebase.json', import.meta.url));

const headerSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const firebaseConfigSchema = z.object({
  firestore: z.object({
    database: z.string(),
    rules: z.string(),
    indexes: z.string(),
  }),
  hosting: z.object({
    public: z.string(),
    ignore: z.array(z.string()),
    rewrites: z.array(z.object({ source: z.string(), destination: z.string() })),
    headers: z.array(z.object({ source: z.string(), headers: z.array(headerSchema) })),
  }),
  emulators: z.object({
    auth: z.object({ port: z.number() }),
    firestore: z.object({ port: z.number() }),
  }),
});

function readFirebaseConfig() {
  const raw = readFileSync(firebaseJsonPath, 'utf-8');
  const parsed: unknown = JSON.parse(raw);
  return firebaseConfigSchema.parse(parsed);
}

describe('firebase.json', () => {
  const config = readFirebaseConfig();

  it('sirve el build de Vite desde `dist`', () => {
    expect(config.hosting.public).toBe('dist');
  });

  it('reescribe cualquier ruta a /index.html para que la SPA no dé 404', () => {
    const catchAll = config.hosting.rewrites.find((rewrite) => rewrite.source === '**');

    expect(catchAll).toBeDefined();
    expect(catchAll?.destination).toBe('/index.html');
  });

  it('excluye del deploy firebase.json, dotfiles y node_modules', () => {
    expect(config.hosting.ignore).toEqual(
      expect.arrayContaining(['firebase.json', '**/.*', '**/node_modules/**']),
    );
  });

  it('cachea /assets/** de forma inmutable (Vite hashea los nombres)', () => {
    const assets = config.hosting.headers.find((entry) => entry.source === '/assets/**');
    const cacheControl = assets?.headers.find((header) => header.key === 'Cache-Control');

    expect(cacheControl?.value).toContain('max-age=31536000');
    expect(cacheControl?.value).toContain('immutable');
  });

  /**
   * El `source` es `**` y no `/index.html` (verificado contra el sitio
   * publicado el 2026-08-10): Hosting matchea los headers contra la URL
   * pedida, no contra el archivo que termina sirviendo. Con `/index.html`,
   * `/` y todas las rutas de la SPA caían en el default de `max-age=3600`,
   * así que la regla no llegaba a ningún visitante real.
   */
  it('sirve el HTML sin cache en cualquier ruta, para que un deploy nuevo se vea enseguida', () => {
    const catchAll = config.hosting.headers.find((entry) => entry.source === '**');
    const cacheControl = catchAll?.headers.find((header) => header.key === 'Cache-Control');

    expect(cacheControl?.value).toContain('no-cache');
  });

  /**
   * El orden importa: la regla específica de `/assets/**` va después del
   * catch-all para que gane sobre él. Verificado con `curl` contra el sitio
   * publicado, no deducido de la documentación.
   */
  it('declara el catch-all antes de la regla de /assets/**', () => {
    const sources = config.hosting.headers.map((entry) => entry.source);

    expect(sources.indexOf('**')).toBeLessThan(sources.indexOf('/assets/**'));
  });

  it('apunta las reglas a la base nombrada `matchclass-db`', () => {
    expect(config.firestore.database).toBe('matchclass-db');
    expect(config.firestore.rules).toBe('firestore.rules');
  });

  it('conserva los puertos de los emuladores locales', () => {
    expect(config.emulators.auth.port).toBe(9099);
    expect(config.emulators.firestore.port).toBe(8080);
  });
});
