import { describe, expect, it } from 'vitest';

import type { AuthUserLike } from './auth-admin-port';
import { toAuthUserSummary } from './auth-admin-port';
import { INACTIVITY_THRESHOLD_DAYS, MILLISECONDS_PER_DAY } from './cleanup-config';
import type { AuthUserSummary } from './select-stale-anonymous';
import { selectStaleAnonymousUids } from './select-stale-anonymous';

/** Fecha fija: la seleccion recibe `now` por parametro, asi que nada depende del reloj real. */
const NOW = new Date('2026-08-09T03:00:00.000Z');

const daysAgo = (days: number): Date => new Date(NOW.getTime() - days * MILLISECONDS_PER_DAY);

function anonymousUser(uid: string, lastActivityAt: Date): AuthUserSummary {
  return { uid, providerCount: 0, hasEmail: false, hasPhone: false, lastActivityAt };
}

function helperUser(uid: string, lastActivityAt: Date): AuthUserSummary {
  return { uid, providerCount: 1, hasEmail: true, hasPhone: false, lastActivityAt };
}

const select = (users: readonly AuthUserSummary[], protectedUids: ReadonlySet<string> = new Set<string>()) =>
  selectStaleAnonymousUids(users, protectedUids, NOW, INACTIVITY_THRESHOLD_DAYS);

describe('selectStaleAnonymousUids', () => {
  it('selecciona una cuenta anonima con 91 dias de inactividad y sin sala activa', () => {
    const result = select([anonymousUser('alumno-viejo', daysAgo(91))]);

    expect(result.uids).toEqual(['alumno-viejo']);
    expect(result.staleCandidates).toBe(1);
  });

  it('no selecciona una cuenta anonima con 89 dias de inactividad', () => {
    const result = select([anonymousUser('alumno-reciente', daysAgo(89))]);

    expect(result.uids).toEqual([]);
    expect(result.anonymousUsers).toBe(1);
    expect(result.staleCandidates).toBe(0);
  });

  it('conserva la cuenta que cae justo en el borde exacto del umbral', () => {
    // El empate favorece conservar: el borrado es irreversible y la corrida del
    // dia siguiente igual la va a tomar.
    const result = select([anonymousUser('alumno-borde', daysAgo(INACTIVITY_THRESHOLD_DAYS))]);

    expect(result.uids).toEqual([]);
  });

  it('no selecciona una cuenta anonima inactiva cuyo uid esta protegido por una sala activa', () => {
    const result = select([anonymousUser('alumno-en-sala-activa', daysAgo(200))], new Set(['alumno-en-sala-activa']));

    expect(result.uids).toEqual([]);
    expect(result.protectedByActiveRoom).toBe(1);
    expect(result.staleCandidates).toBe(0);
  });

  it('no selecciona una cuenta con email aunque lleve anos inactiva', () => {
    const result = select([helperUser('ayudante', daysAgo(1200))]);

    expect(result.uids).toEqual([]);
    expect(result.anonymousUsers).toBe(0);
    expect(result.scannedUsers).toBe(1);
  });

  it('no selecciona una cuenta sin proveedores pero con telefono', () => {
    // `providerData` vacio no alcanza: una cuenta con telefono no es anonima.
    const conTelefono: AuthUserSummary = {
      uid: 'con-telefono',
      providerCount: 0,
      hasEmail: false,
      hasPhone: true,
      lastActivityAt: daysAgo(365),
    };

    expect(select([conTelefono]).uids).toEqual([]);
  });

  it('evalua por creationTime la cuenta anonima que nunca refresco su token', () => {
    // El caso mas comun de la HU: el alumno responde una vez y no vuelve, asi
    // que `lastRefreshTime` puede no existir. Sin el fallback a `creationTime`,
    // justo estas cuentas nunca calificarian.
    const sinRefresh: AuthUserLike = {
      uid: 'nunca-volvio',
      providerData: [],
      metadata: { creationTime: daysAgo(120).toUTCString() },
    };

    const summary = toAuthUserSummary(sinRefresh);

    expect(summary.lastActivityAt.getTime()).toBe(daysAgo(120).getTime());
    expect(select([summary]).uids).toEqual(['nunca-volvio']);
  });

  it('prefiere lastRefreshTime cuando existe', () => {
    const refrescoAyer: AuthUserLike = {
      uid: 'volvio-ayer',
      providerData: [],
      metadata: { creationTime: daysAgo(300).toUTCString(), lastRefreshTime: daysAgo(1).toUTCString() },
    };

    expect(select([toAuthUserSummary(refrescoAyer)]).uids).toEqual([]);
  });

  it('cuenta en el reporte escaneadas, anonimas, protegidas y candidatas', () => {
    const result = select(
      [
        anonymousUser('vieja-1', daysAgo(120)),
        anonymousUser('vieja-2', daysAgo(400)),
        anonymousUser('protegida', daysAgo(400)),
        anonymousUser('reciente', daysAgo(10)),
        helperUser('ayudante', daysAgo(500)),
      ],
      new Set(['protegida']),
    );

    expect(result).toMatchObject({
      scannedUsers: 5,
      anonymousUsers: 4,
      protectedByActiveRoom: 1,
      staleCandidates: 2,
      // El orquestador los completa despues de llamar a `deleteUsers`.
      deleted: 0,
      failed: 0,
    });
    expect(result.uids).toEqual(['vieja-1', 'vieja-2']);
  });

  it('devuelve un reporte en cero con una lista vacia, sin errores', () => {
    const result = select([]);

    expect(result).toEqual({
      scannedUsers: 0,
      anonymousUsers: 0,
      protectedByActiveRoom: 0,
      staleCandidates: 0,
      deleted: 0,
      failed: 0,
      uids: [],
    });
  });
});
