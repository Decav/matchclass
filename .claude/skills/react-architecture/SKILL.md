# React Architecture

````
utiliza la arquitectura de la carpeta ./seed y ./architecture
````

## Seccion 1: Reglas Criticas (INVIOLABLES)

1. UI no llama datos directamente. Todo acceso pasa por: `component → hook → service → repository → SDK/axios`. Ningun componente usa `api.*` ni importa `firebase/*` directamente.
2. `global` no tiene logica de negocio. Sus componentes son configurables por props; no conocen dominios como "autenticacion" ni "home".
3. `library` no tiene JSX. Ningun archivo en `library/` importa React ni renderiza componentes.
4. `resources` es completamente agnostico. Solo TypeScript puro y Zod. Sin React, sin Axios, sin Firebase.
5. `modules` orquesta todo. Es la unica capa que combina `library + global + resources` para implementar una feature completa. Los modulos no se importan entre si.
6. **Tests e2e obligatorios**: Todo flujo de auth, navegación, routes protegidas y features visibles requieren tests Playwright en `e2e/*.spec.ts` (ver `architecture/08-testing.md`)

---

## Seccion 2: Arbol de Decision

### Dado un archivo nuevo, ¿en que capa va?

```
¿Es un tipo, interface, enum o schema base?
  └─ SI  →  src/resources/

¿Es un componente, store, hook utilitario o util reutilizable sin logica de negocio?
  └─ SI  →  src/global/

¿Es cliente HTTP, repositorio, servicio, mock o integracion externa?
  └─ SI  →  src/library/

¿Es logica de negocio, formulario de dominio, pagina o ruta?
  └─ SI  →  src/modules/{nombre-del-modulo}/
```

### Dado un componente nuevo, ¿que prefijo?

```
¿Es el destino directo de una ruta React Router (element en createBrowserRouter)?
  └─ SI  →  pa

¿Controla un flujo completo o es un guard/layout?
  └─ SI  →  q5

¿Tiene logica de negocio (hooks de dominio, stores, llamadas via mutation/query)?
  └─ SI  →  q4

¿Tiene estado local complejo o multiples interacciones propias?
  └─ SI  →  q3

¿Combina 2-3 atomos con un proposito concreto (campo + label + error)?
  └─ SI  →  q2

¿Es el minimo indivisible (boton, icono, spinner)?
  └─ SI  →  q1
```

---

## Seccion 3: Aliases de Path

| Alias | Ruta Real | Cuando Usar |
|-------|-----------|-------------|
| `@/*` | `src/*` | Imports generales desde raiz de src |
| `@global/*` | `src/global/*` | Componentes, stores, hooks, utils reutilizables |
| `@library/*` | `src/library/*` | Repositories, services, api client, mocks |
| `@modules/*` | `src/modules/*` | Solo desde app/router para importar rutas |
| `@resources/*` | `src/resources/*` | Tipos, interfaces, enums, schemas base |

Los aliases estan definidos en `tsconfig.app.json` (paths) y `vite.config.ts` (resolve.alias). Funcionan automaticamente en tests (Vitest reutiliza la config de Vite).

---

## Seccion 4: Atomic Design

| Prefijo | Nombre | Cuando Usar | Ejemplo Real | Puede Importar |
|---------|--------|-------------|--------------|----------------|
| q1 | Atomo | Componente minimo sin logica de negocio | `q1-button`, `q1-loading-spinner` | librerias UI, @resources |
| q2 | Molecula | Combina 2-3 q1 con proposito concreto | `q2-badge`, `q2-input-field` | q1, @resources |
| q3 | Celula | Unidad con estado local complejo | `q3-stat-card` | q1, q2, @global/hooks, @resources |
| q4 | Organismo | Bloque con logica de negocio completa | `q4-login-form` | q1-q3, hooks de modulo, @global/store |
| q5 | Ecosistema | Guard, layout o flujo multi-pantalla | `q5-protected-route` | q1-q4, stores, hooks |
| pa | Pagina | Destino de ruta React Router | `pa-login`, `pa-dashboard` | q4, q5, componentes del modulo |

**Regla:** q4 y pa usan export nombrado, nunca default export.

---

## Seccion 5: Convenciones de Nombres

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Componente | `{nivel}-{nombre}.tsx` | `q4-login-form.tsx` |
| Carpeta componente | `{nivel}-{nombre}/` | `q4-login-form/` |
| Hook query | `use-{nombre}-query.ts` | `use-stats-query.ts` |
| Hook mutation | `use-{nombre}-mutation.ts` | `use-login-mutation.ts` |
| Repository | `{dominio}.repository.ts` | `auth.repository.ts` |
| Service | `{dominio}.service.ts` | `auth.service.ts` |
| Store Zustand | `{dominio}.store.ts` | `auth.store.ts` |
| Schema Zod | `{nombre}.schema.ts` | `login.schema.ts` |
| Handler MSW | `{dominio}.handlers.ts` | `auth.handlers.ts` |
| Entidad | `{nombre}.entity.ts` | `user.entity.ts` |
| Request type | `{dominio}.request.ts` | `auth.request.ts` |
| Response type | `{dominio}.response.ts` | `auth.response.ts` |
| Enum | `{nombre}.enum.ts` | `auth-status.enum.ts` |
| Rutas | `{modulo}.routes.tsx` | `authentication.routes.tsx` |
| Barrel | `index.ts` | `index.ts` |

