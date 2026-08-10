import { MILLISECONDS_PER_DAY } from './cleanup-config';

/**
 * Resumen plano de una cuenta de Auth, con lo unico que mira la seleccion.
 *
 * Es un tipo propio y no el `UserRecord` del Admin SDK a proposito (RC-017 §5):
 * los tests de la regla —que es donde vive el riesgo real de esta HU— no tienen
 * que fabricar objetos de Firebase para ejercitarla.
 */
export interface AuthUserSummary {
  readonly uid: string;
  readonly providerCount: number;
  readonly hasEmail: boolean;
  readonly hasPhone: boolean;
  /** `lastRefreshTime ?? creationTime`, ya resuelto por `toAuthUserSummary`. */
  readonly lastActivityAt: Date;
}

/** Lo que se escribe en los logs al cerrar cada corrida (RC-017 §3, Escenario 4). */
export interface CleanupReport {
  scannedUsers: number;
  anonymousUsers: number;
  protectedByActiveRoom: number;
  staleCandidates: number;
  deleted: number;
  failed: number;
}

export type StaleAnonymousSelection = CleanupReport & { uids: string[] };

/**
 * Una cuenta es anonima cuando no tiene ningun proveedor vinculado ni email ni
 * telefono.
 *
 * La HU original decia "filtrar usuarios donde `providerData` solo contenga
 * `anonymous`". Eso no existe en el Admin SDK y, implementado literal, el
 * filtro daria cero coincidencias: el job no borraria nunca nada y nadie se
 * enteraria, porque el log diria "0 eliminadas" sin error alguno. La regla
 * corregida (RC-017 §10, y ya aplicada en la HU) es `providerData.length === 0
 * && !email && !phoneNumber`.
 */
function isAnonymous(user: AuthUserSummary): boolean {
  return user.providerCount === 0 && !user.hasEmail && !user.hasPhone;
}

/**
 * Selecciona las cuentas anonimas sin actividad que se pueden borrar.
 *
 * Funcion pura: sin Firebase, sin reloj propio, sin logs. `now` y
 * `thresholdDays` entran por parametro para que los bordes del umbral se puedan
 * afirmar en un test sin manipular el reloj del proceso.
 *
 * Los tres filtros se aplican en orden y cada uno alimenta un contador del
 * reporte, de modo que el log explique *por que* se borro poco o nada:
 * "escanee 4000, 3900 eran anonimas, 120 estaban protegidas por una sala
 * activa, 3200 pasaron el umbral".
 *
 * `deleted` y `failed` salen en cero: los completa el orquestador despues de
 * llamar a `deleteUsers`, porque aca todavia no se borro nada.
 */
export function selectStaleAnonymousUids(
  users: readonly AuthUserSummary[],
  protectedUids: ReadonlySet<string>,
  now: Date,
  thresholdDays: number,
): StaleAnonymousSelection {
  const cutoff = now.getTime() - thresholdDays * MILLISECONDS_PER_DAY;

  const report: CleanupReport = {
    scannedUsers: users.length,
    anonymousUsers: 0,
    protectedByActiveRoom: 0,
    staleCandidates: 0,
    deleted: 0,
    failed: 0,
  };
  const uids: string[] = [];

  for (const user of users) {
    if (!isAnonymous(user)) continue;
    report.anonymousUsers += 1;

    if (protectedUids.has(user.uid)) {
      report.protectedByActiveRoom += 1;
      continue;
    }

    // Estrictamente anterior al corte: en el empate exacto —y ante una fecha
    // invalida, donde la comparacion da `false`— la cuenta se conserva. El
    // borrado es irreversible y una corrida mas tarde vuelve a evaluarla.
    if (user.lastActivityAt.getTime() < cutoff) {
      uids.push(user.uid);
    }
  }

  report.staleCandidates = uids.length;

  return { ...report, uids };
}
