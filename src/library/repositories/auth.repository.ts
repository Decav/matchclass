import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@library/firebase/firebase-app';

/**
 * Único archivo que conoce `FirebaseUser`. El contrato de HU-01/HU-02 pide
 * leer/escribir `users/{uid}` por separado (`UserRepository`) — este
 * repository solo resuelve identidad/sesión, no perfil.
 */
export const AuthRepository = {
  loginWithEmail: async (email: string, password: string): Promise<{ uid: string }> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { uid: credential.user.uid };
  },

  /**
   * Use case "RegisterAyudante" (RC-004 §6, paso 2). Firebase Auth deja la
   * sesión iniciada automáticamente tras crear la cuenta — no hace falta un
   * login explícito después.
   */
  registerWithEmail: async (email: string, password: string): Promise<{ uid: string }> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return { uid: credential.user.uid };
  },

  /**
   * Acceso del alumno: sin registro ni contraseña, pero con un uid real y
   * persistente (Firebase Auth lo guarda en IndexedDB). Idempotente: si ya
   * hay sesión (anónima o no), la reutiliza en vez de crear una nueva.
   */
  ensureAnonymousSession: async (): Promise<string> => {
    if (auth.currentUser) return auth.currentUser.uid;
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  },

  /**
   * uid de la sesión ya restaurada desde IndexedDB, o `null` si no hay
   * ninguna (RC-013 §5, HU-11 Escenario 3).
   *
   * No se resuelve con `auth.currentUser` ni con `ensureAnonymousSession`:
   * al cargar la página en frío, `currentUser` es `null` durante los
   * primeros milisegundos hasta que el SDK termina de restaurar la sesión.
   * `ensureAnonymousSession` en ese instante crearía un uid anónimo NUEVO y
   * el alumno vería la grilla vacía en vez de su respuesta previa.
   * `onAuthStateChanged` emite recién cuando la restauración terminó — se
   * toma esa primera emisión y se corta la suscripción ahí mismo.
   */
  getRestoredUid: (): Promise<string | null> =>
    new Promise((resolve) => {
      // `emitted` cubre el caso en que el callback se dispara de forma
      // síncrona: ahí `unsubscribe` todavía no está asignado y el
      // `unsubscribe?.()` de adentro no hace nada, así que hay que cortar
      // la suscripción después de la asignación. En el caso asíncrono
      // (el real) pasa lo contrario. Entre los dos, se desuscribe siempre
      // exactamente una vez.
      const subscription: { emitted: boolean; unsubscribe?: () => void } = { emitted: false };
      subscription.unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        subscription.emitted = true;
        subscription.unsubscribe?.();
        resolve(fbUser ? fbUser.uid : null);
      });
      if (subscription.emitted) subscription.unsubscribe();
    }),

  /**
   * Use case "LogoutAyudante" (RC-006 §6, paso 1). Invalida la sesión real
   * en IndexedDB — tras esto, `subscribeToAuthState`/`onAuthStateChanged`
   * emite `null` incluso recargando la página (HU-04, Escenario 3).
   */
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  /**
   * Use case "RecoverPassword" (RC-007 §6, paso 2). Wrapper delgado de
   * `sendPasswordResetEmail(auth, email)` — no swallowea ningún error
   * (incluido `auth/user-not-found`): tratar ese código como éxito es una
   * decisión de producto/seguridad de HU-05, no de este repository, y vive
   * en `useRecoverPasswordMutation`.
   */
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    await firebaseSendPasswordResetEmail(auth, email);
  },

  /**
   * Suscripción al estado de sesión. Devuelve la función de desuscripción:
   * quien la llame es responsable de invocarla en el cleanup del efecto.
   */
  subscribeToAuthState: (callback: (uid: string | null) => void): (() => void) =>
    onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      callback(fbUser ? fbUser.uid : null);
    }),
};