**Export nombrado siempre** (no default exports en componentes, hooks, stores ni servicios).

**Funcion export = PascalCase del archivo sin el nivel:** `q4-login-form.tsx` → `export function Q4LoginForm`.

---

## Seccion 6: Estructura de Modulo Nuevo

### Arbol de directorios

```
src/modules/{modulo}/
├── components/
│   ├── q2-{nombre}/          # Moleculas especificas del modulo
│   ├── q4-{nombre}/          # Organismo principal (formulario, tabla)
│   └── pa-{nombre}/          # Pagina(s) enrutables
├── core/
│   ├── hooks/                # use-{nombre}-query.ts, use-{nombre}-mutation.ts
│   ├── schemas/              # {nombre}.schema.ts
│   └── state/                # {dominio}-ui.store.ts (si aplica)
├── routes/
│   └── {modulo}.routes.tsx
└── index.ts                  # Barrel: exporta routes + pa-*
```

### 14 Pasos (resumen)

1. `mkdir -p src/modules/{mod}/{components,core/hooks,core/schemas,core/state,routes}`
2. Crear `src/resources/entities/{entidad}.entity.ts` con `interface`
3. Crear `src/resources/requests/{dominio}.request.ts`
4. Crear `src/modules/{mod}/core/schemas/{nombre}.schema.ts` con `z.object` + `z.infer`
5. Crear `src/library/repositories/{mod}.repository.ts` con Firestore (`getDocs`/`addDoc`/`updateDoc`) + mapper `to{Entidad}`
6. Crear `src/library/services/{mod}.service.ts` **solo si hay logica de negocio real** (combina repos, aplica reglas); si no, los hooks llaman directo al repository
7. Crear `src/modules/{mod}/core/hooks/use-{mod}-query.ts` con `useQuery`
8. Crear `src/modules/{mod}/core/hooks/use-{nombre}-mutation.ts` con `useMutation`
9. Crear componentes q2/q3 si son especificos del modulo
10. Crear `src/modules/{mod}/components/q4-{nombre}/q4-{nombre}.tsx` con RHF + zodResolver
11. Crear `src/modules/{mod}/components/pa-{nombre}/pa-{nombre}.tsx` que renderiza q4
12. Crear `src/modules/{mod}/core/state/{dominio}-ui.store.ts` (si necesita UI state local)
13. Preparar los datos de prueba: mock del repository en tests unitarios; fixtures del emulador de Firestore en e2e (MSW solo para APIs HTTP auxiliares)
14. Crear `src/modules/{mod}/routes/{mod}.routes.tsx` y registrar en `app-router.tsx`; crear `src/modules/{mod}/index.ts`

---

## Seccion 7: Patrones de Codigo

### Repository

```ts
// src/library/repositories/auth.repository.ts
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@library/firebase/firebase-app';
import type { User } from '@resources/entities/user.entity';

async function toDomainUser(fbUser: FirebaseUser): Promise<User> {
  const { claims } = await fbUser.getIdTokenResult();
  return {
    id: fbUser.uid,
    name: fbUser.displayName ?? fbUser.email ?? 'Usuario',
    email: fbUser.email ?? '',
    photoUrl: fbUser.photoURL,
    roles: Array.isArray(claims.roles) ? claims.roles.map(String) : [],
  };
}

export const AuthRepository = {
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return toDomainUser(credential.user);
  },
  logout: (): Promise<void> => signOut(auth),
  subscribeToAuthState: (cb: (user: User | null) => void): (() => void) =>
    onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) { cb(null); return; }
      void toDomainUser(fbUser).then(cb);
    }),
};
```

El repository es el unico archivo que conoce `FirebaseUser`. Traduce al `User` del dominio.

### Repository de Firestore

```ts
// src/library/repositories/response.repository.ts
import { collection, doc, getDocs, setDoc, serverTimestamp, orderBy, query,
         type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@library/firebase/firebase-app';
import type { Response } from '@resources/entities/response.entity';

// Subcoleccion: las respuestas viven bajo su sala
const responsesRef = (roomId: string) => collection(db, 'rooms', roomId, 'responses');

// Mapper obligatorio: snapshot.data() es DocumentData (any en la practica)
function toResponse(snap: QueryDocumentSnapshot): Response {
  const data = snap.data();
  const blocks = Array.isArray(data.occupiedBlocks) ? data.occupiedBlocks : [];
  return {
    id: snap.id,
    roomId: String(data.roomId ?? ''),
    studentName: String(data.studentName ?? ''),
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

  // El id del documento ES el uid anonimo: responder dos veces sobrescribe,
  // y la Security Rule se reduce a `request.auth.uid == responseId`.
  submit: (roomId: string, uid: string, data: Pick<Response, 'studentName' | 'occupiedBlocks'>) =>
    setDoc(
      doc(responsesRef(roomId), uid),
      { ...data, roomId, createdByUid: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      { merge: true },
    ),
};
```

