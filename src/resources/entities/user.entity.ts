/**
 * Perfil del ayudante, leído de `users/{uid}` en Firestore.
 *
 * No confundir con el `FirebaseUser` del SDK: este `User` es el modelo de
 * dominio, agnóstico de Firebase (docs/tech-document.md §2.5).
 */
export type UserRole = 'helper' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date | null;
}
