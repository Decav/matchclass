# Manejo de Estados de Carga y Errores HTTP

Tres reglas obligatorias para el tratamiento de loading states y errores HTTP en componentes que consumen APIs.

---

## Regla 1: Skeleton en Estados de Carga

**Aplica a:** Todo componente que ejecute una query o mutation a una API.

**Reglas:**
- Mientras `isLoading === true`, el componente DEBE renderizar `<Skeleton>` de PrimeReact.
- El `<Skeleton>` debe tener dimensiones aproximadas al contenido que reemplaza (evitar layout shift).
- NUNCA mostrar un componente vacio ni un spinner custom en lugar del contenido — usar `<Skeleton>` de PrimeReact siempre.
- Para listas o grids, renderizar multiples instancias de `<Skeleton>` que emulen el numero esperado de items.

**Codigo real:**

```tsx
import { Skeleton } from 'primereact/skeleton';

export function Q4UserList() {
  const { data: users, isLoading } = useUsersQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="3rem" borderRadius="8px" />
        ))}
      </div>
    );
  }

  return (
    <ul>
      {users?.map((user) => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

**Para cards o bloques de contenido:**

```tsx
if (isLoading) {
  return <Skeleton width="100%" height="12rem" borderRadius="12px" />;
}
```

---

## Regla 2: Sesion invalida → la resuelve `onAuthStateChanged`, nunca el componente

**Aplica a:** todo el flujo de sesion. La fuente de verdad es Firebase Auth.

**Reglas:**
- `onAuthStateChanged` se suscribe **una sola vez**, en `AuthProvider` (`src/global/providers/auth-provider.tsx`).
- Cuando emite `null`, el provider ejecuta `clearUser()` y `Q5ProtectedRoute` redirige a `/login`.
- Esta logica NO debe duplicarse en componentes individuales ni en hooks de dominio.
- El guard distingue **tres** estados. Redirigir durante `Loading` expulsa al usuario en cada recarga de pagina.
- El efecto de suscripcion **debe** retornar el `unsubscribe`, o cada montaje deja un listener abierto.

```tsx
// src/global/providers/auth-provider.tsx
useEffect(() => {
  setStatus(AuthStatus.Loading);
  const unsubscribe = AuthRepository.subscribeToAuthState((user) => {
    if (user) setUser(user);
    else clearUser();
  });
  return unsubscribe;
}, [setUser, clearUser, setStatus]);
```

```tsx
// src/global/components/q5-protected-route/q5-protected-route.tsx
if (status === AuthStatus.Idle || status === AuthStatus.Loading) return <Q1LoadingSpinner />;
if (status !== AuthStatus.Authenticated) return <Navigate to="/login" replace />;
return <Outlet />;
```

**Anti-patron — NO hacer esto:**

```tsx
// MAL: dos estados en lugar de tres — expulsa al usuario en cada F5
if (!isAuthenticated) return <Navigate to="/login" replace />;
```

### APIs HTTP auxiliares (Cloud Functions, terceros)

Para las llamadas que sigan pasando por Axios, el interceptor 401 sigue vigente:

```ts
// src/library/api/interceptors/error.interceptor.ts
import type { AxiosError } from 'axios';
import { useAuthStore } from '@global/store/auth.store';

export function errorInterceptor(error: AxiosError): Promise<never> {
  if (error.response?.status === 401) {
    useAuthStore.getState().clearUser();
    window.location.replace('/login');
  }
  return Promise.reject(error);
}
```

---

## Regla 3: `permission-denied` / 403 → Componente Q2Forbidden (nivel componente, no pantalla)

**Aplica a:** todo componente o pagina cuyo acceso a datos pueda ser rechazado por las Firestore Security Rules (o por un 403 de una API auxiliar).

**Reglas:**
- No redirige ni bloquea la pantalla completa — el usuario sigue autenticado pero sin permiso para ese recurso especifico.
- Cada componente que puede recibir el rechazo usa `useFirebaseError` (o `useHttpError` en llamadas Axios) para detectar `isForbidden: true`.
- Cuando `isForbidden === true`, el componente renderiza `<Q2Forbidden />` inline en lugar de su contenido normal.
- `Q2Forbidden` es un componente atomico (q2) ubicado en `src/global/components/q2-forbidden/`.
- NUNCA usar `navigate('/forbidden')` ni mostrar una pagina de error completa por un 403.

**Hook principal:** `useFirebaseError` — `src/global/hooks/use-firebase-error.ts`

```ts
import { FirebaseError } from 'firebase/app';

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests':  'Demasiados intentos. Intenta más tarde.',
  'permission-denied':       'No tienes permisos para ver este contenido.',
  'unavailable':             'Servicio no disponible. Intenta nuevamente.',
};

