import {
  collection,
  doc,
  getDoc,
  setDoc,
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
    occupiedBlocks: blocks.map(Number).filter((b: number) => Number.isInteger(b) && b >= 1 && b <= 20),
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
};
