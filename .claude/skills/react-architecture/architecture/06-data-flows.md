# Flujos de Datos End-to-End

4 flujos principales con diagramas ASCII y descripcion por paso.

---

## Flujo 1: Login

Desde que el usuario ingresa credenciales hasta el redirect al dashboard.

```
[Usuario]
   │  ingresa username + password
   ▼
[Q4LoginForm]  (q4-login-form.tsx)
   │  useForm + zodResolver(loginSchema)
   │  onSubmit(LoginFormValues)
   ▼
[useLoginMutation]  (use-login-mutation.ts)
   │  mutate({ username, password })
   │  mutationFn: AuthService.login
   ▼
[AuthService]  (auth.service.ts)
   │  AuthRepository.login(data)
   ▼
[AuthRepository]  (auth.repository.ts)
   │  api.post<AuthResponse>('/api/auth/login', data).then(r => r.data)
   ▼
[Axios / MSW]
   │  HTTP POST /api/auth/login
   │  En dev: MSW intercepta y retorna mock AuthResponse
   │  En prod: llega al backend real
   ▼
[authHandlers]  (auth.handlers.ts) — solo en dev/tests
   │  valida body, retorna { accessToken, refreshToken, user }
   ▼
[useLoginMutation.onSuccess(data)]
   │  login(data)  →  useAuthStore.login(response)
   │  set({ user, accessToken, status: Authenticated })
   ▼
[useAuthStore]  (auth.store.ts)
   │  estado Zustand actualizado
   ▼
[void navigate('/dashboard')]
   │  React Router redirige
   ▼
[Q5ProtectedRoute]  (q5-protected-route.tsx)
   │  accessToken !== null → <Outlet />
   ▼
[PaDashboard]  (pa-dashboard.tsx)
   └─ Dashboard visible
```

**Pasos detallados:**

1. Usuario escribe en `Q2InputField` y `Q2PasswordField` controlados por RHF.
2. Al submit, `zodResolver` valida contra `loginSchema`. Si hay errores, los muestra inline.
3. Si valido, `handleSubmit` llama `onSubmit(data: LoginFormValues)`.
4. `login(data)` llama `useMutation.mutate(data)`.
5. TanStack Query ejecuta `AuthService.login(data)` como `mutationFn`.
6. `AuthService` delega sin cambios a `AuthRepository.login(data)`.
7. `AuthRepository` llama `api.post(...)` y retorna `r.data`.
8. En desarrollo: MSW intercepta la request y devuelve `AuthResponse` mock.
9. `onSuccess(data)` recibe el `AuthResponse`.
10. `login(data)` actualiza `useAuthStore`: `user`, `accessToken`, `status = Authenticated`.
11. `navigate('/dashboard')` cambia la URL.
12. `Q5ProtectedRoute` lee `accessToken` del store, ve que no es null, renderiza `<Outlet />`.
13. `PaDashboard` se renderiza.

---

## Flujo 2: Query de Datos (Stats Dashboard)

Desde que un componente monta hasta que los datos del servidor se renderizan.

```
[PaDashboard]  (pa-dashboard.tsx)
   │  monta el componente
   ▼
[useStatsQuery]  (use-stats-query.ts)
   │  useQuery({ queryKey: ['stats'], queryFn, staleTime: 30_000 })
   │  TanStack Query verifica el cache
   │  Si cache valido (< 30s): retorna data sin llamada HTTP
   │  Si cache expirado o vacio: ejecuta queryFn
   ▼
[queryFn]
   │  api.get<Stats>('/api/stats').then(r => r.data)
   ▼
[api Axios]
   │  HTTP GET /api/stats (con Bearer token via auth.interceptor)
   ▼
[Backend / MSW]
   │  Retorna { users, requests, uptime }
   ▼
[TanStack Query cache]
   │  Almacena resultado, marca como fresh
   │  Notifica a todos los suscriptores
   ▼
[PaDashboard]
   │  { data, isLoading, isError } disponibles
   │  isLoading: true → muestra Q1LoadingSpinner
   │  isError: true   → muestra mensaje de error
   │  data: Stats     → renderiza Q3StatCard con valores reales
   ▼
[Q3StatCard]
   └─ Muestra usuarios, requests, uptime
```

**Pasos detallados:**

