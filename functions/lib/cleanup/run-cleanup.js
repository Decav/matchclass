"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAnonymousAccountsCleanup = runAnonymousAccountsCleanup;
const auth_admin_port_1 = require("./auth-admin-port");
const cleanup_config_1 = require("./cleanup-config");
const select_stale_anonymous_1 = require("./select-stale-anonymous");
const LOG_PREFIX = 'cleanup-anonymous';
/** Cuantos uids se listan en el log del dry-run antes de que deje de ser util leerlo. */
const DRY_RUN_SAMPLE_SIZE = 20;
/**
 * Corre una limpieza completa y devuelve el `CleanupReport` de la corrida.
 *
 * Orden: recolectar protegidos -> paginar usuarios -> seleccionar -> borrar en
 * lotes -> loguear. Los protegidos se leen *antes* de tocar Auth a proposito:
 * si esa lectura falla, se aborta sin haber borrado nada (RC-017 §4).
 */
async function runAnonymousAccountsCleanup(deps) {
    const { auth, logger } = deps;
    const now = deps.now ?? new Date();
    const thresholdDays = deps.thresholdDays ?? cleanup_config_1.INACTIVITY_THRESHOLD_DAYS;
    const dryRun = deps.dryRun ?? true;
    let protectedUids;
    try {
        protectedUids = await deps.collectProtectedUids();
    }
    catch (error) {
        logger.error(`${LOG_PREFIX}: no se pudieron leer las salas activas; se aborta sin borrar nada`, {
            reason: describeError(error),
        });
        // Se relanza para que la invocacion quede marcada como fallida en Cloud
        // Logging: un job que se rinde en silencio es indistinguible de uno que no
        // encontro nada que borrar.
        throw error;
    }
    const users = await listAllUsers(auth);
    const { uids, ...report } = (0, select_stale_anonymous_1.selectStaleAnonymousUids)(users, protectedUids, now, thresholdDays);
    if (dryRun) {
        logger.info(`${LOG_PREFIX}: DRY-RUN, no se borro ninguna cuenta`, {
            ...report,
            dryRun: true,
            hint: `Para habilitar el borrado real, ${cleanup_config_1.DRY_RUN_ENV_VAR}='false'`,
            sampleUids: uids.slice(0, DRY_RUN_SAMPLE_SIZE),
        });
        return report;
    }
    for (const batch of chunk(uids, cleanup_config_1.DELETE_USERS_BATCH_SIZE)) {
        // `deleteUsers` no lanza ante fallos parciales: devuelve `errors[]` por
        // lote. Se cuentan, se loguean con su uid y la corrida sigue (RC-017 §4).
        const outcome = await auth.deleteUsers(batch);
        report.deleted += outcome.successCount;
        report.failed += outcome.errors.length;
        for (const failure of outcome.errors) {
            logger.error(`${LOG_PREFIX}: no se pudo borrar una cuenta`, {
                uid: batch[failure.index] ?? '(indice fuera de rango)',
                reason: failure.error.message,
            });
        }
    }
    logger.info(`${LOG_PREFIX}: limpieza completada`, { ...report, dryRun: false });
    return report;
}
/**
 * Recorre las paginas de `listUsers` y devuelve el resumen de cada cuenta.
 *
 * Se acumula la lista completa en memoria en vez de seleccionar pagina por
 * pagina: el `CleanupReport` describe la corrida entera y asi la funcion pura
 * recibe todo de una. Son objetos de cinco campos —a escala de este proyecto,
 * miles de cuentas, no es un problema—; si algun dia lo fuera, el cambio es
 * seleccionar por pagina y sumar los reportes.
 */
async function listAllUsers(auth) {
    const users = [];
    let pageToken;
    do {
        const page = await auth.listUsers(cleanup_config_1.LIST_USERS_PAGE_SIZE, pageToken);
        for (const user of page.users) {
            users.push((0, auth_admin_port_1.toAuthUserSummary)(user));
        }
        pageToken = page.pageToken;
    } while (pageToken !== undefined);
    return users;
}
/** Parte la lista en lotes del tamano maximo que acepta `deleteUsers`. */
function chunk(uids, size) {
    const batches = [];
    for (let index = 0; index < uids.length; index += size) {
        batches.push(uids.slice(index, index + size));
    }
    return batches;
}
function describeError(error) {
    return error instanceof Error ? error.message : 'error desconocido';
}
//# sourceMappingURL=run-cleanup.js.map