/**
 * Validación de las variables de entorno requeridas, en el arranque.
 *
 * Sin esto, un `projectId` ausente deja que el SDK inicialice igual y falle
 * más tarde con un error de red opaco, lejos de la causa real.
 */

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

export interface FirebaseEnv {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  useEmulators: boolean;
}

/**
 * Lee y valida el entorno. Lanza si falta una variable requerida — es
 * deliberado: es mejor no arrancar que arrancar apuntando a ninguna parte.
 */
export function readFirebaseEnv(): FirebaseEnv {
  const env = import.meta.env;

  const missing = REQUIRED_ENV_VARS.filter((key: RequiredEnvVar) => {
    const value = env[key];
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno de Firebase: ${missing.join(', ')}. ` +
        'Copia .env.example a .env.local y complétalas.',
    );
  }

  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    useEmulators: env.VITE_FIREBASE_USE_EMULATORS === 'true',
  };
}
