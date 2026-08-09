import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  signInWithEmailAndPasswordMock,
  createUserWithEmailAndPasswordMock,
  signInAnonymouslyMock,
  onAuthStateChangedMock,
  sendPasswordResetEmailMock,
  authStub,
} = vi.hoisted(() => ({
  signInWithEmailAndPasswordMock: vi.fn(),
  createUserWithEmailAndPasswordMock: vi.fn(),
  signInAnonymouslyMock: vi.fn(),
  onAuthStateChangedMock: vi.fn(),
  sendPasswordResetEmailMock: vi.fn(),
  authStub: { currentUser: null as { uid: string } | null },
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  signInAnonymously: signInAnonymouslyMock,
  onAuthStateChanged: onAuthStateChangedMock,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

vi.mock('@library/firebase/firebase-app', () => ({ auth: authStub }));

import { AuthRepository } from './auth.repository';

describe('AuthRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStub.currentUser = null;
  });

  it('loginWithEmail devuelve solo el uid, no el FirebaseUser completo', async () => {
    signInWithEmailAndPasswordMock.mockResolvedValue({ user: { uid: 'uid-1', email: 'a@b.cl' } });

    const result = await AuthRepository.loginWithEmail('a@b.cl', 'secreta123');

    expect(result).toEqual({ uid: 'uid-1' });
  });

  it('registerWithEmail devuelve solo el uid, no el FirebaseUser completo', async () => {
    createUserWithEmailAndPasswordMock.mockResolvedValue({
      user: { uid: 'uid-nuevo', email: 'nuevo@matchclass.cl' },
    });

    const result = await AuthRepository.registerWithEmail('nuevo@matchclass.cl', 'secreta123');

    expect(result).toEqual({ uid: 'uid-nuevo' });
  });

  it('ensureAnonymousSession reutiliza la sesión existente sin llamar a signInAnonymously', async () => {
    authStub.currentUser = { uid: 'uid-anon-existente' };

    const uid = await AuthRepository.ensureAnonymousSession();

    expect(uid).toBe('uid-anon-existente');
    expect(signInAnonymouslyMock).not.toHaveBeenCalled();
  });

  it('ensureAnonymousSession crea una sesión nueva si no hay una activa', async () => {
    signInAnonymouslyMock.mockResolvedValue({ user: { uid: 'uid-nuevo' } });

    const uid = await AuthRepository.ensureAnonymousSession();

    expect(uid).toBe('uid-nuevo');
    expect(signInAnonymouslyMock).toHaveBeenCalledOnce();
  });

  it('sendPasswordResetEmail delega en el SDK sin transformar el resultado', async () => {
    sendPasswordResetEmailMock.mockResolvedValue(undefined);

    await AuthRepository.sendPasswordResetEmail('ayudante@matchclass.cl');

    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(authStub, 'ayudante@matchclass.cl');
  });

  it('sendPasswordResetEmail no swallowea errores del SDK', async () => {
    sendPasswordResetEmailMock.mockRejectedValue(new Error('auth/user-not-found'));

    await expect(AuthRepository.sendPasswordResetEmail('nadie@matchclass.cl')).rejects.toThrow(
      'auth/user-not-found',
    );
  });

  it('getRestoredUid espera la primera emisión de onAuthStateChanged y se desuscribe (RC-013 §5)', async () => {
    const unsubscribe = vi.fn();
    onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      // Emisión asíncrona: reproduce que el SDK todavía no restauró la
      // sesión en el momento del render inicial.
      setTimeout(() => cb({ uid: 'uid-anon-restaurado' }), 0);
      return unsubscribe;
    });

    await expect(AuthRepository.getRestoredUid()).resolves.toBe('uid-anon-restaurado');
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(signInAnonymouslyMock).not.toHaveBeenCalled();
  });

  it('getRestoredUid devuelve null si no hay sesión que restaurar, sin crear una anónima', async () => {
    const unsubscribe = vi.fn();
    onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(null);
      return unsubscribe;
    });

    await expect(AuthRepository.getRestoredUid()).resolves.toBeNull();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(signInAnonymouslyMock).not.toHaveBeenCalled();
  });

  it('subscribeToAuthState traduce FirebaseUser a uid (o null)', () => {
    const callback = vi.fn();
    onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb({ uid: 'uid-1' });
      cb(null);
      return () => undefined;
    });

    AuthRepository.subscribeToAuthState(callback);

    expect(callback).toHaveBeenNthCalledWith(1, 'uid-1');
    expect(callback).toHaveBeenNthCalledWith(2, null);
  });
});
