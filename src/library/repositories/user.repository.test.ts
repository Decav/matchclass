import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getDocMock, setDocMock, docMock } = vi.hoisted(() => ({
  getDocMock: vi.fn(),
  setDocMock: vi.fn(),
  docMock: vi.fn((...args: unknown[]) => ({ __doc: args })),
}));

vi.mock('firebase/firestore', () => ({
  getDoc: getDocMock,
  setDoc: setDocMock,
  doc: docMock,
  // Stub: ninguna fixture de este archivo usa un Timestamp real, pero
  // `toDateOrNull` hace `instanceof Timestamp` y necesita que exista.
  Timestamp: class {},
}));
vi.mock('@library/firebase/firebase-app', () => ({ db: {} }));

import { UserRepository } from './user.repository';

describe('UserRepository.getById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve null si el documento no existe (uid sin perfil)', async () => {
    getDocMock.mockResolvedValue({ exists: () => false });
    expect(await UserRepository.getById('uid-1')).toBeNull();
  });

  it('mapea el documento a la entidad User, sin any', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ email: 'ayudante@matchclass.cl', displayName: 'Ayudante', role: 'helper' }),
    });

    const user = await UserRepository.getById('uid-1');

    expect(user).toEqual({
      id: 'uid-1',
      email: 'ayudante@matchclass.cl',
      displayName: 'Ayudante',
      role: 'helper',
      createdAt: null,
    });
  });

  it('nunca deja auto-promoverse: cualquier role distinto de "admin" cae en "helper"', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ email: 'x@matchclass.cl', displayName: 'X', role: 'super-admin' }),
    });

    const user = await UserRepository.getById('uid-1');
    expect(user?.role).toBe('helper');
  });
});

describe('UserRepository.create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('escribe displayName, email, role y createdAt en users/{uid}, sin filtrar datos crudos', async () => {
    setDocMock.mockResolvedValue(undefined);
    const createdAt = new Date('2026-07-30T12:00:00Z');

    await UserRepository.create('uid-nuevo', {
      displayName: 'María González',
      email: 'maria@matchclass.cl',
      role: 'helper',
      createdAt,
    });

    expect(setDocMock).toHaveBeenCalledWith(
      { __doc: [{}, 'users', 'uid-nuevo'] },
      {
        displayName: 'María González',
        email: 'maria@matchclass.cl',
        role: 'helper',
        createdAt,
      },
    );
  });
});
