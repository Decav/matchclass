import { doc, getDoc, setDoc, type DocumentData } from 'firebase/firestore';
import { db } from '@library/firebase/firebase-app';
import { toDateOrNull } from '@library/firebase/firestore-mappers';
import type { User, UserRole } from '@resources/entities/user.entity';

/**
 * Mapper obligatorio: `snapshot.data()` es `DocumentData` (`any` en la
 * práctica). Se valida campo a campo, igual que `ResponseRepository` /
 * `RoomRepository` — nunca `snapshot.data() as User`.
 */
function toUser(uid: string, data: DocumentData): User {
  const role: UserRole = data.role === 'admin' ? 'admin' : 'helper';
  return {
    id: uid,
    email: String(data.email ?? ''),
    displayName: String(data.displayName ?? ''),
    role,
    createdAt: toDateOrNull(data.createdAt),
  };
}

export const UserRepository = {
  getById: async (uid: string): Promise<User | null> => {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (!snapshot.exists()) return null;
    return toUser(uid, snapshot.data());
  },

  /**
   * Use case "RegisterAyudante" (RC-004 §6, paso 3). Crea `users/{uid}` con
   * `role` fijo en `'helper'` — el registro no permite elegir rol.
   */
  create: async (
    uid: string,
    data: Pick<User, 'displayName' | 'email' | 'role' | 'createdAt'>,
  ): Promise<void> => {
    await setDoc(doc(db, 'users', uid), {
      displayName: data.displayName,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt,
    });
  },
};
