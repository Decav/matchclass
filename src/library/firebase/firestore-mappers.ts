import { Timestamp } from 'firebase/firestore';

/**
 * `snapshot.data()` es `DocumentData` (`any` en la práctica): un campo de
 * Firestore Timestamp llega como `any`, y encadenar `data.createdAt?.toDate?.()`
 * dispara `@typescript-eslint/no-unsafe-*` (proyecto usa
 * `recommendedTypeChecked`). `instanceof Timestamp` narrows a un tipo real
 * antes de llamar `.toDate()` — sin `any` de por medio.
 */
export function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}
