/**
 * Sala creada por un ayudante (docs/tech-document.md §2.1).
 *
 * RC-003 solo la lee (`RoomRepository.findByCode`). El CRUD completo
 * (crear, cerrar, `helperBlockedSlots`) es RC-004 — no redefinir esta forma
 * ahí, solo sumarle comportamiento.
 */
export type RoomStatus = 'active' | 'closed' | 'archived';

export interface Room {
  id: string;
  code: string;
  name: string;
  subject: string;
  section: string;
  createdBy: string;
  createdAt: Date;
  status: RoomStatus;
  helperBlockedSlots: number[];
  studentLimit?: number;
}