### Service

Solo cuando hay logica de negocio real (combinar repositorios, aplicar reglas). Un service que solo delega viola YAGNI — los hooks llaman directo al repository.

```ts
// src/library/services/matching.service.ts
import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { buildHeatmap } from '@modules/results/core/utils/build-heatmap';
import type { RoomResult } from '@resources/entities/room-result.entity';

export const MatchingService = {
  // Logica real: cruza dos colecciones y aplica las hard constraints del ayudante
  computeResult: async (roomId: string): Promise<RoomResult> => {
    const [room, responses] = await Promise.all([
      RoomRepository.getById(roomId),
      ResponseRepository.listByRoom(roomId),
    ]);
    if (!room) throw new Error(`Room ${roomId} no existe`);
    return buildHeatmap(room.helperBlockedSlots, responses);
  },
};
```

### Query Hook

```ts
// src/modules/results/core/hooks/use-room-responses-query.ts
import { useQuery } from '@tanstack/react-query';
import { ResponseRepository } from '@library/repositories/response.repository';
import { queryKeys } from '@library/query/query-keys';

export function useRoomResponsesQuery(roomId: string) {
  return useQuery({
    queryKey: queryKeys.responses.byRoom(roomId),  // registry central, nunca string literal
    queryFn: () => ResponseRepository.listByRoom(roomId),
    enabled: Boolean(roomId),
    staleTime: 30_000,
  });
}
```

### Suscripcion en tiempo real (Firestore)

`onSnapshot` no encaja en `useQuery` (request/response). Se usa un hook dedicado que sincroniza el cache:

```ts
// src/modules/results/core/hooks/use-room-responses-subscription.ts
export function useRoomResponsesSubscription(roomId: string) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = ResponseRepository.subscribeByRoom(roomId, (responses) => {
      queryClient.setQueryData(queryKeys.responses.byRoom(roomId), responses);
    });
    return unsubscribe;   // sin esto, cada montaje deja un listener abierto
  }, [roomId, queryClient]);
}
```

### Mutation Hook

```ts
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
    // No se llama a setUser aqui: onAuthStateChanged ya actualiza el store.
    onSuccess: () => { void navigate('/dashboard'); },
  });
}
```

### Componente q4 (Organismo con Formulario)

```tsx
// src/modules/authentication/components/q4-login-form/q4-login-form.tsx
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '../../core/schemas/login.schema';
import { useLoginMutation } from '../../core/hooks/use-login-mutation';

export function Q4LoginForm() {
  const { mutate: login, isPending, isError } = useLoginMutation();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });
  return (
    <form onSubmit={handleSubmit((data) => login(data))}>
      <Controller name="username" control={control}
        render={({ field }) => <input {...field} />} />
      {errors.username && <p>{errors.username.message}</p>}
      {isError && <p>Credenciales invalidas.</p>}
      <button type="submit" disabled={isPending}>Ingresar</button>
    </form>
  );
}
```

### Componente pa (Pagina)

```tsx
// src/modules/authentication/components/pa-login/pa-login.tsx
import { Q4LoginForm } from '../q4-login-form/q4-login-form';

export function PaLogin() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <Q4LoginForm />
      </div>
    </main>
  );
}
```

### Zustand Store

```ts
// src/global/store/auth.store.ts
import { create } from 'zustand';
import type { User } from '@resources/entities/user.entity';
import { AuthStatus } from '@resources/enums/auth-status.enum';

interface AuthState {
  user: User | null; status: AuthStatus;
  setUser: (user: User) => void; clearUser: () => void; setStatus: (s: AuthStatus) => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null, status: AuthStatus.Idle,
  setUser: (user) => set({ user, status: AuthStatus.Authenticated }),
  clearUser: () => set({ user: null, status: AuthStatus.Unauthenticated }),
  setStatus: (status) => set({ status }),
}));
```

No se persiste el token: Firebase Auth ya gestiona la persistencia de sesion y la renovacion del ID token. Duplicarlo a mano abre una ventana de token stale.

### Mock de repositorio en tests

Con Firebase se mockea **el repositorio**, no el SDK. Asi el test sigue valiendo si manana se cambia de proveedor.

