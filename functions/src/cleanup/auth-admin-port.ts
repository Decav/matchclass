import type { AuthUserSummary } from './select-stale-anonymous';

/**
 * Puertos minimos sobre el Admin SDK.
 *
 * En vez de tipar el orquestador contra `Auth` y `UserRecord` completos, se
 * declara solo lo que el job usa. Asi un test puede construir un doble con tres
 * lineas en vez de fabricar objetos del SDK, y el cableado real de
 * `index.ts` sigue verificandose en tiempo de compilacion: si `Auth` dejara de
 * satisfacer este puerto, `tsc` lo marca ahi.
 */

/** Subconjunto de `UserRecord` que necesita la seleccion. */
export interface AuthUserLike {
  readonly uid: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  /**
   * En el Admin SDK los usuarios anonimos llegan con `providerData: []` — un
   * arreglo vacio. No existe un proveedor `'anonymous'`: ese `isAnonymous` es
   * del SDK cliente (RC-017 §10, correccion de la especificacion).
   */
  readonly providerData: readonly { readonly providerId: string }[];
  readonly metadata: {
    readonly creationTime: string;
    /** Solo existe si el usuario refresco su token alguna vez. */
    readonly lastRefreshTime?: string | null;
  };
}

export interface DeleteUsersOutcome {
  readonly successCount: number;
  readonly failureCount: number;
  /** `index` es la posicion dentro del lote enviado, no un indice global. */
  readonly errors: readonly { readonly index: number; readonly error: { readonly message: string } }[];
}

export interface AuthAdminPort {
  listUsers(
    maxResults: number,
    pageToken?: string,
  ): Promise<{ readonly users: readonly AuthUserLike[]; readonly pageToken?: string }>;
  deleteUsers(uids: string[]): Promise<DeleteUsersOutcome>;
}

/**
 * Traduce un usuario del Admin SDK al resumen plano con el que trabaja la
 * seleccion.
 *
 * `lastRefreshTime ?? creationTime` es el criterio de la HU: una cuenta creada
 * para responder una vez y nunca reusada —el caso mas comun aca— puede no tener
 * `lastRefreshTime`. Sin el fallback, justo las cuentas que queremos limpiar
 * serian las que nunca califican.
 */
export function toAuthUserSummary(user: AuthUserLike): AuthUserSummary {
  const lastActivity = user.metadata.lastRefreshTime ?? user.metadata.creationTime;

  return {
    uid: user.uid,
    providerCount: user.providerData.length,
    hasEmail: Boolean(user.email),
    hasPhone: Boolean(user.phoneNumber),
    lastActivityAt: new Date(lastActivity),
  };
}
