import { FirebaseError } from 'firebase/app';

/**
 * Clasificación pura de un error de Firebase (SDK Auth/Firestore) por código.
 *
 * Vive en `library` porque es el único lugar autorizado a importar
 * `firebase/*` (ver `no-restricted-imports` en eslint.config.js). `global`
 * consume esta función — nunca `firebase/app` directamente — para no violar
 * esa regla en `src/global/hooks/use-firebase-error.ts`.
 */
export interface ClassifiedFirebaseError {
  code: string | null;
  isNetworkError: boolean;
  isInvalidCredentials: boolean;
  isForbidden: boolean;
  isEmailAlreadyInUse: boolean;
  isUserNotFound: boolean;
}

const INVALID_CREDENTIAL_CODES = new Set([
  'auth/invalid-credential',
  'auth/user-not-found',
  'auth/wrong-password',
]);

const NETWORK_ERROR_CODES = new Set([
  'auth/network-request-failed',
  'unavailable',
  'deadline-exceeded',
]);

// RC-004 (HU-02, Escenario 2): registro con un email que ya tiene cuenta.
const EMAIL_ALREADY_IN_USE_CODES = new Set(['auth/email-already-in-use']);

// RC-007 (HU-05): usado por `useRecoverPasswordMutation` para tratar el
// email-no-registrado como éxito silencioso (seguridad por no-verificación).
// Independiente de `isInvalidCredentials` (que sigue agrupando este mismo
// código para el mensaje de login) — cada use case decide qué hacer con él.
const USER_NOT_FOUND_CODES = new Set(['auth/user-not-found']);

export function classifyFirebaseError(error: unknown): ClassifiedFirebaseError {
  if (!(error instanceof FirebaseError)) {
    return {
      code: null,
      isNetworkError: false,
      isInvalidCredentials: false,
      isForbidden: false,
      isEmailAlreadyInUse: false,
      isUserNotFound: false,
    };
  }
  return {
    code: error.code,
    isNetworkError: NETWORK_ERROR_CODES.has(error.code),
    isInvalidCredentials: INVALID_CREDENTIAL_CODES.has(error.code),
    isForbidden: error.code === 'permission-denied',
    isEmailAlreadyInUse: EMAIL_ALREADY_IN_USE_CODES.has(error.code),
    isUserNotFound: USER_NOT_FOUND_CODES.has(error.code),
  };
}
