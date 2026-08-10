import { defineConfig } from 'vitest/config';

/*
 * Vitest propio del workspace (RC-017 §10 D1).
 *
 * El de la raiz corre con `environment: 'jsdom'` y un `setupFiles` que carga
 * jest-dom y polyfills de browser: nada de eso aplica a un job de Node que usa
 * firebase-admin, y jsdom directamente estorba. Por eso la raiz excluye
 * `functions/**` y este workspace corre su propia suite con `environment:
 * 'node'`.
 *
 * Es `.mts` y no `.ts` porque el package.json de `functions` no declara
 * `"type": "module"` —el runtime de Cloud Functions consume CommonJS— y
 * `vitest/config` es ESM puro: en un archivo CJS, TypeScript lo rechaza
 * (TS1479).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // `lib/` es la salida compilada: los mismos tests dos veces, en JS.
    exclude: ['**/node_modules/**', 'lib/**'],
    // Los tests de integracion hablan con los emuladores: mas lentos que un
    // unitario puro, y el default de 5s no alcanza para el primer round-trip.
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
