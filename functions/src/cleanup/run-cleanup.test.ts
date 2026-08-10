import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthAdminPort, AuthUserLike, DeleteUsersOutcome } from './auth-admin-port';
import { MILLISECONDS_PER_DAY } from './cleanup-config';
import type { CleanupLogger } from './run-cleanup';
import { runAnonymousAccountsCleanup } from './run-cleanup';

const NOW = new Date('2026-08-09T03:00:00.000Z');

const daysAgo = (days: number): string => new Date(NOW.getTime() - days * MILLISECONDS_PER_DAY).toUTCString();

function anonymous(uid: string, days: number): AuthUserLike {
  return { uid, providerData: [], metadata: { creationTime: daysAgo(days) } };
}

function helper(uid: string): AuthUserLike {
  return {
    uid,
    email: 'ayudante@matchclass.cl',
    providerData: [{ providerId: 'password' }],
    metadata: { creationTime: daysAgo(900) },
  };
}

const NO_FAILURES: DeleteUsersOutcome = { successCount: 0, failureCount: 0, errors: [] };

interface FakeAuth extends AuthAdminPort {
  deleteUsers: MockedFunction<AuthAdminPort['deleteUsers']>;
}

interface FakeLogger extends CleanupLogger {
  info: MockedFunction<CleanupLogger['info']>;
  error: MockedFunction<CleanupLogger['error']>;
}

/**
 * Doble del Admin SDK. Cada elemento de `pages` es una pagina de `listUsers`,
 * para ejercitar tambien el bucle de `pageToken`.
 */
function fakeAuth(pages: AuthUserLike[][]): FakeAuth {
  return {
    listUsers: (_maxResults: number, pageToken?: string) => {
      const index = pageToken === undefined ? 0 : Number(pageToken);
      const users = pages[index] ?? [];
      const hasNext = index + 1 < pages.length;
      return Promise.resolve(hasNext ? { users, pageToken: String(index + 1) } : { users });
    },
    deleteUsers: vi.fn<AuthAdminPort['deleteUsers']>((uids) =>
      Promise.resolve({ ...NO_FAILURES, successCount: uids.length }),
    ),
  };
}

function fakeLogger(): FakeLogger {
  return { info: vi.fn<CleanupLogger['info']>(), error: vi.fn<CleanupLogger['error']>() };
}

describe('runAnonymousAccountsCleanup', () => {
  let logger: ReturnType<typeof fakeLogger>;

  beforeEach(() => {
    logger = fakeLogger();
  });

  it('en dry-run recorre todo y no llama a deleteUsers ni una vez', async () => {
    const auth = fakeAuth([[anonymous('vieja-1', 120), anonymous('vieja-2', 400), helper('ayudante')]]);

    const report = await runAnonymousAccountsCleanup({
      auth,
      collectProtectedUids: () => Promise.resolve(new Set<string>()),
      logger,
      now: NOW,
      dryRun: true,
    });

    expect(auth.deleteUsers).not.toHaveBeenCalled();
    expect(report).toMatchObject({ scannedUsers: 3, anonymousUsers: 2, staleCandidates: 2, deleted: 0, failed: 0 });
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('DRY-RUN'),
      expect.objectContaining({ dryRun: true, staleCandidates: 2 }),
    );
  });

  it('sin bandera explicita asume dry-run', async () => {
    // Un cableado nuevo que se olvide de pasar `dryRun` no debe borrar nada.
    const auth = fakeAuth([[anonymous('vieja', 400)]]);

    await runAnonymousAccountsCleanup({
      auth,
      collectProtectedUids: () => Promise.resolve(new Set<string>()),
      logger,
      now: NOW,
    });

    expect(auth.deleteUsers).not.toHaveBeenCalled();
  });

  it('con dry-run deshabilitado borra las cuentas seleccionadas y pagina la lista completa', async () => {
    const auth = fakeAuth([
      [anonymous('vieja-1', 120), anonymous('protegida', 400)],
      [anonymous('vieja-2', 400), anonymous('reciente', 3), helper('ayudante')],
    ]);

    const report = await runAnonymousAccountsCleanup({
      auth,
      collectProtectedUids: () => Promise.resolve(new Set(['protegida'])),
      logger,
      now: NOW,
      dryRun: false,
    });

    expect(auth.deleteUsers).toHaveBeenCalledTimes(1);
    expect(auth.deleteUsers).toHaveBeenCalledWith(['vieja-1', 'vieja-2']);
    expect(report).toEqual({
      scannedUsers: 5,
      anonymousUsers: 4,
      protectedByActiveRoom: 1,
      staleCandidates: 2,
      deleted: 2,
      failed: 0,
    });
  });

  it('cuenta los fallos parciales de deleteUsers y sigue', async () => {
    const auth = fakeAuth([[anonymous('vieja-1', 120), anonymous('vieja-2', 400)]]);
    auth.deleteUsers.mockResolvedValue({
      successCount: 1,
      failureCount: 1,
      errors: [{ index: 1, error: { message: 'INTERNAL_ERROR' } }],
    } satisfies DeleteUsersOutcome);

    const report = await runAnonymousAccountsCleanup({
      auth,
      collectProtectedUids: () => Promise.resolve(new Set<string>()),
      logger,
      now: NOW,
      dryRun: false,
    });

    expect(report).toMatchObject({ deleted: 1, failed: 1 });
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('no se pudo borrar'),
      expect.objectContaining({ uid: 'vieja-2', reason: 'INTERNAL_ERROR' }),
    );
    // El fallo parcial no aborta la corrida: igual se cierra con su reporte.
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('completada'), expect.anything());
  });

  it('aborta sin borrar nada si falla la lectura de salas activas', async () => {
    const auth = fakeAuth([[anonymous('vieja', 400)]]);

    await expect(
      runAnonymousAccountsCleanup({
        auth,
        collectProtectedUids: () => Promise.reject(new Error('Firestore no responde')),
        logger,
        now: NOW,
        dryRun: false,
      }),
    ).rejects.toThrow('Firestore no responde');

    expect(auth.deleteUsers).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('se aborta sin borrar nada'),
      expect.objectContaining({ reason: 'Firestore no responde' }),
    );
  });

  it('divide el borrado en lotes de a lo sumo 1000 uids', async () => {
    const users = Array.from({ length: 1200 }, (_value, index) => anonymous(`alumno-${index}`, 400));
    const auth = fakeAuth([users]);

    const report = await runAnonymousAccountsCleanup({
      auth,
      collectProtectedUids: () => Promise.resolve(new Set<string>()),
      logger,
      now: NOW,
      dryRun: false,
    });

    expect(auth.deleteUsers).toHaveBeenCalledTimes(2);
    const [primerLote, segundoLote] = auth.deleteUsers.mock.calls;
    expect(primerLote?.[0]).toHaveLength(1000);
    expect(segundoLote?.[0]).toHaveLength(200);
    expect(report.deleted).toBe(1200);
  });
});
