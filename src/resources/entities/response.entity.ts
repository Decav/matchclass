/**
 * Respuesta de un alumno dentro de una sala (docs/tech-document.md §2.2),
 * en `rooms/{roomId}/responses/{uid}`.
 *
 * RC-003 la crea (`studentName` + `occupiedBlocks: []`) y la lee
 * (`getMine`). Llenar `occupiedBlocks` en la grilla es RC-005.
 *
 * Invariante: `id === createdByUid` — el id del documento ES el uid anónimo
 * del alumno que lo creó (ver seed/06-auth-integration.md).
 */
export interface Response {
  id: string;
  roomId: string;
  studentName: string;
  occupiedBlocks: number[];
  createdByUid: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
