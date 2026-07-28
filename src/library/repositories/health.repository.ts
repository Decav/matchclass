import { FirebaseError } from 'firebase/app';
import { signInAnonymously, signOut } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db } from '@library/firebase/firebase-app';

export interface HealthResult {
  ok: boolean;
  detail: string | null;
}

function describeError(error: unknown): string {
  // instanceof es un type guard real; no castear con `as FirebaseError`
  if (error instanceof FirebaseError) return `${error.code}`;
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}

/**
 * Comprobaciones de conectividad para la pantalla de verificación del RC-001.
 * Temporal: se elimina cuando RC-003 y RC-004 aporten flujos reales.
 */
export const HealthRepository = {
  /**
   * Abre una sesión anónima y la cierra. Verifica de paso que el proveedor
   * Anonymous esté habilitado, que es requisito del RC-005.
   */
  checkAuth: async (): Promise<HealthResult> => {
    try {
      const credential = await signInAnonymously(auth);
      const uid = credential.user.uid;
      await signOut(auth);
      return { ok: true, detail: `sesión anónima ok (uid ${uid.slice(0, 8)}…)` };
    } catch (error) {
      return { ok: false, detail: describeError(error) };
    }
  },

  /** Lee una colección vacía: confirma que Firestore responde y las reglas cargan. */
  checkFirestore: async (): Promise<HealthResult> => {
    try {
      const snapshot = await getDocs(query(collection(db, 'rooms'), limit(1)));
      return { ok: true, detail: `colección "rooms" legible (${snapshot.size} doc.)` };
    } catch (error) {
      return { ok: false, detail: describeError(error) };
    }
  },
};
