import { classifyFirebaseError } from '@library/firebase';

/**
 * Traduce errores de Firebase (Auth/Firestore) a mensajes en español.
 *
 * No importa `firebase/app` directamente (violaría la regla `no-restricted-
 * imports` de `global`): consume `classifyFirebaseError`, la clasificación
 * pura que vive en `library`. El mapeo de mensajes en sí es genérico —no
 * conoce el dominio "acceso"— por eso vive en `global`, reutilizable por
 * cualquier formulario futuro que hable con Firebase.
 */
const INVALID_CREDENTIALS_MESSAGE = 'Email o contraseña incorrectos';
const NETWORK_ERROR_MESSAGE = 'Error de conexión. Intenta de nuevo';
// RC-004 (HU-02, Escenario 2): mensaje literal aprobado, español neutro.
const EMAIL_ALREADY_IN_USE_MESSAGE = 'Este email ya está registrado. Inicia sesión';

export interface UseFirebaseErrorResult {
  message: string | null;
  isNetworkError: boolean;
  isInvalidCredentials: boolean;
  isForbidden: boolean;
  isEmailAlreadyInUse: boolean;
}

const EMPTY_RESULT: UseFirebaseErrorResult = {
  message: null,
  isNetworkError: false,
  isInvalidCredentials: false,
  isForbidden: false,
  isEmailAlreadyInUse: false,
};

export function useFirebaseError(error: unknown): UseFirebaseErrorResult {
  if (error == null) return EMPTY_RESULT;

  const classified = classifyFirebaseError(error);

  if (classified.isInvalidCredentials) {
    return { ...EMPTY_RESULT, message: INVALID_CREDENTIALS_MESSAGE, isInvalidCredentials: true };
  }
  if (classified.isEmailAlreadyInUse) {
    return { ...EMPTY_RESULT, message: EMAIL_ALREADY_IN_USE_MESSAGE, isEmailAlreadyInUse: true };
  }
  if (classified.isNetworkError) {
    return { ...EMPTY_RESULT, message: NETWORK_ERROR_MESSAGE, isNetworkError: true };
  }
  if (classified.isForbidden) {
    return { ...EMPTY_RESULT, isForbidden: true };
  }
  return EMPTY_RESULT;
}
