import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FirebaseEnv } from './env';

/**
 * Regresión de RC-019/D1: la base de Firestore del proyecto real es
 * **nombrada** (`matchclass-db`), mientras que el emulador solo sirve
 * `(default)`. `getFirestore(app)` resuelve siempre a `(default)`, así que si
 * alguien "simplifica" el ternario de `firebase-app.ts` la app en producción
 * inicializa sin error y consulta una base vacía — y toda la suite local
 * sigue verde, porque en local se usa el emulador.
 *
 * `firebase-app.ts` inicializa el SDK a nivel de módulo, así que cada caso
 * necesita `vi.resetModules()` + import dinámico para volver a ejecutarlo.
 */

const { initializeAppMock, getAuthMock, getFirestoreMock, readFirebaseEnvMock } = vi.hoisted(
  () => ({
    initializeAppMock: vi.fn((...args: unknown[]) => ({ __app: args })),
    getAuthMock: vi.fn((...args: unknown[]) => ({ __auth: args })),
    getFirestoreMock: vi.fn((...args: unknown[]) => ({ __firestore: args })),
    readFirebaseEnvMock: vi.fn(),
  }),
);

vi.mock('firebase/app', () => ({ initializeApp: initializeAppMock }));
vi.mock('firebase/auth', () => ({ getAuth: getAuthMock }));
vi.mock('firebase/firestore', () => ({ getFirestore: getFirestoreMock }));
vi.mock('./env', () => ({ readFirebaseEnv: readFirebaseEnvMock }));

const BASE_ENV: FirebaseEnv = {
  apiKey: 'fake-api-key',
  authDomain: 'matchclass.firebaseapp.com',
  projectId: 'matchclass',
  storageBucket: 'matchclass.firebasestorage.app',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:fake',
  useEmulators: false,
};

async function importFirebaseApp(useEmulators: boolean) {
  readFirebaseEnvMock.mockReturnValue({ ...BASE_ENV, useEmulators });
  vi.resetModules();
  return import('./firebase-app');
}

describe('firebase-app · selección de la base de Firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con emuladores usa la base por defecto: no pasa ningún id', async () => {
    const { firebaseApp, db } = await importFirebaseApp(true);

    expect(getFirestoreMock).toHaveBeenCalledTimes(1);
    expect(getFirestoreMock).toHaveBeenCalledWith(firebaseApp);
    // La aserción que importa: un solo argumento. `getFirestore(app, 'x')`
    // también satisface `toHaveBeenCalledWith(app)` en algunos matchers.
    expect(getFirestoreMock.mock.calls[0]).toHaveLength(1);
    expect(db).toBeDefined();
  });

  it('sin emuladores usa la base nombrada `matchclass-db`', async () => {
    const { firebaseApp, db } = await importFirebaseApp(false);

    expect(getFirestoreMock).toHaveBeenCalledTimes(1);
    expect(getFirestoreMock).toHaveBeenCalledWith(firebaseApp, 'matchclass-db');
    expect(getFirestoreMock.mock.calls[0]).toHaveLength(2);
    expect(db).toBeDefined();
  });

  it('inicializa la app con las credenciales del entorno y expone `firebaseEnv`', async () => {
    const { firebaseEnv } = await importFirebaseApp(false);

    expect(initializeAppMock).toHaveBeenCalledWith({
      apiKey: BASE_ENV.apiKey,
      authDomain: BASE_ENV.authDomain,
      projectId: BASE_ENV.projectId,
      storageBucket: BASE_ENV.storageBucket,
      messagingSenderId: BASE_ENV.messagingSenderId,
      appId: BASE_ENV.appId,
    });
    expect(firebaseEnv.useEmulators).toBe(false);
  });
});
