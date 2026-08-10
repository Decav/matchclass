"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuthUserSummary = toAuthUserSummary;
/**
 * Traduce un usuario del Admin SDK al resumen plano con el que trabaja la
 * seleccion.
 *
 * `lastRefreshTime ?? creationTime` es el criterio de la HU: una cuenta creada
 * para responder una vez y nunca reusada —el caso mas comun aca— puede no tener
 * `lastRefreshTime`. Sin el fallback, justo las cuentas que queremos limpiar
 * serian las que nunca califican.
 */
function toAuthUserSummary(user) {
    const lastActivity = user.metadata.lastRefreshTime ?? user.metadata.creationTime;
    return {
        uid: user.uid,
        providerCount: user.providerData.length,
        hasEmail: Boolean(user.email),
        hasPhone: Boolean(user.phoneNumber),
        lastActivityAt: new Date(lastActivity),
    };
}
//# sourceMappingURL=auth-admin-port.js.map