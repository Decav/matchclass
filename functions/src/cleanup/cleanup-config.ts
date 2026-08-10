/**
 * Constantes de despliegue y ejecucion del job de limpieza (RC-017 §10 D3/D4).
 *
 * Todo lo que un dia podria querer cambiarse sin releer la logica vive aca, con
 * nombre propio: region, horario, umbral y el interruptor del dry-run.
 */

/**
 * La HU pide "diaria a las 3 AM" sin decir en que zona. Se fija
 * `America/Santiago`: el sistema lo usa un ayudante en Chile, y una limpieza
 * "de madrugada" en UTC caeria a medianoche local, en pleno uso.
 */
export const CLEANUP_SCHEDULE = '0 3 * * *';
export const CLEANUP_TIME_ZONE = 'America/Santiago';

/**
 * Misma region que el resto del proyecto usaria: la mas cercana a los usuarios.
 * Cambiar esto despues del primer deploy obliga a borrar y recrear la funcion,
 * asi que conviene decidirlo una sola vez.
 */
export const CLEANUP_REGION = 'southamerica-east1';

/** Ventana de inactividad de la HU-15. */
export const INACTIVITY_THRESHOLD_DAYS = 90;

/** Maximos que impone la API de Admin Auth: 1000 por pagina y 1000 por borrado. */
export const LIST_USERS_PAGE_SIZE = 1000;
export const DELETE_USERS_BATCH_SIZE = 1000;

export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Nombre de la variable de entorno que habilita el borrado real.
 * Se declara aparte para poder nombrarla en los logs y en los tests sin
 * repetir el string.
 */
export const DRY_RUN_ENV_VAR = 'CLEANUP_DRY_RUN';

/**
 * El dry-run es el estado por defecto (RC-017 §10 D3): solo el valor literal
 * `'false'` habilita el borrado.
 *
 * La asimetria es deliberada. Borrar cuentas de Auth es irreversible, el job
 * corre solo de madrugada y existe un unico proyecto de Firebase, sin staging:
 * una variable mal escrita, vacia o ausente tiene que degradar a "no borres
 * nada", nunca a "borra todo".
 */
export function isDryRunEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[DRY_RUN_ENV_VAR] !== 'false';
}
