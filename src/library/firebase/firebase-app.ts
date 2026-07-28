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
export const db: Firestore = getFirestore(firebaseApp);

export const firebaseEnv = env;
