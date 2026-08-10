import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { readFirebaseEnv } from './env';

/**
 * Único punto de arranque del SDK. Nadie más llama a `initializeApp`.
 *
 * Este archivo y los repositories son los únicos que importan `firebase/*`
 * (ver la regla `no-restricted-imports` en eslint.config.js).
 */

/**
 * Id de la base de Firestore del proyecto real (RC-019/D1). El proyecto
 * `matchclass` NO tiene base `(default)`: la única base creada se llama
 * `matchclass-db`.
 */
const FIRESTORE_DATABASE_ID = 'matchclass-db';

const env = readFirebaseEnv();

export const firebaseApp: FirebaseApp = initializeApp({
  apiKey: env.apiKey,
  authDomain: env.authDomain,
  projectId: env.projectId,
  storageBucket: env.storageBucket,
  messagingSenderId: env.messagingSenderId,
  appId: env.appId,
});

export const auth: Auth = getAuth(firebaseApp);

/**
 * El emulador de Firestore sirve la base `(default)` —es lo que usan `npm run
 * emulators` y los e2e—, mientras que el proyecto real solo tiene la base
 * nombrada `matchclass-db`. Sin esta distinción, producción inicializa sin
 * error y consulta una base vacía: la app carga y no encuentra ninguna sala.
 *
 * No "simplificar" este ternario a `getFirestore(firebaseApp)`: la suite local
 * seguiría verde y el fallo aparecería recién en producción.
 * Cubierto por `firebase-app.test.ts`.
 */
export const db: Firestore = env.useEmulators
  ? getFirestore(firebaseApp)
  : getFirestore(firebaseApp, FIRESTORE_DATABASE_ID);

export const firebaseEnv = env;