```ts
// En el archivo de test
vi.mock('@library/repositories/auth.repository', () => ({
  AuthRepository: {
    loginWithEmail: vi.fn().mockResolvedValue({
      id: 'u1', name: 'Docente Test', email: 'test@matchclass.cl',
      photoUrl: null, roles: ['teacher'],
    }),
    logout: vi.fn().mockResolvedValue(undefined),
    subscribeToAuthState: vi.fn(() => () => undefined),   // devuelve el unsubscribe
  },
}));
```

MSW se mantiene solo para APIs HTTP auxiliares (Cloud Functions, servicios de terceros).

---

## Seccion 8: Estrategia de Testing

| Codigo | Herramienta | Archivo | Que Testear |
|--------|-------------|---------|-------------|
| Componente q1/q2/q3 | Vitest + Testing Library | `*.test.tsx` junto al componente | Render, props, eventos, accesibilidad |
| Componente q4 | Vitest + Testing Library + repo mockeado | `*.test.tsx` junto al componente | Validacion, submit, loading/error |
| Hook useQuery/useMutation | Vitest + renderHook + repo mockeado | `*.test.ts` junto al hook | mutate, isSuccess, isError |
| Store Zustand | Vitest + renderHook | `*.test.ts` junto al store | Estado inicial, acciones, resultado |
| Schema Zod | Vitest | `*.test.ts` junto al schema | safeParse valido/invalido, mensajes |
| Repository/Service | Vitest + emulador Firestore | `*.test.ts` junto al archivo | Llamadas correctas, mapper, retorno |
| E2E flujo | Playwright + emuladores Firebase | `e2e/{flujo}.spec.ts` | Flujos criticos de usuario |

### Setup de los emuladores en e2e

Los e2e corren contra los emuladores de Firebase con datos sembrados, nunca contra produccion:

```bash
firebase emulators:start --only auth,firestore --import ./e2e/fixtures
```

### Setup de MSW (solo APIs HTTP auxiliares)

```ts
// En cada archivo de test de integracion que golpee una API HTTP
import { server } from '@library/mocks/server';
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Simular un error de Firebase en un test

```ts
import { FirebaseError } from 'firebase/app';

vi.mocked(AuthRepository.loginWithEmail).mockRejectedValueOnce(
  new FirebaseError('auth/invalid-credential', 'Invalid credential')
);
```

---

## Seccion 11: Anti-Patrones — Lo que NUNCA debes hacer

Reglas extraídas de las revisiones técnicas del seed matchclass. Cada una tiene un bug real que causó.

---

### React Hooks

**`useMemo` para side effects — PROHIBIDO**

`useMemo` es solo para cálculos puros. React puede descartarlo y re-ejecutarlo en cualquier momento. En Strict Mode (dev) se ejecuta dos veces, causando condiciones de carrera.

```tsx
// ❌ Bug real encontrado en pa-login.tsx y pa-landing.tsx
useMemo(() => {
  queryClient.resetQueries({ queryKey: queryKeys.auth.validate });
}, []);

// ✅ Correcto
useEffect(() => {
  void queryClient.resetQueries({ queryKey: queryKeys.auth.validate });
}, [queryClient]);
```

**`eslint-disable` sin documentar el invariante — PROHIBIDO**

Un disable sin contexto puede estar ocultando un bug real. Si el disable es correcto, explicar por qué.

```tsx
// ❌ ¿Es un bug o es intencional?
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// ✅ Invariante documentado
// hasRun.current garantiza ejecución única en StrictMode (doble-mount).
// Los valores de closure son estables en el mount inicial del callback.
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

---

### TypeScript

**Non-null assertion `!` — PROHIBIDO sin guard**

Si alguien refactoriza el código y el valor deja de existir, el error es silencioso en runtime.

```tsx
// ❌ Bug real en app-router.tsx — error silencioso si alguien renombra '/'
homeRoutes.find((r) => r.path === '/')!

// ✅ Falla ruidosamente con mensaje descriptivo
const landingRoute = homeRoutes.find((r) => r.path === '/');
if (!landingRoute) throw new Error('Landing route "/" not found in homeRoutes');
```

**Type assertion `as` sin type narrowing — PROHIBIDO**

Castear `unknown` directamente a un tipo concreto hace que el tipado mienta.

```typescript
// ❌ Bug real en use-http-error.ts — si error no es AxiosError, el tipado miente
const axiosError = error as AxiosError;
return axiosError.response?.status ?? null;

// ✅ Type narrowing real
import { isAxiosError } from 'axios';
if (!isAxiosError(error)) return null;
return error.response?.status ?? null;
```

**`as never` en tests — PROHIBIDO**

Silencia un error de tipo en lugar de corregirlo. El test miente sobre el estado del sistema.

```typescript
// ❌ Bug real en use-logout-mutation.test.ts
useAuthStore.setState({ user: null, status: undefined as never });

// ✅ Usar el valor correcto del tipo
useAuthStore.setState({ user: null, status: AuthStatus.Unauthenticated });
```

**`void variable` para silenciar noUnusedLocals — PROHIBIDO**

