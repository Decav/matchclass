import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
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
   * Suscripción al estado de sesión. Devuelve la función de desuscripción:
   * quien la llame es responsable de invocarla en el cleanup del efecto.
   */
  subscribeToAuthState: (callback: (uid: string | null) => void): (() => void) =>
    onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      callback(fbUser ? fbUser.uid : null);
    }),
};
