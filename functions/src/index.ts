import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import {
  CLEANUP_REGION,
  CLEANUP_SCHEDULE,
  CLEANUP_TIME_ZONE,
  isDryRunEnabled,
} from './cleanup/cleanup-config';
import { collectProtectedUids } from './cleanup/collect-protected-uids';
import { runAnonymousAccountsCleanup } from './cleanup/run-cleanup';

if (getApps().length === 0) {
  initializeApp();
}

/**
 * Limpieza diaria de cuentas anonimas sin actividad (HU-15 / RC-017).
 *
 * Este archivo es solo cableado: la regla vive en `selectStaleAnonymousUids`
 * —pura y testeada— y la orquestacion en `runAnonymousAccountsCleanup`. Aca no
 * hay logica que testear, y por eso tampoco tiene test propio.
 *
 * Ojo con el Admin SDK: ignora `firestore.rules` y corre con privilegios
 * completos. La unica barrera real entre este job y una cuenta viva es el
 * filtro de exclusion por sala activa, y por eso el job aborta si no lo puede
 * construir.
 *
 * `retryCount: 0`: si una corrida falla, la del dia siguiente hace el mismo
 * trabajo. El job es idempotente —una cuenta ya borrada no vuelve a aparecer en
 * `listUsers`—, asi que reintentar de inmediato solo suma riesgo sin agregar
 * nada.
 */
export const cleanupAnonymousAccounts = onSchedule(
  {
    schedule: CLEANUP_SCHEDULE,
    timeZone: CLEANUP_TIME_ZONE,
    region: CLEANUP_REGION,
    retryCount: 0,
    // Paginar Auth y borrar en lotes de 1000 puede tomar varios minutos con un
    // volumen grande; el default de 60s se quedaria corto justo la primera vez.
    timeoutSeconds: 540,
    memory: '256MiB',
  },
  async () => {
    await runAnonymousAccountsCleanup({
      auth: getAuth(),
      collectProtectedUids: () => collectProtectedUids(getFirestore()),
      logger,
      // Se lee en cada invocacion, no al desplegar: cambiar la variable de
      // entorno alcanza para pasar de dry-run a borrado real.
      dryRun: isDryRunEnabled(),
    });
  },
);
