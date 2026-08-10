import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  getDocMock,
  getDocsMock,
  onSnapshotMock,
  setDocMock,
  updateDocMock,
  docMock,
  collectionMock,
  serverTimestampMock,
  getCountFromServerMock,
} = vi.hoisted(() => ({
  getDocMock: vi.fn(),
  getDocsMock: vi.fn(),
  onSnapshotMock: vi.fn(),
  setDocMock: vi.fn(),
  updateDocMock: vi.fn(),
  docMock: vi.fn((...args: unknown[]) => ({ __doc: args })),
  collectionMock: vi.fn((...args: unknown[]) => ({ __collection: args })),
  serverTimestampMock: vi.fn(() => '__serverTimestamp__'),
  getCountFromServerMock: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getDoc: getDocMock,
  getDocs: getDocsMock,
  onSnapshot: onSnapshotMock,
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

function fakeDoc(id: string, data: Record<string, unknown>) {
  return { id, data: () => data };
}

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

  describe('listByRoom', () => {
    it('mapea todas las respuestas de la sala a la entidad Response, sin any (RC-014 §5)', async () => {
      getDocsMock.mockResolvedValue({
        docs: [
          fakeDoc('uid-1', { roomId: 'room-1', studentName: 'Ana', occupiedBlocks: [1, 2, 99] }),
          fakeDoc('uid-2', { roomId: 'room-1', studentName: 'Beto', occupiedBlocks: [50] }),
        ],
      });

      const responses = await ResponseRepository.listByRoom('room-1');

      expect(responses).toHaveLength(2);
      expect(responses[0]).toMatchObject({ id: 'uid-1', studentName: 'Ana' });
      // El mapper descarta lo que cae fuera de 1–50.
      expect(responses[0]?.occupiedBlocks).toEqual([1, 2]);
      expect(responses[1]?.occupiedBlocks).toEqual([50]);
    });

    it('sala sin respuestas devuelve un arreglo vacío', async () => {
      getDocsMock.mockResolvedValue({ docs: [] });
      expect(await ResponseRepository.listByRoom('room-vacia')).toEqual([]);
    });
  });

  describe('subscribeByRoom', () => {
    it('entrega cada snapshot ya mapeado y devuelve el unsubscribe del SDK (Escenario 4)', () => {
      const unsubscribe = vi.fn();
      // El callback se guarda en una propiedad y no en un `let`: asignarlo
      // dentro del closure haría que TS estreche la variable a `never` al
      // llamarla después.
      const captured: { emit?: (snapshot: { docs: ReturnType<typeof fakeDoc>[] }) => void } = {};
      onSnapshotMock.mockImplementation(
        (_ref: unknown, cb: (s: { docs: ReturnType<typeof fakeDoc>[] }) => void) => {
          captured.emit = cb;
          return unsubscribe;
        },
      );

      const onData = vi.fn();
      const returned = ResponseRepository.subscribeByRoom('room-1', onData);

      captured.emit?.({ docs: [fakeDoc('uid-1', { studentName: 'Ana', occupiedBlocks: [3] })] });

      expect(onData).toHaveBeenCalledTimes(1);
      expect(onData.mock.calls[0]?.[0]).toEqual([
        expect.objectContaining({ id: 'uid-1', studentName: 'Ana', occupiedBlocks: [3] }),
      ]);
      expect(returned).toBe(unsubscribe);
    });
  });
});
