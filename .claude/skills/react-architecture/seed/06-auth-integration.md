# 06 — Autenticación y Datos con Firebase

MatchClass usa **Firebase** para autenticación (Firebase Auth) y persistencia (Cloud Firestore). Este documento describe cómo integrarlo respetando las capas NDK.

La regla de flujo no cambia: `componente → hook → service → repository → SDK`. Lo único que cambia respecto de un backend REST es que la capa más baja es el SDK de Firebase en lugar de Axios. **Ningún componente importa `firebase/*` directamente.**

---

## Instalación

```bash
npm install firebase@12.4.0
```

---

## Capa 1 — Inicialización del SDK (`library`)

Un único punto de arranque. Nadie más llama a `initializeApp`.

```typescript
// src/library/firebase/firebase-app.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
```

Conexión a los emuladores en desarrollo (opcional pero recomendado — evita tocar datos reales):

```typescript
// src/library/firebase/firebase-emulators.ts
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { auth, db } from './firebase-app';

export function connectEmulators(): void {
  if (import.meta.env.VITE_FIREBASE_USE_EMULATORS !== 'true') return;
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

Se llama una sola vez en `main.tsx`, antes de renderizar.

---

## Capa 2 — Entidad de dominio (`resources`)

`resources` es agnóstico: no importa nada de Firebase. El `User` de MatchClass **no** es el `FirebaseUser` del SDK.

```typescript
// src/resources/entities/user.entity.ts
export interface User {
  id: string;            // uid de Firebase
  name: string;
  email: string;
  photoUrl: string | null;
  roles: string[];       // leídos de custom claims o del documento de Firestore
}
```

```typescript
// src/resources/enums/auth-status.enum.ts
export const AuthStatus = {
  Idle:            'idle',
  Loading:         'loading',
  Authenticated:   'authenticated',
  Unauthenticated: 'unauthenticated',
} as const;
export type AuthStatus = typeof AuthStatus[keyof typeof AuthStatus];
```

---

## Capa 3 — Repository de auth (`library`)

Encapsula el SDK y **traduce** `FirebaseUser` → `User`. Es el único archivo que conoce la forma del objeto de Firebase.

```typescript
// src/library/repositories/auth.repository.ts
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@library/firebase/firebase-app';
import type { User } from '@resources/entities/user.entity';

const googleProvider = new GoogleAuthProvider();

async function toDomainUser(fbUser: FirebaseUser): Promise<User> {
  // Los roles viajan como custom claims puestos por el backend/Cloud Function
  const tokenResult = await fbUser.getIdTokenResult();
  const claimRoles = tokenResult.claims.roles;

  return {
    id: fbUser.uid,
    name: fbUser.displayName ?? fbUser.email ?? 'Usuario',
    email: fbUser.email ?? '',
    photoUrl: fbUser.photoURL,
    roles: Array.isArray(claimRoles) ? claimRoles.map(String) : [],
  };
}

export const AuthRepository = {
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return toDomainUser(credential.user);
  },

  loginWithGoogle: async (): Promise<User> => {
    const credential = await signInWithPopup(auth, googleProvider);
    return toDomainUser(credential.user);
  },

  logout: (): Promise<void> => signOut(auth),

  getIdToken: async (): Promise<string | null> => {
    const current = auth.currentUser;
    return current ? current.getIdToken() : null;
  },

  /**
   * Suscripción al estado de sesión. Devuelve la función de desuscripción:
   * quien la llame es responsable de invocarla en el cleanup del efecto.
   */
  subscribeToAuthState: (callback: (user: User | null) => void): (() => void) =>
    onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        callback(null);
        return;
      }
      void toDomainUser(fbUser).then(callback);
    }),
};
```

`tokenResult.claims.roles` llega tipado como `unknown` en el SDK: se valida con `Array.isArray` antes de usarlo. No castear con `as string[]`.

---

## Capa 4 — Auth Store con Zustand (`global`)

El store guarda estado, no lógica de Firebase.

```typescript
// src/global/store/auth.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from '@resources/entities/user.entity';
import { AuthStatus } from '@resources/enums/auth-status.enum';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User) => void;
  clearUser: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      status: AuthStatus.Idle,

      setUser: (user) =>
        set({ user, status: AuthStatus.Authenticated }, false, 'auth/setUser'),

      clearUser: () =>
        set({ user: null, status: AuthStatus.Unauthenticated }, false, 'auth/clearUser'),

      setStatus: (status) => set({ status }, false, 'auth/setStatus'),
    }),
    { name: 'AuthStore' }
  )
);

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) =>
  state.status === AuthStatus.Authenticated;
