import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getDocMock, setDocMock, docMock, collectionMock, serverTimestampMock } = vi.hoisted(() => ({
  getDocMock: vi.fn(),
  setDocMock: vi.fn(),
  docMock: vi.fn((...args: unknown[]) => ({ __doc: args })),
  collectionMock: vi.fn((...args: unknown[]) => ({ __collection: args })),
  serverTimestampMock: vi.fn(() => '__serverTimestamp__'),
}));

vi.mock('firebase/firestore', () => ({
  getDoc: getDocMock,
  setDoc: setDocMock,
  doc: docMock,
  collection: collectionMock,
  serverTimestamp: serverTimestampMock,
  // Stub: ninguna fixture de este archivo usa un Timestamp real, pero
  // `toDateOrNull` hace `instanceof Timestamp` y necesita que exista.
  Timestamp: class {},
}));

vi.mock('@library/firebase/firebase-app', () => ({ db: {} }));

import { ResponseRepository } from './response.repository';

describe('ResponseRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMine', () => {
    it('devuelve null si el documento no existe', async () => {
      getDocMock.mockResolvedValue({ exists: () => false });
      expect(await ResponseRepository.getMine('room-1', 'uid-1')).toBeNull();
    });

    it('mapea el documento a la entidad Response, sin any', async () => {
      getDocMock.mockResolvedValue({
        exists: () => true,
        id: 'uid-1',
        data: () => ({
          roomId: 'room-1',
          studentName: 'Ana',
          occupiedBlocks: [1, 25, 'x', 5],
          createdByUid: 'uid-1',
        }),
      });

      const response = await ResponseRepository.getMine('room-1', 'uid-1');

      expect(response).toEqual({
        id: 'uid-1',
        roomId: 'room-1',
        studentName: 'Ana',
        occupiedBlocks: [1, 5],
        createdByUid: 'uid-1',
        createdAt: null,
        updatedAt: null,
      });
    });
  });

  describe('submit', () => {
    it('escribe studentName, occupiedBlocks, roomId y createdByUid con merge:true', async () => {
      setDocMock.mockResolvedValue(undefined);

      await ResponseRepository.submit('room-1', 'uid-1', { studentName: 'Ana', occupiedBlocks: [] });

      expect(setDocMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          studentName: 'Ana',
          occupiedBlocks: [],
          roomId: 'room-1',
          createdByUid: 'uid-1',
        }),
        { merge: true },
      );
    });
  });
});
