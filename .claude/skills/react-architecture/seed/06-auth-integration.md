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
  id: string;              // uid de Firebase
  name: string;
  email: string;
  photoUrl: string | null;
  roles: string[];         // leídos de custom claims o del documento de Firestore
  isAnonymous: boolean;    // true = alumno que entró por código, sin cuenta
}
```

```typescript
// src/resources/entities/response.entity.ts
export interface Response {
  id: string;                // = uid anónimo del alumno (ver "Los dos modos de acceso")
  roomId: string;
  studentName: string;
  occupiedBlocks: number[];  // bloques 1–20 donde el alumno tiene compromiso
  createdByUid: string;      // uid anónimo — habilita la Security Rule de edición
  createdAt: Date | null;
  updatedAt: Date | null;
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

Las entidades completas del dominio (`Room`, `Response`, `RoomResult`, `HeatmapEntry`, `ScheduleBlock`, `User`) están especificadas en `docs/tech-document.md` §2. `resources` es su única fuente de verdad en código: ningún módulo redefine estas formas.

---

## Capa 3 — Repository de auth (`library`)

Encapsula el SDK y **traduce** `FirebaseUser` → `User`. Es el único archivo que conoce la forma del objeto de Firebase.

```typescript
// src/library/repositories/auth.repository.ts
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
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
    isAnonymous: fbUser.isAnonymous,
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

  /**
   * Acceso del alumno: sin registro ni contraseña, pero con un uid real.
   * Idempotente — si ya hay sesión (anónima o no), la reutiliza en vez de
   * crear un usuario nuevo en cada visita.
   */
  ensureAnonymousSession: async (): Promise<string> => {
    if (auth.currentUser) return auth.currentUser.uid;
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
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

## Los dos modos de acceso

MatchClass tiene dos tipos de usuario con necesidades de identidad distintas (ver `docs/tech-document.md` §1):

| Actor | Metodo | uid | Puede |
|---|---|---|---|
| Ayudante | Email + password | Persistente, con cuenta | Crear salas, ver resultados |
| Alumno | **Anonymous Auth** por codigo de sala | Persistente, sin cuenta | Responder y editar *su propia* respuesta |

El alumno no se registra, pero **si tiene un `uid`**. Esa es la pieza que hace posible el criterio de aceptacion del RC-005 ("los datos persisten aunque cierre el navegador"): Firebase Auth guarda la sesion anonima en IndexedDB, asi que al volver el alumno recupera el mismo `uid` y con el, su respuesta.

Un id generado a mano en `localStorage` daria persistencia parecida, pero **no serviria para las Security Rules**: el servidor no puede verificarlo, y cualquiera podria editar la respuesta de otro. El `uid` anonimo si es verificable por Firestore via `request.auth.uid`.

```tsx
// src/modules/scheduling/core/hooks/use-anonymous-session.ts
import { useEffect, useState } from 'react';
import { AuthRepository } from '@library/repositories/auth.repository';

/** Garantiza una sesion anonima antes de que el alumno pueda responder. */
export function useAnonymousSession() {
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    AuthRepository.ensureAnonymousSession()
      .then((value) => { if (!cancelled) setUid(value); })
      .catch((err) => { if (!cancelled) setError(err); });
    return () => { cancelled = true; };
  }, []);

  return { uid, error, isReady: uid !== null };
}
```

El flag `cancelled` evita el `setState` sobre un componente desmontado si el alumno navega antes de que resuelva la promesa.

**Habilitar el proveedor:** Anonymous Auth viene deshabilitado por defecto. Hay que activarlo en la consola de Firebase (Authentication → Sign-in method → Anonymous) en **cada** proyecto: dev, staging y prod. Si falta, el SDK devuelve `auth/operation-not-allowed`.

**Sobre las cuentas anonimas:** Firebase no las borra solo. Una sala con 40 alumnos genera 40 usuarios anonimos permanentes. Conviene una Cloud Function programada que elimine las cuentas anonimas sin actividad reciente, o asumir el crecimiento y monitorearlo.

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

Las entidades reales del dominio están en `docs/tech-document.md` §2. Colecciones de Firestore:

| Coleccion | Entidad | Quien escribe |
|---|---|---|
| `rooms` | `Room` | Ayudante (dueño de la sala) |
| `rooms/{roomId}/responses` | `Response` | Alumno anonimo |
| `roomResults` | `RoomResult` | Recalculo del matching |
| `users` | `User` | El propio usuario al registrarse |

`ScheduleBlock` (la matriz USM de 20 bloques) **no persiste**: vive como constante en `src/resources/constants/usm-schedule.ts`.

```typescript
// src/library/repositories/response.repository.ts
import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, onSnapshot,
  serverTimestamp, query, orderBy, type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@library/firebase/firebase-app';
