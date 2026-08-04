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

describe('RoomRepository.listByOwner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta por createdBy sin orderBy (RC-008 §5: evita el índice compuesto)', async () => {
    getDocsMock.mockResolvedValue({ docs: [] });

    await RoomRepository.listByOwner('helper-1');

    expect(whereMock).toHaveBeenCalledWith('createdBy', '==', 'helper-1');
    expect(whereMock).toHaveBeenCalledTimes(1);
  });

  it('mapea todas las salas del ayudante a Room[], sin any', async () => {
    getDocsMock.mockResolvedValue({
      docs: [
        fakeDoc('room-1', {
          code: 'ABCDEF',
          name: 'Sala 1',
          subject: 'Materia',
          section: 'Secc 1',
          createdBy: 'helper-1',
          status: 'active',
          helperBlockedSlots: [],
        }),
        fakeDoc('room-2', {
          code: 'GHIJKL',
          name: 'Sala 2',
          subject: 'Materia',
          section: 'Secc 2',
          createdBy: 'helper-1',
          status: 'closed',
          helperBlockedSlots: [],
          studentLimit: 25,
        }),
      ],
    });

    const rooms = await RoomRepository.listByOwner('helper-1');

    expect(rooms).toHaveLength(2);
    expect(rooms[0]?.id).toBe('room-1');
    expect(rooms[1]).toMatchObject({ id: 'room-2', studentLimit: 25 });
  });

  it('sin salas devuelve un arreglo vacío', async () => {
    getDocsMock.mockResolvedValue({ docs: [] });
    expect(await RoomRepository.listByOwner('helper-sin-salas')).toEqual([]);
  });
});