Si una variable no se usa, no se desestructura.

```tsx
// ❌ Antipatrón encontrado en pa-landing.tsx
const { isPending, isSuccess, isError } = useAuthValidateQuery();
void isError;

// ✅ Desestructurar solo lo que se usa
const { isPending, isSuccess } = useAuthValidateQuery();
```

**Enums — EVITAR, preferir `as const`**

Los enums generan código JS extra y tienen peor tree-shaking.

```typescript
// ❌ enum innecesario
enum AuthStatus { Idle = 'idle', Authenticated = 'authenticated' }

// ✅ as const — TypeScript nativo, mejor tree-shaking
export const AuthStatus = {
  Idle: 'idle',
  Authenticated: 'authenticated',
  Unauthenticated: 'unauthenticated',
  Loading: 'loading',
} as const;
export type AuthStatus = typeof AuthStatus[keyof typeof AuthStatus];
```

---

### TanStack Query

**Query keys como strings literales — PROHIBIDO**

Sin autocompletado, typo silencioso, las invalidaciones manuales no detectan la key en compilación.

```typescript
// ❌ Bug real en use-stats-query.ts (versión anterior)
queryKey: ['stats'],

// ✅ Registry central en src/library/query/query-keys.ts
export const queryKeys = {
  auth: { validate: ['auth', 'validate'] as const },
  home: { stats: ['home', 'stats'] as const },
} as const;

queryKey: queryKeys.home.stats,
```

**Side effects dentro de `queryFn` — PROHIBIDO**

Si TanStack Query hace refetch automático (staleTime, window focus), el side effect se ejecuta silenciosamente. Si el query se cancela mid-flight, el store queda inconsistente.

```typescript
// ❌ El side effect se ejecuta en cada refetch automático
queryFn: async () => {
  const responses = await ResponseRepository.listByRoom(roomId);
  setSelectedBlock(responses[0]);   // ← no va aquí
  return responses;
}

// ✅ Separar fetch de sincronización de estado
const query = useQuery({
  queryKey: queryKeys.responses.byRoom(roomId),
  queryFn: () => ResponseRepository.listByRoom(roomId),
});
useEffect(() => {
  if (query.data) setSelectedBlock(query.data[0]);
}, [query.data]);
```

---

### Firebase

**Importar `firebase/*` fuera de `library` — PROHIBIDO**

El SDK vive exclusivamente en `src/library/firebase/` y `src/library/repositories/`. Un componente que importa `firebase/firestore` salta tres capas y ata la UI al proveedor.

```tsx
// ❌ El componente conoce Firestore
import { getDocs, collection } from 'firebase/firestore';

// ✅ componente → hook → repository → SDK
const { data } = useRoomResponsesQuery(roomId);
```

**`snapshot.data()` sin mapper — PROHIBIDO**

`DocumentData` es `any` en la práctica. Sin mapper explícito, el `any` se propaga por toda la app.

```typescript
// ❌ El tipado miente
const responses = snapshot.docs.map((d) => d.data() as Response);

// ✅ Mapper que valida campo a campo
function toResponse(snap: QueryDocumentSnapshot): Response {
  const data = snap.data();
  return { id: snap.id, studentName: String(data.studentName ?? ''), /* ... */ };
}
```

**`onSnapshot` / `onAuthStateChanged` sin cleanup — BUG**

Cada montaje sin desuscripción deja un listener abierto: en StrictMode se duplica en dev, y en prod se paga en cuota de lecturas.

```typescript
// ✅ Siempre retornar el unsubscribe desde el efecto
useEffect(() => {
  const unsubscribe = ResponseRepository.subscribeByRoom(roomId, onData);
  return unsubscribe;
}, [roomId, onData]);
```

**Redirigir a `/login` durante el estado `Loading` — BUG**

`onAuthStateChanged` tarda unos milisegundos en emitir. Si el guard no distingue "cargando" de "no autenticado", el usuario sale expulsado al login en cada recarga de página.

```tsx
// ❌ Expulsa al usuario en cada F5
if (!isAuthenticated) return <Navigate to="/login" replace />;

// ✅ Tres estados, no dos
if (status === AuthStatus.Loading) return <Q1LoadingSpinner />;
if (status !== AuthStatus.Authenticated) return <Navigate to="/login" replace />;
```

**Confiar en `requiredRoles` del frontend como seguridad — PELIGROSO**

Las Firestore Security Rules son la autorización real. El chequeo de roles en el router es UX: no impide que alguien consulte la colección desde la consola del navegador.

---

### Axios y API Layer

Aplica a APIs auxiliares (Cloud Functions HTTP, servicios de terceros). El camino principal de datos es Firestore.

**Axios sin tipo genérico — PROHIBIDO**

`r.data` infiere como `any`, contaminando el tipado del repositorio.