import type { Response } from '@resources/entities/response.entity';

// Subcoleccion: las respuestas viven bajo su sala.
// Esto simplifica las Security Rules y evita un where('roomId', ...) en cada lectura.
const responsesRef = (roomId: string) => collection(db, 'rooms', roomId, 'responses');

// Mapper obligatorio: snapshot.data() es DocumentData (any en la practica)
function toResponse(snapshot: QueryDocumentSnapshot): Response {
  const data = snapshot.data();
  const blocks = Array.isArray(data.occupiedBlocks) ? data.occupiedBlocks : [];
  return {
    id: snapshot.id,
    roomId: String(data.roomId ?? ''),
    studentName: String(data.studentName ?? ''),
    // Se filtra al rango valido 1-20 en el borde del dominio, no en el componente
    occupiedBlocks: blocks.map(Number).filter((b) => Number.isInteger(b) && b >= 1 && b <= 20),
    createdByUid: String(data.createdByUid ?? ''),
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

export const ResponseRepository = {
  listByRoom: async (roomId: string): Promise<Response[]> => {
    const snapshot = await getDocs(query(responsesRef(roomId), orderBy('createdAt')));
    return snapshot.docs.map(toResponse);
  },

  getMine: async (roomId: string, uid: string): Promise<Response | null> => {
    const snapshot = await getDoc(doc(responsesRef(roomId), uid));
    if (!snapshot.exists()) return null;
    return toResponse(snapshot as QueryDocumentSnapshot);
  },

  /**
   * El id del documento ES el uid anonimo del alumno. Con eso:
   * - responder dos veces sobrescribe en vez de duplicar
   * - la Security Rule se reduce a `request.auth.uid == responseId`
   */
  submit: (roomId: string, uid: string, data: Pick<Response, 'studentName' | 'occupiedBlocks'>): Promise<void> =>
    setDoc(
      doc(responsesRef(roomId), uid),
      { ...data, roomId, createdByUid: uid, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
      { merge: true },   // merge: preserva createdAt en las ediciones posteriores
    ),

  remove: (roomId: string, uid: string): Promise<void> =>
    deleteDoc(doc(responsesRef(roomId), uid)),

  subscribeByRoom: (roomId: string, callback: (responses: Response[]) => void): (() => void) =>
    onSnapshot(query(responsesRef(roomId), orderBy('createdAt')), (snapshot) => {
      callback(snapshot.docs.map(toResponse));
    }),
};
```

`snapshot.data()` devuelve `DocumentData` (`any` en la práctica). El mapper es obligatorio: es donde el dato no tipado de Firestore entra al dominio tipado. Sin él, el `any` se propaga por toda la app.

### Query hook sobre Firestore

```typescript
// src/modules/results/core/hooks/use-room-responses-query.ts
import { useQuery } from '@tanstack/react-query';
import { ResponseRepository } from '@library/repositories/response.repository';
import { queryKeys } from '@library/query/query-keys';

export function useRoomResponsesQuery(roomId: string) {
  return useQuery({
    queryKey: queryKeys.responses.byRoom(roomId),
    queryFn: () => ResponseRepository.listByRoom(roomId),
    enabled: Boolean(roomId),
    staleTime: 30_000,
  });
}
```

```typescript
// src/library/query/query-keys.ts
export const queryKeys = {
  auth:  { current: ['auth', 'current'] as const },
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
```

### Suscripciones en tiempo real

`onSnapshot` no encaja en `useQuery` (que es request/response). El heatmap del ayudante debe reaccionar a cada respuesta nueva, así que se usa un hook dedicado que sincroniza el cache de TanStack Query:

```typescript
// src/modules/results/core/hooks/use-room-responses-subscription.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ResponseRepository } from '@library/repositories/response.repository';
import { queryKeys } from '@library/query/query-keys';

export function useRoomResponsesSubscription(roomId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = ResponseRepository.subscribeByRoom(roomId, (responses) => {
      queryClient.setQueryData(queryKeys.responses.byRoom(roomId), responses);
    });
    return unsubscribe;
  }, [roomId, queryClient]);
}
```

El `return unsubscribe` no es opcional: sin él cada montaje deja un listener abierto contra Firestore, y eso se paga en cuota de lecturas — más aún en una sala con 40 alumnos respondiendo en paralelo.

### Buscar una sala por código corto

El alumno entra con un código (`"EDS101"`), no con el id del documento. El código es único, así que la consulta devuelve como máximo un resultado:

```typescript
// src/library/repositories/room.repository.ts
export const RoomRepository = {
  findByCode: async (code: string): Promise<Room | null> => {
    const snapshot = await getDocs(
      query(collection(db, 'rooms'), where('code', '==', code.toUpperCase()), limit(1)),
    );
    const first = snapshot.docs[0];
    return first ? toRoom(first) : null;
  },
};
```

Normalizar el código a mayúsculas **en el repositorio y al escribir**, no en el componente: si un alumno tipea `eds101` y la sala se guardó como `EDS101`, la igualdad estricta de Firestore no encuentra nada. Firestore no tiene búsqueda case-insensitive.

---

## Security Rules — la autorización real

Todo lo anterior es UX. **La autorización vive en las Firestore Security Rules**: un `requiredRoles` en el router no impide que alguien abra la consola del navegador y consulte la colección directamente.

Estas reglas son el contrato que el modelo de datos debe respetar; si una consulta del frontend no encaja aquí, es la consulta la que está mal.

```javascript
// firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn()      { return request.auth != null; }
    function isOwner(uid)      { return isSignedIn() && request.auth.uid == uid; }
    function isFullAccount()   { return isSignedIn() && request.auth.token.firebase.sign_in_provider != 'anonymous'; }

    // Perfil del ayudante — solo el propio usuario, y nunca una cuenta anónima
    match /users/{uid} {
      allow read:        if isOwner(uid);
      allow create:      if isOwner(uid) && isFullAccount();
      allow update:      if isOwner(uid) && request.resource.data.role == resource.data.role;  // no auto-promoverse
      allow delete:      if false;
    }

    match /rooms/{roomId} {
      // Lectura pública: el alumno necesita resolver el código antes de autenticarse
      allow read:   if true;
      allow create: if isFullAccount() && request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if isFullAccount() && resource.data.createdBy == request.auth.uid;

      match /responses/{responseId} {
        // El ayudante dueño ve todas; el alumno solo la suya
        allow read: if isOwner(responseId)
                    || (isFullAccount()
                        && get(/databases/$(database)/documents/rooms/$(roomId)).data.createdBy == request.auth.uid);

        // El id del documento DEBE ser el uid: así un alumno no puede escribir por otro
        allow create, update: if isOwner(responseId)
                              && get(/databases/$(database)/documents/rooms/$(roomId)).data.status == 'active';

        allow delete: if isOwner(responseId);
      }
    }

    // Resultados: los calcula el servidor, el cliente solo lee
    match /roomResults/{roomId} {
      allow read:  if true;
      allow write: if false;
    }
  }
}
```

Cuatro decisiones que conviene entender antes de tocarlas:

1. **`rooms` es de lectura pública.** El alumno tiene que resolver el código corto *antes* de existir como usuario. Consecuencia asumida: cualquiera que adivine un código ve el nombre de la sala. No poner datos sensibles en `Room`.
2. **`isFullAccount()` distingue anónimo de registrado.** Sin ese chequeo, un alumno anónimo podría crear salas: `isSignedIn()` es verdadero también para él.
3. **El id del documento de respuesta es el uid.** Es lo que convierte "solo puedes editar tu respuesta" en una regla de una línea, sin leer el documento previo.
4. **`roomResults` es de solo lectura para el cliente.** Si el frontend pudiera escribir el ranking, cualquier alumno podría fabricar el resultado. El recálculo va en una Cloud Function con trigger `onWrite` sobre `responses`.

**Las reglas se testean.** El emulador permite correrlas como tests, y son la única capa que realmente protege los datos:

```bash
npm install -D @firebase/rules-unit-testing
firebase emulators:exec --only firestore "npx vitest run firestore.rules.test.ts"
```

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
