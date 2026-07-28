/**
 * Registro central de query keys.
 *
 * Regla del proyecto: ninguna key se escribe como string literal en un hook.
 * Sin esto no hay autocompletado y un typo rompe las invalidaciones en silencio.
 */
export const queryKeys = {
  auth: {
    current: ['auth', 'current'] as const,
  },
  rooms: {
    all: ['rooms'] as const,
    byOwner: (uid: string) => ['rooms', 'owner', uid] as const,
    byCode: (code: string) => ['rooms', 'code', code] as const,
    detail: (roomId: string) => ['rooms', 'detail', roomId] as const,
  },
  responses: {
    byRoom: (roomId: string) => ['responses', 'room', roomId] as const,
    mine: (roomId: string, uid: string) => ['responses', 'room', roomId, 'mine', uid] as const,
  },
  results: {
    byRoom: (roomId: string) => ['results', 'room', roomId] as const,
  },
} as const;
