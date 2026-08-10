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

/**
 * RC-019 / Escenario 5 de HU-16. `readFirebaseEnv()` lanza si falta una de
 * las claves requeridas, y como eso ocurre en el arranque, un
 * `.env.production` incompleto no se ve como un error suave sino como una
 * **pantalla en blanco** en el sitio publicado. Este test lo detecta antes
 * del deploy.
 *
 * No valida el contenido de las claves —son públicas pero pueden rotar—,
 * sí que estén presentes y no vacías.
 */

const envProductionPath = fileURLToPath(new URL('../../../.env.production', import.meta.url));

const REQUIRED_FIREBASE_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/** Parser mínimo de dotenv: `CLAVE=valor`, ignorando comentarios y vacíos. */
function parseEnvFile(path: string): Record<string, string> {
  const content = readFileSync(path, 'utf-8');
  const entries: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    entries[key] = value;
  }

  return entries;
}

describe('.env.production', () => {
  const env = parseEnvFile(envProductionPath);

  it.each(REQUIRED_FIREBASE_KEYS)('define %s con un valor no vacío', (key) => {
    expect(env[key]).toBeDefined();
    expect(env[key]).not.toBe('');
  });

  it('desactiva los emuladores: producción pega contra el proyecto real', () => {
    // `readFirebaseEnv` compara con `=== 'true'`; cualquier otro valor apaga
    // los emuladores, pero acá se exige `false` explícito para que el archivo
    // se lea sin ambigüedad.
    expect(env.VITE_FIREBASE_USE_EMULATORS).toBe('false');
  });

  it('declara el entorno como `production`', () => {
    expect(env.VITE_APP_ENV).toBe('production');
  });

  it('apunta al proyecto Firebase `matchclass`', () => {
    expect(env.VITE_FIREBASE_PROJECT_ID).toBe('matchclass');
  });
});
