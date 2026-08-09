import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  getDocMock,
  setDocMock,
  updateDocMock,
  docMock,
  collectionMock,
  serverTimestampMock,
  getCountFromServerMock,
} = vi.hoisted(() => ({
  getDocMock: vi.fn(),
  setDocMock: vi.fn(),
  updateDocMock: vi.fn(),
  docMock: vi.fn((...args: unknown[]) => ({ __doc: args })),
  collectionMock: vi.fn((...args: unknown[]) => ({ __collection: args })),
  serverTimestampMock: vi.fn(() => '__serverTimestamp__'),
  getCountFromServerMock: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getDoc: getDocMock,
  setDoc: setDocMock,
  updateDoc: updateDocMock,
  doc: docMock,
  collection: collectionMock,
  serverTimestamp: serverTimestampMock,
  getCountFromServer: getCountFromServerMock,
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
          occupiedBlocks: [1, 25, 'x', 5, 51],
          createdByUid: 'uid-1',
        }),
      });

      const response = await ResponseRepository.getMine('room-1', 'uid-1');

      expect(response).toEqual({
        id: 'uid-1',
        roomId: 'room-1',
        studentName: 'Ana',
        occupiedBlocks: [1, 25, 5],
        createdByUid: 'uid-1',
        createdAt: null,
        updatedAt: null,
      });
    });
  });

  describe('submit', () => {
    it('escribe studentName, occupiedBlocks, roomId y createdByUid con merge:true', async () => {
      setDocMock.mockResolvedValue(undefined);

      await ResponseRepository.submit('room-1', 'uid-1', {
        studentName: 'Ana',
        occupiedBlocks: [],
      });

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

  describe('countByRoom', () => {
    it('usa getCountFromServer (agregación de servidor) y devuelve el número, sin any', async () => {
      getCountFromServerMock.mockResolvedValue({ data: () => ({ count: 12 }) });

      const count = await ResponseRepository.countByRoom('room-1');

      expect(count).toBe(12);
      expect(getCountFromServerMock).toHaveBeenCalledTimes(1);
    });

    it('sala sin respuestas devuelve 0', async () => {
      getCountFromServerMock.mockResolvedValue({ data: () => ({ count: 0 }) });
      expect(await ResponseRepository.countByRoom('room-vacia')).toBe(0);
    });
  });

  describe('updateBlocks', () => {
    it('escribe solo occupiedBlocks y updatedAt, nunca createdAt ni studentName (RC-013 §5)', async () => {
      updateDocMock.mockResolvedValue(undefined);

      await ResponseRepository.updateBlocks('room-1', 'uid-1', [1, 2, 8, 13]);

      expect(docMock).toHaveBeenCalledWith(
        { __collection: [{}, 'rooms', 'room-1', 'responses'] },
        'uid-1',
      );
      expect(updateDocMock).toHaveBeenCalledTimes(1);
      const [, payload] = updateDocMock.mock.calls[0] as [unknown, Record<string, unknown>];
      expect(payload).toEqual({ occupiedBlocks: [1, 2, 8, 13], updatedAt: '__serverTimestamp__' });
    });

    it('una respuesta vacía se guarda como arreglo vacío, no se omite el campo', async () => {
      updateDocMock.mockResolvedValue(undefined);

      await ResponseRepository.updateBlocks('room-1', 'uid-1', []);

      const [, payload] = updateDocMock.mock.calls[0] as [unknown, Record<string, unknown>];
      expect(payload).toMatchObject({ occupiedBlocks: [] });
    });
  });
});
