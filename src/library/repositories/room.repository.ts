import {
  collection,
  getDocs,
  query,
  where,
  limit,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@library/firebase/firebase-app';
import { toDateOrNull } from '@library/firebase/firestore-mappers';
import type { Room, RoomStatus } from '@resources/entities/room.entity';

const ROOM_STATUSES: readonly RoomStatus[] = ['active', 'closed', 'archived'];

function isRoomStatus(value: unknown): value is RoomStatus {
  return ROOM_STATUSES.includes(value as RoomStatus);
}

function toRoom(snapshot: QueryDocumentSnapshot<DocumentData>): Room {
  const data = snapshot.data();
  const blockedSlots = Array.isArray(data.helperBlockedSlots)
    ? data.helperBlockedSlots.map(Number).filter((n: number) => Number.isInteger(n))
    : [];

  const base: Room = {
    id: snapshot.id,
    code: String(data.code ?? ''),
    name: String(data.name ?? ''),
    subject: String(data.subject ?? ''),
    section: String(data.section ?? ''),
    createdBy: String(data.createdBy ?? ''),
    createdAt: toDateOrNull(data.createdAt) ?? new Date(0),
    status: isRoomStatus(data.status) ? data.status : 'closed',
    helperBlockedSlots: blockedSlots,
  };

  // `exactOptionalPropertyTypes` no permite `studentLimit: undefined`
  // explícito: se omite la clave por completo cuando no hay dato.
  return typeof data.studentLimit === 'number' ? { ...base, studentLimit: data.studentLimit } : base;
}

export const RoomRepository = {
  /**
   * El alumno entra con un código corto (`"EDS101"`), no con el id del
   * documento. Se normaliza a mayúsculas aquí — Firestore no hace match
   * case-insensitive — antes de consultar.
   */
  findByCode: async (code: string): Promise<Room | null> => {
    const snapshot = await getDocs(
      query(collection(db, 'rooms'), where('code', '==', code.toUpperCase()), limit(1)),
    );
    const first = snapshot.docs[0];
    return first ? toRoom(first) : null;
  },
};
