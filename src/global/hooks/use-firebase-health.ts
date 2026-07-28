import { useEffect, useState } from 'react';
import { HealthRepository } from '@library/repositories/health.repository';

export type ServiceStatus = 'checking' | 'ok' | 'error';

export interface FirebaseHealth {
  auth: ServiceStatus;
  firestore: ServiceStatus;
  authDetail: string | null;
  firestoreDetail: string | null;
}

const INITIAL: FirebaseHealth = {
  auth: 'checking',
  firestore: 'checking',
  authDetail: null,
  firestoreDetail: null,
};

/**
 * Comprueba que Auth y Firestore respondan. Solo para la pantalla de
 * verificación del RC-001; se elimina cuando exista UI de producto.
 */
export function useFirebaseHealth(): FirebaseHealth {
  const [health, setHealth] = useState<FirebaseHealth>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const [authResult, firestoreResult] = await Promise.all([
        HealthRepository.checkAuth(),
        HealthRepository.checkFirestore(),
      ]);

      // El componente puede desmontarse antes de que resuelvan las promesas
      if (cancelled) return;

      setHealth({
        auth: authResult.ok ? 'ok' : 'error',
        firestore: firestoreResult.ok ? 'ok' : 'error',
        authDetail: authResult.detail,
        firestoreDetail: firestoreResult.detail,
      });
    };

    void check();

    return () => {
      cancelled = true;
    };
  }, []);

  return health;
}