```typescript
// ❌ r.data es any
notify: () => api.post('/notifications', {}).then((r) => r.data),

// ✅ Tipo explícito — void cuando el backend no retorna body útil
notify: (): Promise<void> =>
  api.post<void>('/notifications', {}).then(() => undefined),
```

**Tipos de respuesta inline en hooks — PROHIBIDO**

Los tipos de dominio viven en `@resources/responses/`. Si se necesitan en otro componente, no hay dónde importarlos.

```typescript
// ❌ Bug real en use-stats-query.ts (versión anterior)
interface Stats { users: number; requests: number; uptime: string; }

// ✅ En src/resources/responses/stats.response.ts
export interface StatsResponse { users: number; requests: number; uptime: string; }
// Re-exportar desde src/resources/responses/index.ts
```

**`console.error` / `console.log` en código de producción — PROHIBIDO**

Usar el interceptor centralizado o Sentry para errores. `console.*` no es estrategia de debugging.

---

### Variables de Entorno

**`vite-env.d.ts` ausente — BLOQUEANTE**

Sin él, `import.meta.env.VITE_*` es `any`. Un typo como `VITE_FIREBASE_PROJET_ID` compila sin error.

```typescript
// src/vite-env.d.ts — obligatorio en todo proyecto Vite
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_USE_EMULATORS?: string;
  readonly VITE_SENTRY_DSN?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }
```

**Variables críticas fuera de `REQUIRED_ENV_VARS` — PELIGROSO**

Un fallback silencioso es más peligroso que un error explícito. Si falta `VITE_FIREBASE_PROJECT_ID`, el SDK inicializa igual y falla más tarde con un error opaco de red, lejos de la causa.

```typescript
// ❌ Fallback silencioso — el SDK apunta a ninguna parte y falla en runtime
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '';

// ✅ Validar en startup. Si falta, la app no arranca con mensaje claro.
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;
```

Las claves web de Firebase son públicas por diseño (viajan en el bundle). Se cargan por `.env` para poder apuntar a distintos proyectos por entorno, no para ocultarlas.

---

### Design System

**Colores hex hardcodeados en `style={{}}` — PROHIBIDO**

Si cambia la paleta corporativa, hay que buscar en todo el código.

```tsx
// ❌ Inmantenible
style={{ background: 'linear-gradient(135deg, #0C1322 0%, #1B2A4A 40%)' }}

// ✅ Variable CSS en theme.css — un solo lugar para cambiar
style={{ background: 'var(--mc-hero-bg)' }}
```

**`part[0]` para iniciales de avatar — BUG**

Si el nombre contiene espacios consecutivos, `split` genera strings vacíos y `[0]` retorna `undefined`.

```tsx
// ❌ Bug con espacios consecutivos en el nombre
.map((part) => part[0])

// ✅ charAt retorna '' en strings vacíos; filter elimina los vacíos
.map((part) => part.charAt(0))
.filter(Boolean)
.join('')
```

---

### Capa Service

**Service passthrough sin lógica — VIOLA YAGNI**

Un service que solo delega al repository confunde al equipo: no queda claro cuándo usar Service vs Repository.

```typescript
// ❌ Zero lógica de negocio
export const ResponseService = {
  listByRoom: (roomId: string) => ResponseRepository.listByRoom(roomId),
};

// ✅ Opción A: Service con lógica real (combina repos, aplica reglas de negocio)
// ✅ Opción B: Eliminar la capa Service hasta que haya lógica que la justifique.
//    Los hooks llaman directo al Repository.
```

---

## Checklist de Revisión Antes de Commit

Antes de hacer commit de cualquier `.tsx` / `.ts`:

- [ ] ¿`useMemo` con side effects? → cambiar a `useEffect`
- [ ] ¿`!` non-null assertion? → agregar guard explícito con `throw` o early return
- [ ] ¿`as TipoConcreto` sin type narrowing? → usar `isAxiosError` u otro type guard
- [ ] ¿`as never` o `as unknown as X`? → corregir el tipo en origen
- [ ] ¿`void variable` para silenciar unused? → eliminar del destructuring
- [ ] ¿Query key como string literal? → mover a `queryKeys` registry en `query-keys.ts`
- [ ] ¿Side effect dentro de `queryFn`? → separar con `useEffect` sobre `query.data`
- [ ] ¿Tipo de respuesta inline en un hook? → mover a `@resources/responses/`
- [ ] ¿`api.get()` o `api.post()` sin genérico `<T>`? → tipar siempre
- [ ] ¿`snapshot.data()` sin mapper explícito? → escribir `to{Entidad}(snap)`
- [ ] ¿`onSnapshot` / `onAuthStateChanged` sin retornar el unsubscribe? → cleanup obligatorio
- [ ] ¿`firebase/*` importado fuera de `library/`? → mover al repository
- [ ] ¿El guard redirige durante el estado `Loading`? → tres estados, no dos
- [ ] ¿Color hex en `style={{}}`? → variable CSS en `theme.css`
- [ ] ¿`console.error` / `console.log`? → eliminar o reemplazar con Sentry
- [ ] ¿`src/vite-env.d.ts` existe con todas las vars tipadas?
- [ ] ¿Todas las vars críticas en `REQUIRED_ENV_VARS` de `main.tsx`?
- [ ] ¿Comentarios zombie o código `@deprecated`? → eliminar
- [ ] ¿`eslint-disable` sin explicación del invariante? → documentar por qué es seguro

