import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getDocsMock, queryMock, whereMock, limitMock, collectionMock } = vi.hoisted(() => ({
  getDocsMock: vi.fn(),
  queryMock: vi.fn((...args: unknown[]) => ({ __query: args })),
  whereMock: vi.fn((...args: unknown[]) => ({ __where: args })),
  limitMock: vi.fn((...args: unknown[]) => ({ __limit: args })),
  collectionMock: vi.fn((...args: unknown[]) => ({ __collection: args })),
}));

vi.mock('firebase/firestore', () => ({
  getDocs: getDocsMock,
  query: queryMock,
  where: whereMock,
  limit: limitMock,
  collection: collectionMock,
  // Stub: ninguna fixture de este archivo usa un Timestamp real, pero
  // `toDateOrNull` hace `instanceof Timestamp` y necesita que exista.
  Timestamp: class {},
}));

vi.mock('@library/firebase/firebase-app', () => ({ db: {} }));

import { RoomRepository } from './room.repository';

function fakeDoc(id: string, data: Record<string, unknown>) {
  return { id, data: () => data };
}

describe('RoomRepository.findByCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normaliza el código a mayúsculas antes de consultar Firestore', async () => {
    getDocsMock.mockResolvedValue({ docs: [] });

    await RoomRepository.findByCode('eds101');

    expect(whereMock).toHaveBeenCalledWith('code', '==', 'EDS101');
  });

  it('mapea el documento encontrado a la entidad Room, sin any', async () => {
    getDocsMock.mockResolvedValue({
      docs: [
        fakeDoc('room-1', {
          code: 'ABCDEF',
          name: 'Sala',
          subject: 'Materia',
          section: 'Secc 1',
          createdBy: 'helper-1',
          status: 'active',
          helperBlockedSlots: [1, 2, '3', 'x'],
        }),
      ],
    });

    const room = await RoomRepository.findByCode('ABCDEF');

    expect(room).toEqual({
      id: 'room-1',
      code: 'ABCDEF',
      name: 'Sala',
      subject: 'Materia',
      section: 'Secc 1',
      createdBy: 'helper-1',
      createdAt: new Date(0),
      status: 'active',
      helperBlockedSlots: [1, 2, 3],
    });
  });

  it('devuelve null cuando no hay resultados', async () => {
    getDocsMock.mockResolvedValue({ docs: [] });
    expect(await RoomRepository.findByCode('ZZZZZZ')).toBeNull();
  });

  it('defaultea a status "closed" si el dato es inválido', async () => {
    getDocsMock.mockResolvedValue({
      docs: [fakeDoc('room-2', { code: 'ABCDEF', status: 'unknown-status' })],
    });

    const room = await RoomRepository.findByCode('ABCDEF');
    expect(room?.status).toBe('closed');
  });
});