```

**No se persiste el token en `localStorage`.** Firebase Auth ya gestiona la persistencia de sesión y la renovación del ID token. Duplicarlo a mano abre una ventana de token stale.

---

## Capa 5 — Sincronizar la sesión al arrancar

`onAuthStateChanged` es la fuente de verdad. Se suscribe una vez, en un provider de la raíz.

```tsx
// src/global/providers/auth-provider.tsx
import { useEffect, type ReactNode } from 'react';
import { AuthRepository } from '@library/repositories/auth.repository';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    setStatus(AuthStatus.Loading);
    const unsubscribe = AuthRepository.subscribeToAuthState((user) => {
      if (user) setUser(user);
      else clearUser();
    });
    return unsubscribe;   // imprescindible: evita listeners duplicados en StrictMode
  }, [setUser, clearUser, setStatus]);

  return <>{children}</>;
}
```

`AuthProvider` va **por dentro** de `ThemeProvider` y por fuera del `RouterProvider`, para que el router ya vea el estado de sesión resuelto.

---

## Capa 6 — Mutations de login y logout (`modules`)

```typescript
// src/modules/authentication/core/hooks/use-login-mutation.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '@library/repositories/auth.repository';
import type { LoginFormValues } from '../schemas/login.schema';

export function useLoginMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: LoginFormValues) =>
      AuthRepository.loginWithEmail(email, password),
    // No se llama a setUser aquí: onAuthStateChanged ya actualiza el store.
    onSuccess: () => { void navigate('/dashboard'); },
  });
}
```

```typescript
// src/modules/authentication/core/hooks/use-logout-mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '@library/repositories/auth.repository';

export function useLogoutMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthRepository.logout,
    onSuccess: () => {
      queryClient.clear();          // ningún dato del usuario anterior sobrevive
      void navigate('/login', { replace: true });
    },
  });
}
```

---

## Capa 7 — Protected Route

```tsx
// src/global/components/q5-protected-route/q5-protected-route.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { Q1LoadingSpinner } from '@global/components/q1-loading-spinner/q1-loading-spinner';

interface Q5ProtectedRouteProps {
  redirectTo?: string;
  requiredRoles?: string[];
}

export function Q5ProtectedRoute({
  redirectTo = '/login',
  requiredRoles = [],
}: Q5ProtectedRouteProps) {
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  // Crítico: mientras Firebase resuelve la sesión no se puede redirigir,
  // o se expulsa al usuario en cada refresh de página.
  if (status === AuthStatus.Idle || status === AuthStatus.Loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Q1LoadingSpinner size="lg" label="Verificando sesión..." />
      </div>
    );
  }

  if (status !== AuthStatus.Authenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
```

**El error más común de Firebase + React Router:** redirigir a `/login` durante el estado `Loading`. Al recargar cualquier ruta protegida, `onAuthStateChanged` tarda unos milisegundos en emitir; si no se distingue "cargando" de "no autenticado", el usuario sale disparado al login en cada F5.

---

## Firestore — Repositorios de datos

Mismo patrón: el SDK vive en `library`, los tipos en `resources`, los hooks en `modules`.

```typescript
// src/library/repositories/schedule.repository.ts
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@library/firebase/firebase-app';
import type { ScheduleBlock } from '@resources/entities/schedule-block.entity';

const COLLECTION = 'scheduleBlocks';

function toScheduleBlock(snapshot: QueryDocumentSnapshot): ScheduleBlock {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    teacherId: String(data.teacherId ?? ''),
    day: Number(data.day ?? 0),
    startTime: String(data.startTime ?? ''),
    endTime: String(data.endTime ?? ''),
    availability: Number(data.availability ?? 0),
  };
}

export const ScheduleRepository = {
  listByTeacher: async (teacherId: string): Promise<ScheduleBlock[]> => {
    const q = query(
      collection(db, COLLECTION),
      where('teacherId', '==', teacherId),
      orderBy('day'),
      orderBy('startTime'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(toScheduleBlock);
  },

  getById: async (id: string): Promise<ScheduleBlock | null> => {
    const snapshot = await getDoc(doc(db, COLLECTION, id));
    if (!snapshot.exists()) return null;
    return toScheduleBlock(snapshot as QueryDocumentSnapshot);
  },

  create: async (block: Omit<ScheduleBlock, 'id'>): Promise<string> => {
    const ref = await addDoc(collection(db, COLLECTION), block);
    return ref.id;
  },

  update: (id: string, patch: Partial<Omit<ScheduleBlock, 'id'>>): Promise<void> =>
    updateDoc(doc(db, COLLECTION, id), patch),

  remove: (id: string): Promise<void> => deleteDoc(doc(db, COLLECTION, id)),
};
```

`snapshot.data()` devuelve `DocumentData` (`any` en la práctica). El mapper `toScheduleBlock` es obligatorio: es donde el dato no tipado de Firestore entra al dominio tipado. Sin él, el `any` se propaga por toda la app.

### Query hook sobre Firestore

```typescript
// src/modules/schedule/core/hooks/use-schedule-query.ts
import { useQuery } from '@tanstack/react-query';
import { ScheduleRepository } from '@library/repositories/schedule.repository';
import { queryKeys } from '@library/query/query-keys';

export function useScheduleQuery(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.schedule.byTeacher(teacherId),
    queryFn: () => ScheduleRepository.listByTeacher(teacherId),
    enabled: Boolean(teacherId),
    staleTime: 30_000,
  });
}
```

```typescript
// src/library/query/query-keys.ts
export const queryKeys = {
  auth:     { current: ['auth', 'current'] as const },
  schedule: {
    all: ['schedule'] as const,
    byTeacher: (teacherId: string) => ['schedule', 'teacher', teacherId] as const,
  },
} as const;
```

### Suscripciones en tiempo real

`onSnapshot` no encaja en `useQuery` (que es request/response). Para datos vivos —la grilla compartida, por ejemplo— se usa un hook dedicado que sincroniza el cache de TanStack Query:

```typescript
// src/modules/schedule/core/hooks/use-schedule-subscription.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ScheduleRepository } from '@library/repositories/schedule.repository';
import { queryKeys } from '@library/query/query-keys';