---

## Seccion 9: Referencias Adicionales

- [00-overview.md](architecture/00-overview.md) — Mapa general del proyecto y arbol de directorios
- [01-layers.md](architecture/01-layers.md) — Las 4 capas NDK con ejemplos y reglas de importacion
- [02-atomic-design.md](architecture/02-atomic-design.md) — Niveles q1-q5 y pa con arbol de decision
- [03-stack.md](architecture/03-stack.md) — Tabla de tecnologias con versiones exactas
- [04-patterns.md](architecture/04-patterns.md) — 8 patrones canonicos con snippets reales
- [05-conventions.md](architecture/05-conventions.md) — Nomenclatura completa de archivos
- [06-data-flows.md](architecture/06-data-flows.md) — 4 flujos end-to-end con diagramas ASCII
- [07-new-module-guide.md](architecture/07-new-module-guide.md) — Guia ejecutable de 14 pasos
- [08-testing.md](architecture/08-testing.md) — Estrategia de testing con snippets
- [09-adrs.md](architecture/09-adrs.md) — 7 ADRs con contexto, decision y consecuencias
- [10-config.md](architecture/10-config.md) — tsconfig, vite, env vars, scripts npm, playwright
- [11-http-error-handling.md](architecture/11-http-error-handling.md) — Skeleton en carga, errores de Firebase, componente Q2Forbidden para `permission-denied`
- [seed/06-auth-integration.md](seed/06-auth-integration.md) — Firebase Auth + Firestore en capas NDK
- [12-design-system.md](architecture/12-design-system.md) — Estandar de diseno MatchClass: tokens, dark mode, PrimeReact overrides, patrones UI

---

## Seccion 10: Design System MatchClass

Paleta híbrida *Academic Tech + Data Heat*. Referencia completa en [12-design-system.md](architecture/12-design-system.md).

### Colores brand (INVIOLABLES — no cambiar)

| Token | Valor | Rol |
|-------|-------|-----|
| `--mc-brand-primary` | `#1B2A4A` (navy) | Botones, headers, navegacion, bloque de grilla ocupado |
| `--mc-brand-secondary` | `#4F46E5` (indigo) | Links, info badges, elementos interactivos, focus ring |
| `--mc-brand-accent` | `#E8A838` (dorado) | CTA principal, highlights, badges destacados |
| `--mc-brand-accent-dark` | `#D97706` | Hover del acento, warning |
| `--mc-brand-gradient` | `linear-gradient(135deg, #1B2A4A, #4F46E5)` | Sidebar header, KPI headers |
| `--mc-brand-gradient-accent` | `linear-gradient(135deg, #E8A838, #D97706)` | CTA principal |

Los colores brand **NO cambian** en dark mode.

### Tipografia (INVIOLABLE)

| Token | Valor | Uso |
|-------|-------|-----|
| `--mc-font-sans` | `Inter` | Headings y body — todo el texto de UI |
| `--mc-font-mono` | `JetBrains Mono` | Datos numericos, celdas de grilla, horas, porcentajes |

Todo dato numerico comparable en vertical usa mono + `font-variant-numeric: tabular-nums`.

### Iconografia (INVIOLABLE)

**Lucide** (`lucide-react`), trazo `strokeWidth={2}`, 22px por defecto (16 en tablas, 18 en botones, 28+ en empty states). `primeicons` no se instala. Para los iconos internos de PrimeReact se pasan templates Lucide (`dropdownIcon`, `closeIcon`, `pt`).

### Mapa de calor y grilla

| Token | Valor | Significado |
|-------|-------|-------------|
| `--mc-heatmap-high` | `#34D399` | ≥70% disponibilidad |
| `--mc-heatmap-medium` | `#FBBF24` | 40-69% |
| `--mc-heatmap-low` | `#F97316` | 10-39% |
| `--mc-heatmap-conflict` | `#EF4444` | Superposicion / conflicto |
| `--mc-heatmap-blocked` | `#6B7280` | Bloqueado por admin |
| `--mc-grid-resting` | `#FFFFFF` | Bloque libre |
| `--mc-grid-occupied` | `#1B2A4A` | Bloque con clase asignada |
| `--mc-grid-disabled` | `#F3F4F6` | Bloque fuera de rango |

Los tokens del heatmap **no son** tokens semanticos: ambar significa "40-69% de disponibilidad", no "advertencia". No intercambiarlos con `--mc-warning` / `--mc-success`.

### Reglas criticas del Design System

