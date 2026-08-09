import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  getDocsMock,
  queryMock,
  whereMock,
  limitMock,
  collectionMock,
  addDocMock,
  serverTimestampMock,
  docMock,
  getDocMock,
  updateDocMock,
} = vi.hoisted(() => ({
  getDocsMock: vi.fn(),
  queryMock: vi.fn((...args: unknown[]) => ({ __query: args })),
  whereMock: vi.fn((...args: unknown[]) => ({ __where: args })),
  limitMock: vi.fn((...args: unknown[]) => ({ __limit: args })),
  collectionMock: vi.fn((...args: unknown[]) => ({ __collection: args })),
  addDocMock: vi.fn(),
  serverTimestampMock: vi.fn(() => '__server_timestamp__'),
  docMock: vi.fn((...args: unknown[]) => ({ __doc: args })),
  getDocMock: vi.fn(),
  updateDocMock: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getDocs: getDocsMock,
  query: queryMock,
  where: whereMock,
  limit: limitMock,
  collection: collectionMock,
  addDoc: addDocMock,
  serverTimestamp: serverTimestampMock,
  doc: docMock,
  getDoc: getDocMock,
  updateDoc: updateDocMock,
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

describe('RoomRepository.create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fija status, helperBlockedSlots y createdAt internamente, sin recibirlos como input', async () => {
    addDocMock.mockResolvedValue({ id: 'room-nuevo' });

    const result = await RoomRepository.create({
      name: 'Sala',
      subject: 'Materia',
      section: 'Secc 1',
      code: 'ABCDEF',
      createdBy: 'helper-1',
    });

    expect(result).toEqual({ id: 'room-nuevo' });
    expect(addDocMock).toHaveBeenCalledTimes(1);
    const [, payload] = addDocMock.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(payload).toEqual({
      name: 'Sala',
      subject: 'Materia',
      section: 'Secc 1',
      code: 'ABCDEF',
      createdBy: 'helper-1',
      status: 'active',
      helperBlockedSlots: [],
      createdAt: '__server_timestamp__',
    });
  });
});

describe('RoomRepository.getById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mapea la sala a Room cuando el documento existe, sin any (RC-010 §5, Escenario 2)', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      ...fakeDoc('room-1', {
        code: 'ABCDEF',
        name: 'Sala',
        subject: 'Materia',
        section: 'Secc 1',
        createdBy: 'helper-1',
        status: 'active',
        helperBlockedSlots: [2, 4, 6, 8],
      }),
    });

    const room = await RoomRepository.getById('room-1');

    expect(room).toEqual({
      id: 'room-1',
      code: 'ABCDEF',
      name: 'Sala',
      subject: 'Materia',
      section: 'Secc 1',
      createdBy: 'helper-1',
      createdAt: new Date(0),
      status: 'active',
      helperBlockedSlots: [2, 4, 6, 8],
    });
  });

  it('devuelve null cuando el documento no existe (modo creación, HU-08 Especificaciones)', async () => {
    getDocMock.mockResolvedValue({ exists: () => false });

    expect(await RoomRepository.getById('room-inexistente')).toBeNull();
  });
});

describe('RoomRepository.updateBlockedSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('actualiza solo helperBlockedSlots, sin tocar el resto del documento (RC-010 §5)', async () => {
    updateDocMock.mockResolvedValue(undefined);

    await RoomRepository.updateBlockedSlots('room-1', [2, 4, 6, 8]);

    expect(updateDocMock).toHaveBeenCalledTimes(1);
    const [, payload] = updateDocMock.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(payload).toEqual({ helperBlockedSlots: [2, 4, 6, 8] });
  });
});