1. `PaDashboard` monta y llama `useStatsQuery()`.
2. TanStack Query busca la entry `['stats']` en el cache.
3. Si existe y es fresh (< `staleTime: 30_000ms`): retorna `data` sin llamada HTTP.
4. Si no existe o esta stale: ejecuta `queryFn`.
5. Axios agrega el `Authorization: Bearer {token}` via `auth.interceptor.ts`.
6. La respuesta llega, TanStack Query actualiza el cache y el estado del hook.
7. El componente se re-renderiza con `data` disponible.
8. Mientras `isLoading = true`, se renderiza `Q1LoadingSpinner`.

---

## Flujo 3: Inicializacion de la App

Desde que el navegador carga `index.html` hasta que el usuario ve la primera pantalla.

```
[index.html]
   │  <script type="module" src="/src/app/main.tsx">
   ▼
[main.tsx]
   │  1. initSentry()  →  Sentry.init({ dsn: VITE_SENTRY_DSN })
   │  2. En desarrollo: startMSW browser worker
   │     browser.ts → navigator.serviceWorker.register('/mockServiceWorker.js')
   ▼
[createRoot(rootElement).render()]
   │  <StrictMode>
   │    <AppProviders />
   │  </StrictMode>
   ▼
[AppProviders]  (app-providers.tsx)
   │  <QueryClientProvider client={queryClient}>
   │    <RouterProvider router={router} />
   │  </QueryClientProvider>
   ▼
[router]  (app-router.tsx)
   │  createBrowserRouter([
   │    ...authenticationRoutes,   // /login → PaLogin
   │    { element: <Q5ProtectedRoute />, children: [/dashboard → PaDashboard] },
   │    / → PaLanding,
   │  ])
   ▼
[React Router]
   │  Evalua la URL actual
   │  / → PaLanding
   │  /login → PaLogin
   │  /dashboard → Q5ProtectedRoute → (auth check)
   ▼
[Q5ProtectedRoute]  (si ruta protegida)
   │  Lee useAuthStore.accessToken
   │  null → <Navigate to="/login" replace />
   │  existe → <Outlet />  (renderiza la ruta hija)
   ▼
[Componente de pagina]
   └─ Vista visible para el usuario
```

---

## Flujo 4: Guard de Rutas

Mecanismo que protege rutas privadas y redirige si no hay sesion activa.

```
[Usuario navega a /dashboard]
   │  React Router resuelve la ruta
   ▼
[app-router.tsx]
   │  /dashboard esta dentro del elemento Q5ProtectedRoute
   │  {
   │    element: <Q5ProtectedRoute />,
   │    children: [{ path: '/dashboard', element: <PaDashboard /> }]
   │  }
   ▼
[Q5ProtectedRoute]  (q5-protected-route.tsx)
   │  const accessToken = useAuthStore((s) => s.accessToken)
   │
   ├─ accessToken === null
   │     │
   │     ▼
   │  <Navigate to="/login" replace />
   │  (reemplaza la entrada en el historial, el usuario no puede volver atras con Back)
   │
   └─ accessToken !== null
         │
         ▼
      <Outlet />
      (renderiza PaDashboard como ruta hija)
   ▼
[PaDashboard]
   └─ Dashboard visible
```

**Codigo real:** `src/global/components/q5-protected-route/q5-protected-route.tsx`

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';

export function Q5ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

**Codigo real del router:** `src/app/router/app-router.tsx`

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { authenticationRoutes } from '@modules/authentication';
import { homeRoutes } from '@modules/home';
import { Q5ProtectedRoute } from '@global/components/q5-protected-route/q5-protected-route';

export const router = createBrowserRouter([
  ...authenticationRoutes,
  {
    element: <Q5ProtectedRoute />,
    children: homeRoutes.filter((r) => r.path === '/dashboard'),
  },
  homeRoutes.find((r) => r.path === '/')!,
]);
```

**Flujo de logout:**

```
[Usuario hace logout]
   │
   ▼
[useAuthStore.logout()]
   │  set({ user: null, accessToken: null, status: Unauthenticated })
   ▼
[Q5ProtectedRoute re-renderiza]
   │  accessToken === null
   ▼
[<Navigate to="/login" replace />]
   └─ Usuario en /login
```
