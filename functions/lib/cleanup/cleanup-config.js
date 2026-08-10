"use strict";
/**
 * Constantes de despliegue y ejecucion del job de limpieza (RC-017 §10 D3/D4).
 *
 * Todo lo que un dia podria querer cambiarse sin releer la logica vive aca, con
 * nombre propio: region, horario, umbral y el interruptor del dry-run.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRY_RUN_ENV_VAR = exports.MILLISECONDS_PER_DAY = exports.DELETE_USERS_BATCH_SIZE = exports.LIST_USERS_PAGE_SIZE = exports.INACTIVITY_THRESHOLD_DAYS = exports.CLEANUP_REGION = exports.CLEANUP_TIME_ZONE = exports.CLEANUP_SCHEDULE = void 0;
exports.isDryRunEnabled = isDryRunEnabled;
/**
 * La HU pide "diaria a las 3 AM" sin decir en que zona. Se fija
 * `America/Santiago`: el sistema lo usa un ayudante en Chile, y una limpieza
 * "de madrugada" en UTC caeria a medianoche local, en pleno uso.
 */
exports.CLEANUP_SCHEDULE = '0 3 * * *';
exports.CLEANUP_TIME_ZONE = 'America/Santiago';
/**
 * Misma region que el resto del proyecto usaria: la mas cercana a los usuarios.
 * Cambiar esto despues del primer deploy obliga a borrar y recrear la funcion,
 * asi que conviene decidirlo una sola vez.
 */
exports.CLEANUP_REGION = 'southamerica-east1';
/** Ventana de inactividad de la HU-15. */
exports.INACTIVITY_THRESHOLD_DAYS = 90;
/** Maximos que impone la API de Admin Auth: 1000 por pagina y 1000 por borrado. */
exports.LIST_USERS_PAGE_SIZE = 1000;
exports.DELETE_USERS_BATCH_SIZE = 1000;
exports.MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
/**
 * Nombre de la variable de entorno que habilita el borrado real.
 * Se declara aparte para poder nombrarla en los logs y en los tests sin
 * repetir el string.
 */
exports.DRY_RUN_ENV_VAR = 'CLEANUP_DRY_RUN';
/**
 * El dry-run es el estado por defecto (RC-017 §10 D3): solo el valor literal
 * `'false'` habilita el borrado.
 *
 * La asimetria es deliberada. Borrar cuentas de Auth es irreversible, el job
 * corre solo de madrugada y existe un unico proyecto de Firebase, sin staging:
 * una variable mal escrita, vacia o ausente tiene que degradar a "no borres
 * nada", nunca a "borra todo".
 */
function isDryRunEnabled(env = process.env) {
    return env[exports.DRY_RUN_ENV_VAR] !== 'false';
}
//# sourceMappingURL=cleanup-config.js.map