export function useScheduleSubscription(teacherId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!teacherId) return;
    const unsubscribe = ScheduleRepository.subscribeByTeacher(teacherId, (blocks) => {
      queryClient.setQueryData(queryKeys.schedule.byTeacher(teacherId), blocks);
    });
    return unsubscribe;
  }, [teacherId, queryClient]);
}
```

El `return unsubscribe` no es opcional: sin él cada montaje deja un listener abierto contra Firestore, y eso se paga en cuota de lecturas.

---

## Errores de Firebase

Los errores del SDK traen `code` (`'auth/invalid-credential'`, `'permission-denied'`…), no un status HTTP. El equivalente al interceptor 401/403 de un backend REST es un mapper:

```typescript
// src/global/hooks/use-firebase-error.ts
import { FirebaseError } from 'firebase/app';

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential':    'Correo o contraseña incorrectos.',
  'auth/user-not-found':        'No existe una cuenta con ese correo.',
  'auth/too-many-requests':     'Demasiados intentos. Intenta más tarde.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu red.',
  'permission-denied':          'No tienes permisos para ver este contenido.',
  'unavailable':                'Servicio no disponible. Intenta nuevamente.',
};

export function useFirebaseError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return { code: null, message: error ? 'Ocurrió un error inesperado.' : null, isForbidden: false };
  }
  return {
    code: error.code,
    message: MESSAGES[error.code] ?? 'Ocurrió un error inesperado.',
    isForbidden: error.code === 'permission-denied',
  };
}
```

`instanceof FirebaseError` es un type guard real. No usar `(error as FirebaseError).code`.

**Equivalencias con el manejo de errores HTTP** (ver [../architecture/11-http-error-handling.md](../architecture/11-http-error-handling.md)):

| Caso REST | Equivalente Firebase | Acción |
|---|---|---|
| 401 Unauthorized | `onAuthStateChanged` emite `null` | El `AuthProvider` limpia el store; el `Q5ProtectedRoute` redirige |
| 403 Forbidden | `permission-denied` (Firestore Rules) | `isForbidden === true` → renderizar `<Q2Forbidden />` inline |
| 5xx | `unavailable`, `deadline-exceeded` | Mensaje de reintento; TanStack Query reintenta |

Las reglas de seguridad de Firestore son la autorización real. La validación de roles en el frontend es UX, no seguridad: un `requiredRoles` en el router no impide que alguien consulte la colección desde la consola.

---

## Variables de entorno

```bash
# .env.example
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_USE_EMULATORS=false
VITE_APP_ENV=development
```

```typescript
// src/vite-env.d.ts — obligatorio
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_USE_EMULATORS?: string;
  readonly VITE_APP_ENV: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }
```

Las claves de Firebase Web son **públicas por diseño** — viajan en el bundle. Lo que protege los datos son las Firestore Security Rules y las App Check policies, no ocultar el `apiKey`. Aun así se cargan por `.env` para poder apuntar a distintos proyectos por entorno (dev / QA / prod).

---

## Testing

Los tests no tocan Firebase real. Dos estrategias:

1. **Unitarios / componentes:** mockear el repositorio, no el SDK.

```typescript
vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: {
    loginWithEmail: vi.fn().mockResolvedValue({
      id: 'u1', name: 'Test', email: 'test@matchclass.cl', photoUrl: null, roles: ['teacher'],
    }),
    logout: vi.fn().mockResolvedValue(undefined),
    subscribeToAuthState: vi.fn(() => () => undefined),
  },
}));
```

Mockear el repositorio y no `firebase/auth` es lo que hace que estos tests sigan valiendo si mañana se cambia de proveedor.

2. **E2E (Playwright):** correr contra los emuladores de Firebase con datos sembrados, nunca contra el proyecto de producción.

```bash
firebase emulators:start --only auth,firestore --import ./e2e/fixtures
```
