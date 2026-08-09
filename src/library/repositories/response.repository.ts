import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@library/firebase/firebase-app';
import { toDateOrNull } from '@library/firebase/firestore-mappers';
import type { Response } from '@resources/entities/response.entity';

// Subcolección: las respuestas viven bajo su sala. Simplifica las Security
// Rules y evita un where('roomId', ...) en cada lectura.
const responsesRef = (roomId: string) => collection(db, 'rooms', roomId, 'responses');

function toResponse(snapshot: QueryDocumentSnapshot<DocumentData>): Response {
  const data = snapshot.data();
  const blocks = Array.isArray(data.occupiedBlocks) ? data.occupiedBlocks : [];
  return {
    id: snapshot.id,
    roomId: String(data.roomId ?? ''),
    studentName: String(data.studentName ?? ''),
    // Celdas día+bloque de la grilla (10 bloques × 5 días) — corregido de
    // 1-20 (bloque día-independiente) a 1-50 (tech-document.md §2.2, 2026-08-06).
    occupiedBlocks: blocks.map(Number).filter((b: number) => Number.isInteger(b) && b >= 1 && b <= 50),
    createdByUid: String(data.createdByUid ?? ''),
    createdAt: toDateOrNull(data.createdAt),
    updatedAt: toDateOrNull(data.updatedAt),
  };
}

export const ResponseRepository = {
  getMine: async (roomId: string, uid: string): Promise<Response | null> => {
    const snapshot = await getDoc(doc(responsesRef(roomId), uid));
    if (!snapshot.exists()) return null;
    return toResponse(snapshot);
  },

  /**
   * Conteo para el dashboard (RC-008 §5). Usa una agregación del lado del
   * servidor (`getCountFromServer`) en vez de `getDocs` + `.length`: no
   * descarga los documentos completos, solo el número.
   */
  countByRoom: async (roomId: string): Promise<number> => {
    const snapshot = await getCountFromServer(responsesRef(roomId));
    return snapshot.data().count;
  },

  /**
   * El id del documento ES el uid anónimo del alumno:
   * - responder dos veces sobrescribe en vez de duplicar
   * - la Security Rule se reduce a `request.auth.uid == responseId`
   */
  submit: (
    roomId: string,
    uid: string,
    data: Pick<Response, 'studentName' | 'occupiedBlocks'>,
  ): Promise<void> =>
    setDoc(
      doc(responsesRef(roomId), uid),
      { ...data, roomId, createdByUid: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      { merge: true },
    ),

  /**
   * Escritura de "SubmitStudentBlocks" (RC-013 §5/§7, HU-11 Escenario 2).
   * `updateDoc` y no `submit`: aquel es un `setDoc(..., { merge: true })`
   * que reescribe `createdAt` en cada llamada — perdería la fecha real de
   * la primera respuesta — y exige `studentName`, que esta pantalla no
   * tiene a mano. Acá se tocan exactamente los dos campos que cambian.
   */
  updateBlocks: async (roomId: string, uid: string, occupiedBlocks: number[]): Promise<void> => {
    await updateDoc(doc(responsesRef(roomId), uid), { occupiedBlocks, updatedAt: serverTimestamp() });
  },
};