1. **Tokens primero:** Todos los colores y espaciados usan variables `--mc-*` de `theme.css`. Ningun valor hex hardcodeado en componentes.
2. **Clases MatchClass para patrones recurrentes:** Usar `.mc-card`, `.mc-badge-{color}`, `.mc-btn-primary`, `.mc-kpi-card` en lugar de reinventar estilos.
3. **Dark mode automatico:** Si un componente usa solo variables `--mc-*`, hereda el dark mode gratis. Si hardcodea colores, rompe el dark mode.
4. **Sidebar siempre dark:** El sidebar usa `--mc-sidebar-bg` (`#1B2A4A`), nunca cambia con el tema.
5. **PrimeReact override via CSS:** Las customizaciones de PrimeReact se hacen en `theme.css` via CSS variables, no con props inline ni CSS-in-JS.
6. **El dorado es fondo, nunca texto sobre claro:** `#E8A838` sobre blanco da 2.1:1 — falla AA. Texto sobre dorado: `--mc-text-on-accent` (`#1F2937`). Texto en tono dorado sobre claro: `--mc-accent-text` (`#B45309`).
7. **El color nunca es el unico canal:** todo bloque del heatmap lleva el dato como texto o un `aria-label` descriptivo.

### Dark mode — implementacion

```tsx
// Activar dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Volver a light mode
document.documentElement.removeAttribute('data-theme');

// Hook para componentes React
import { useThemeContext } from '@global/providers/theme-provider';
const { isDark, toggleTheme } = useThemeContext();
```

### PrimeReact preset (Aura/Lara customizado)

El preset de PrimeReact se customiza **via CSS variables** en `theme.css`, no en el objeto del Provider. Las variables clave:

```css
--p-primary-color: #1B2A4A;
--p-primary-contrast-color: #ffffff;
--p-focus-ring-color: rgba(79, 70, 229, 0.3);
```

No usar `definePreset()` a menos que se necesite un override profundo de tokens JS. El CSS override es suficiente para el 95% de los casos.

### Z-index layers (no sobrescribir sin coordinacion)

| Capa | Valor | Uso |
|------|-------|-----|
| Sidebar | 50 | Navegacion lateral |
| Modal/Dialog | 200 | Dialogs y drawers de PrimeReact |
| Toast | 300 | Notificaciones toast |
| Tooltip | 400 | Tooltips (siempre encima de todo) |

## Reglas de manejo de estados de carga y errores

### Regla 1: Skeleton en estados de carga (isLoading)
- Mientras `isLoading === true`, el componente DEBE renderizar `<Skeleton>` de PrimeReact.
- Usar dimensiones aproximadas al contenido real para evitar layout shift.
- NUNCA usar spinners custom ni componentes vacios — usar `<Skeleton>` de PrimeReact siempre.
- Para listas: renderizar N instancias de `<Skeleton>` que emulen los items esperados.

```tsx
import { Skeleton } from 'primereact/skeleton';
if (isLoading) return <Skeleton height="3rem" />;
```

### Regla 2: Sesion invalida → la resuelve `onAuthStateChanged`, no el componente
- La fuente de verdad de la sesion es `onAuthStateChanged`, suscrito una sola vez en `AuthProvider`.
- Cuando emite `null`, el store se limpia y `Q5ProtectedRoute` redirige a `/login`.
- Esta logica NO se duplica en componentes individuales.
- El guard distingue **tres** estados: `Loading` → spinner, `Unauthenticated` → redirect, `Authenticated` → `<Outlet />`. Redirigir durante `Loading` expulsa al usuario en cada F5.
- Para APIs auxiliares vía Axios (Cloud Functions), el interceptor 401 de `src/library/api/interceptors/error.interceptor.ts` sigue vigente.

### Regla 3: `permission-denied` → Componente Q2Forbidden inline (nivel componente, no pantalla)
- Equivale al 403 HTTP: el usuario sigue autenticado pero sin permiso para ese recurso. NO redirige.
- Usar `useFirebaseError(error)` para detectar `isForbidden: true` (o `useHttpError` en llamadas Axios).
- Cuando `isForbidden === true`, renderizar `<Q2Forbidden />` inline en lugar del contenido normal.
- `Q2Forbidden` es un componente q2 en `src/global/components/q2-forbidden/`.
- NUNCA usar `navigate('/forbidden')` ni bloquear la pantalla completa.

```tsx
const { isForbidden } = useFirebaseError(error);
if (isForbidden) return <Q2Forbidden />;
```

### Patron completo (loading + 403 + render normal)
```tsx
const { data, isLoading, error } = useAlgunaQuery();
const { isForbidden } = useHttpError(error);

if (isLoading) return <Skeleton height="10rem" />;
if (isForbidden) return <Q2Forbidden />;
// render normal con data
```

Ver referencia completa con snippets y tabla de responsabilidades: [11-http-error-handling.md](architecture/11-http-error-handling.md)