export function useFirebaseError(error: unknown) {
  // instanceof es un type guard real — no usar (error as FirebaseError).code
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

**Hook para APIs auxiliares:** `useHttpError` — `src/global/hooks/use-http-error.ts`

```ts
import { isAxiosError } from 'axios';

interface HttpErrorState {
  isForbidden: boolean;
  isNotFound: boolean;
  isServerError: boolean;
}

export function useHttpError(error: unknown): HttpErrorState {
  if (!isAxiosError(error)) return { isForbidden: false, isNotFound: false, isServerError: false };
  const status = error.response?.status;
  return {
    isForbidden: status === 403,
    isNotFound: status === 404,
    isServerError: typeof status === 'number' && status >= 500,
  };
}
```

**Componente:** `Q2Forbidden` — ubicado en `src/global/components/q2-forbidden/q2-forbidden.tsx`

```tsx
export function Q2Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-2 text-center">
      <span className="text-4xl">🔒</span>
      <p className="text-gray-600 font-medium">No tienes permisos para ver este contenido.</p>
    </div>
  );
}
```

**Patron de uso en un organismo (q4):**

```tsx
import { Skeleton } from 'primereact/skeleton';
import { Q2Forbidden } from '@global/components/q2-forbidden/q2-forbidden';
import { useFirebaseError } from '@global/hooks/use-firebase-error';
import { useReportsQuery } from '../../core/hooks/use-reports-query';

export function Q4ReportsList() {
  const { data, isLoading, error } = useReportsQuery();
  const { isForbidden } = useFirebaseError(error);

  if (isLoading) return <Skeleton width="100%" height="20rem" />;
  if (isForbidden) return <Q2Forbidden />;

  return (
    <ul>
      {data?.map((report) => <li key={report.id}>{report.title}</li>)}
    </ul>
  );
}
```

**Patron completo con los tres estados (loading, 403, render normal):**

```tsx
const { data, isLoading, error } = useAlgunaQuery();
const { isForbidden } = useFirebaseError(error);

if (isLoading) return <Skeleton height="10rem" />;
if (isForbidden) return <Q2Forbidden />;
// render normal con data
```

---

## Resumen de Responsabilidades por Capa

| Error | Quien lo maneja | Accion |
|-------|----------------|--------|
| Sesion invalida (equiv. 401) | `AuthProvider` + `Q5ProtectedRoute` (global) | `clearUser()` + redirect a `/login` |
| `permission-denied` (equiv. 403) | Componente consumidor (modules/global) | Renderizar `<Q2Forbidden />` inline |
| `unavailable` / `deadline-exceeded` (equiv. 5xx) | Componente consumidor | Mensaje de reintento; TanStack Query reintenta |
| 401 en API auxiliar Axios | `error.interceptor.ts` (library) | `clearUser()` + `window.location.replace('/login')` |
| 4xx/5xx otros | Componente consumidor | Mostrar mensaje de error segun contexto |

**Regla invariante:** la gestion de sesion vive exclusivamente en `AuthProvider` y `Q5ProtectedRoute`. Los componentes en `src/modules/` jamas replican esa logica.

**La autorizacion real son las Firestore Security Rules.** El chequeo de roles en el frontend es UX: no impide que alguien consulte la coleccion desde la consola del navegador.
