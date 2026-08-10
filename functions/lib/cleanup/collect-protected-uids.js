"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectProtectedUids = collectProtectedUids;
/**
 * Devuelve los uids que respondieron en alguna sala todavia `active`: las
 * cuentas que el job no puede tocar aunque lleven meses sin refrescar el token
 * (Escenario 2 de la HU-15).
 *
 * Consulta invertida (RC-017 §10 D2): se listan las salas activas y se leen los
 * *ids de documento* de sus subcolecciones `responses` — el id ya es el uid del
 * alumno (RC-003). La alternativa, un collection group query sobre `responses`
 * filtrando por `createdByUid`, exigiria declarar a mano un indice de grupo de
 * colecciones en `firestore.indexes.json` y leeria muchos mas documentos para
 * llegar a la misma regla.
 *
 * `.select()` sin campos trae solo los ids, no el cuerpo de cada respuesta: es
 * la diferencia entre leer un uid y leer la grilla completa de cada alumno.
 *
 * Si esta lectura falla, el error se propaga y el job aborta sin borrar nada
 * (RC-017 §4): sin la lista de protegidos no hay forma de distinguir una cuenta
 * viva de una muerta, y equivocarse no se deshace.
 */
async function collectProtectedUids(db) {
    const activeRooms = await db.collection('rooms').where('status', '==', 'active').select().get();
    const responseSnapshots = await Promise.all(activeRooms.docs.map((room) => room.ref.collection('responses').select().get()));
    const protectedUids = new Set();
    for (const snapshot of responseSnapshots) {
        for (const response of snapshot.docs) {
            protectedUids.add(response.id);
        }
    }
    return protectedUids;
}
//# sourceMappingURL=collect-protected-uids.js.map