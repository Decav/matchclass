"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupAnonymousAccounts = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const cleanup_config_1 = require("./cleanup/cleanup-config");
const collect_protected_uids_1 = require("./cleanup/collect-protected-uids");
const run_cleanup_1 = require("./cleanup/run-cleanup");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
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
exports.cleanupAnonymousAccounts = (0, scheduler_1.onSchedule)({
    schedule: cleanup_config_1.CLEANUP_SCHEDULE,
    timeZone: cleanup_config_1.CLEANUP_TIME_ZONE,
    region: cleanup_config_1.CLEANUP_REGION,
    retryCount: 0,
    // Paginar Auth y borrar en lotes de 1000 puede tomar varios minutos con un
    // volumen grande; el default de 60s se quedaria corto justo la primera vez.
    timeoutSeconds: 540,
    memory: '256MiB',
}, async () => {
    await (0, run_cleanup_1.runAnonymousAccountsCleanup)({
        auth: (0, auth_1.getAuth)(),
        collectProtectedUids: () => (0, collect_protected_uids_1.collectProtectedUids)((0, firestore_1.getFirestore)()),
        logger,
        // Se lee en cada invocacion, no al desplegar: cambiar la variable de
        // entorno alcanza para pasar de dry-run a borrado real.
        dryRun: (0, cleanup_config_1.isDryRunEnabled)(),
    });
});
//# sourceMappingURL=index.js.map