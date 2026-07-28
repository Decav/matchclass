import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { auth, db, firebaseEnv } from './firebase-app';

export const EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8080,
} as const;

let connected = false;

/**
 * Conecta el SDK a los emuladores locales. No-op si
 * `VITE_FIREBASE_USE_EMULATORS` no es `'true'`.
 *
 * Se llama una sola vez, en `main.tsx`, antes de renderizar: el SDK lanza si
 * se le cambia el host después de la primera operación. El flag `connected`
 * protege del doble montaje de StrictMode en desarrollo.
 */
export function connectEmulators(): boolean {
  if (!firebaseEnv.useEmulators || connected) return connected;

  connectAuthEmulator(auth, `http://localhost:${EMULATOR_PORTS.auth}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, 'localhost', EMULATOR_PORTS.firestore);

  connected = true;
  return true;
}

export function isUsingEmulators(): boolean {
  return firebaseEnv.useEmulators;
}
