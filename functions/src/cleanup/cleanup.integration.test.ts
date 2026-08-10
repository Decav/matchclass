import { deleteApp, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { collectProtectedUids } from './collect-protected-uids';
import { INACTIVITY_THRESHOLD_DAYS, MILLISECONDS_PER_DAY } from './cleanup-config';
import type { CleanupLogger } from './run-cleanup';
import { runAnonymousAccountsCleanup } from './run-cleanup';

/*
 * Tests de integracion contra los emuladores de Auth y Firestore (RC-017 §9).
 *
 * Corren con `npm run emulators` levantado. Si el emulador no responde, la
 * suite se saltea con un mensaje explicito en vez de fallar: nadie deberia
 * quedarse con la suite en rojo por no haber levantado los emuladores.
 *
 * Usan ids de proyecto propios —distintos del `matchclass` que siembra
 * `e2e/global-setup.ts`— para poder afirmar conjuntos exactos ("el Set tiene
 * exactamente este uid") sin que las fixtures de e2e, que tambien tienen salas
 * activas con respuestas, se cuelen en el resultado.
 */

const DEFAULT_FIRESTORE_EMULATOR = '127.0.0.1:8080';
const DEFAULT_AUTH_EMULATOR = '127.0.0.1:9099';

// Los hosts se resuelven una sola vez y se usan tanto para el SDK como para el
// ping: asi el chequeo de disponibilidad mira exactamente el mismo emulador al
// que se van a conectar los tests.
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST ?? DEFAULT_FIRESTORE_EMULATOR;
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? DEFAULT_AUTH_EMULATOR;

process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR;
process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR;

const PROJECT_ID = 'rc017-cleanup-integration';
const EMPTY_PROJECT_ID = 'rc017-cleanup-sin-salas-activas';

const ACTIVE_ROOM_ID = 'sala-activa';
const CLOSED_ROOM_ID = 'sala-cerrada';

const SKIP_MESSAGE =
  `Emuladores de Firebase no disponibles en ${FIRESTORE_EMULATOR} (firestore) / ${AUTH_EMULATOR} (auth). ` +
  'Levantalos con `npm run emulators` desde la raiz del repo para correr estos tests.';

const silentLogger: CleanupLogger = { info: () => undefined, error: () => undefined };

async function respondeEn(host: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    await fetch(`http://${host}/`, { signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/** Deja el proyecto de pruebas vacio: cada corrida arranca del mismo estado. */
async function resetProject(app: App, db: Firestore): Promise<void> {
  await db.recursiveDelete(db.collection('rooms'));

  const { users } = await getAuth(app).listUsers(1000);
  if (users.length > 0) {
    await getAuth(app).deleteUsers(users.map((user) => user.uid));
  }
}

let emuladoresDisponibles = false;
let app: App;
let emptyApp: App;
let db: Firestore;

beforeAll(async () => {
  emuladoresDisponibles = (await respondeEn(FIRESTORE_EMULATOR)) && (await respondeEn(AUTH_EMULATOR));
  if (!emuladoresDisponibles) {
    console.warn(`[RC-017] ${SKIP_MESSAGE}`);
    return;
  }

  app = initializeApp({ projectId: PROJECT_ID }, `${PROJECT_ID}-${String(Date.now())}`);
  emptyApp = initializeApp({ projectId: EMPTY_PROJECT_ID }, `${EMPTY_PROJECT_ID}-${String(Date.now())}`);
  db = getFirestore(app);

  await resetProject(app, db);

  await db.doc(`rooms/${ACTIVE_ROOM_ID}`).set({ code: 'ACT001', name: 'Sala activa', status: 'active' });
  await db.doc(`rooms/${CLOSED_ROOM_ID}`).set({ code: 'CLS001', name: 'Sala cerrada', status: 'closed' });

  const emptyDb = getFirestore(emptyApp);
  await emptyDb.recursiveDelete(emptyDb.collection('rooms'));
  await emptyDb.doc('rooms/solo-cerrada').set({ code: 'CLS002', name: 'Sala cerrada', status: 'closed' });
});

afterAll(async () => {
  if (!emuladoresDisponibles) return;
  await deleteApp(app);
  await deleteApp(emptyApp);
});

describe('collectProtectedUids (emuladores)', () => {
  it('devuelve solo los uids que respondieron en una sala activa', async (ctx) => {
    if (!emuladoresDisponibles) ctx.skip(SKIP_MESSAGE);

    await db.doc(`rooms/${ACTIVE_ROOM_ID}/responses/uid-sala-activa`).set({ occupiedBlocks: [1, 2] });
    await db.doc(`rooms/${CLOSED_ROOM_ID}/responses/uid-sala-cerrada`).set({ occupiedBlocks: [3] });

    const protectedUids = await collectProtectedUids(db);

    expect([...protectedUids]).toEqual(['uid-sala-activa']);
    expect(protectedUids.has('uid-sala-cerrada')).toBe(false);
  });

  it('devuelve un Set vacio cuando no hay salas activas, sin lanzar', async (ctx) => {
    if (!emuladoresDisponibles) ctx.skip(SKIP_MESSAGE);

    const protectedUids = await collectProtectedUids(getFirestore(emptyApp));

    expect(protectedUids.size).toBe(0);
  });
});

describe('runAnonymousAccountsCleanup (emuladores)', () => {
  it('borra la cuenta anonima sin sala activa y conserva sus documentos de respuesta', async (ctx) => {
    if (!emuladoresDisponibles) ctx.skip(SKIP_MESSAGE);

    const auth = getAuth(app);
    // `createUser({})` deja exactamente la huella de una cuenta anonima:
    // `providerData: []`, sin email ni telefono y con `lastRefreshTime: null`.
    const protegido = await auth.createUser({});
    const borrable = await auth.createUser({});

    const responseProtegida = db.doc(`rooms/${ACTIVE_ROOM_ID}/responses/${protegido.uid}`);
    const responseBorrable = db.doc(`rooms/${CLOSED_ROOM_ID}/responses/${borrable.uid}`);
    await responseProtegida.set({ studentName: 'Alumno en sala activa', occupiedBlocks: [1] });
    await responseBorrable.set({ studentName: 'Alumno en sala cerrada', occupiedBlocks: [2] });

    // Las cuentas se acaban de crear: en vez de falsear las fechas del
    // emulador, se corre el job "desde el futuro".
    const now = new Date(Date.now() + (INACTIVITY_THRESHOLD_DAYS + 10) * MILLISECONDS_PER_DAY);

    const report = await runAnonymousAccountsCleanup({
      auth,
      collectProtectedUids: () => collectProtectedUids(db),
      logger: silentLogger,
      now,
      dryRun: false,
    });

    expect(report).toMatchObject({
      scannedUsers: 2,
      anonymousUsers: 2,
      protectedByActiveRoom: 1,
      staleCandidates: 1,
      deleted: 1,
      failed: 0,
    });

    await expect(auth.getUser(protegido.uid)).resolves.toMatchObject({ uid: protegido.uid });
    await expect(auth.getUser(borrable.uid)).rejects.toMatchObject({ code: 'auth/user-not-found' });

    // Lo central de la HU: la cuenta se va, el dato de matching se queda.
    await expect(responseBorrable.get().then((snapshot) => snapshot.exists)).resolves.toBe(true);
    await expect(responseProtegida.get().then((snapshot) => snapshot.exists)).resolves.toBe(true);
  });

  it('en dry-run no borra ninguna cuenta del emulador', async (ctx) => {
    if (!emuladoresDisponibles) ctx.skip(SKIP_MESSAGE);

    const auth = getAuth(app);
    const sobreviviente = await auth.createUser({});
    const now = new Date(Date.now() + (INACTIVITY_THRESHOLD_DAYS + 10) * MILLISECONDS_PER_DAY);

    const report = await runAnonymousAccountsCleanup({
      auth,
      collectProtectedUids: () => collectProtectedUids(db),
      logger: silentLogger,
      now,
      dryRun: true,
    });

    expect(report.staleCandidates).toBeGreaterThanOrEqual(1);
    expect(report.deleted).toBe(0);
    await expect(auth.getUser(sobreviviente.uid)).resolves.toMatchObject({ uid: sobreviviente.uid });
  });
});
