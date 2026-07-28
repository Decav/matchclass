# Patrones Canonicos

8 patrones con codigo real del proyecto. Cada patron incluye snippet, reglas y ubicacion.

---

## 1. Repository Pattern

**Donde vive:** `src/library/repositories/{dominio}.repository.ts`

**Reglas:**
- Solo llama a `api.*` (instancia Axios).
- Retorna `r.data`, nunca el response completo.
- Sin try/catch (los errores se manejan en interceptores o en el hook).
- Sin logica de negocio, transformaciones ni combinaciones de llamadas.
- Sin JSX ni imports de React.

**Codigo real:** `src/library/repositories/auth.repository.ts`

```ts
import { api } from '@library/api/client/api-instance';
import type { LoginRequest } from '@resources/requests/auth.request';
import type { AuthResponse } from '@resources/responses/auth.response';

export const AuthRepository = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),
  logout: (): Promise<void> => api.post<void>('/api/auth/logout').then(() => undefined),
};
```

---

## 2. Service Pattern

**Donde vive:** `src/library/services/{dominio}.service.ts`

**Reglas:**
- Capa de abstraccion sobre el repositorio.
- Puede combinar multiples llamadas al repositorio.
- Puede transformar o enriquecer datos antes de retornarlos.
- Sin JSX ni hooks React.
- Es la `mutationFn` / `queryFn` que consumen los hooks.

**Codigo real:** `src/library/services/auth.service.ts`

```ts
import { AuthRepository } from '@library/repositories/auth.repository';
import type { LoginRequest } from '@resources/requests/auth.request';

export const AuthService = {
  login: (data: LoginRequest) => AuthRepository.login(data),
  logout: () => AuthRepository.logout(),
};
```

---

## 3. Query Hook

**Donde vive:** `src/modules/{modulo}/core/hooks/use-{nombre}-query.ts`

**Reglas:**
- Usa `useQuery` de TanStack Query.
- `queryKey` debe ser un array serializable y unico.
- `queryFn` llama al servicio o repositorio correspondiente.
- No modifica estado global directamente (solo lectura).
- El componente consume el objeto retornado (`data`, `isLoading`, `isError`).

**Codigo real:** `src/modules/home/core/hooks/use-stats-query.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@library/api/client/api-instance';
import type { StatsResponse } from '@resources/responses/stats.response';
import { queryKeys } from '@library/query/query-keys';

export function useStatsQuery() {
  return useQuery({
    queryKey: queryKeys.home.stats,  // registry central — nunca strings literales
    queryFn: () => api.get<StatsResponse>('/api/stats').then((r) => r.data),
    staleTime: 30_000,
  });
}
```

> Los tipos de respuesta viven en `@resources/responses/`, nunca inline en el hook.

---

## 4. Mutation Hook

**Donde vive:** `src/modules/{modulo}/core/hooks/use-{nombre}-mutation.ts`

**Reglas:**
- Usa `useMutation` de TanStack Query.
- `mutationFn` apunta al servicio correspondiente.
- `onSuccess` actualiza el store global y/o navega.
- Es el unico punto donde se conectan servicios + estado + navegacion.
- No puede importar de otros modulos.

**Codigo real:** `src/modules/authentication/core/hooks/use-login-mutation.ts`

```ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@library/services/auth.service';
import { useAuthStore } from '@global/store/auth.store';

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      login(data);
      void navigate('/dashboard');
    },
  });
}
```

---

## 5. Componente q4 — Organismo con Formulario

**Donde vive:** `src/modules/{modulo}/components/q4-{nombre}/q4-{nombre}.tsx`

**Reglas:**
- Usa React Hook Form con zodResolver para validacion.
- Llama hooks de dominio del modulo (`useLoginMutation`, etc.).
- No llama servicios ni repositorios directamente.
- Renderiza q2/q3 como campos, nunca inputs HTML primitivos directamente.
- Export nombrado (no default).

**Codigo real:** `src/modules/authentication/components/q4-login-form/q4-login-form.tsx`

```tsx
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { loginSchema, type LoginFormValues } from '../../core/schemas/login.schema';
import { useLoginMutation } from '../../core/hooks/use-login-mutation';
import { Q2InputField } from '../q2-input-field/q2-input-field';
import { Q2PasswordField } from '../q2-password-field/q2-password-field';

export function Q4LoginForm() {
  const { mutate: login, isPending, isError } = useLoginMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = (data: LoginFormValues) => login(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
      <h1 className="text-2xl font-bold text-center text-gray-900">Iniciar sesion</h1>
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <Q2InputField id="username" label="Usuario" error={errors.username?.message} {...field} />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Q2PasswordField inputId="password" label="Contrasena" error={errors.password?.message} {...field} />
        )}
      />
      {isError && <p className="text-red-500 text-sm text-center">Credenciales invalidas.</p>}
      <Button type="submit" label={isPending ? 'Ingresando...' : 'Ingresar'} disabled={isPending} className="w-full" />
    </form>
  );
}
```

---

## 6. Componente pa — Pagina Ensambladora

**Donde vive:** `src/modules/{modulo}/components/pa-{nombre}/pa-{nombre}.tsx`

**Reglas:**
- Solo renderiza q4/q5, sin logica de negocio inline.
- Define el layout de la pagina (fondo, centrado, padding).
- Es el componente asignado al `element` en las rutas.
- Export nombrado (no default).

**Codigo real:** `src/modules/authentication/components/pa-login/pa-login.tsx`

```tsx
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

---

## 7. Zustand Store

**Donde vive:** `src/global/store/{dominio}.store.ts` o `src/modules/{modulo}/core/state/{nombre}.store.ts`

**Reglas:**
- Interfaz de estado tipada (`interface AuthState`).
- Acciones definidas dentro del mismo `create()` call.
- Export nombrado del hook (`useAuthStore`), no del store raw.
- Solo para client state (sesion, UI). Nunca para datos del servidor.
- No usa `localStorage` por defecto (solo en memoria).

**Codigo real:** `src/global/store/auth.store.ts`

```ts
import { create } from 'zustand';
import type { User } from '@resources/entities/user.entity';
import type { AuthResponse } from '@resources/responses/auth.response';
import { AuthStatus } from '@resources/enums/auth-status.enum';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: AuthStatus.Unauthenticated,
  login: (response) =>
    set({ user: response.user, accessToken: response.accessToken, status: AuthStatus.Authenticated }),
  logout: () =>
    set({ user: null, accessToken: null, status: AuthStatus.Unauthenticated }),
}));
```

---

## 9. Skeleton en Estados de Carga

**Donde vive:** Dentro del componente que ejecuta la query, inmediatamente antes del render normal.

**Reglas:**
- Usar `<Skeleton>` de PrimeReact mientras `isLoading === true`. Nunca spinners custom ni componentes vacios.
- Las dimensiones del `<Skeleton>` deben aproximar el tamano del contenido real para evitar layout shift.
- Para listas: renderizar N instancias de `<Skeleton>` que emulen los items esperados.

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

  return <ul>{users?.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

Ver detalle completo: [11-http-error-handling.md](11-http-error-handling.md#regla-1-skeleton-en-estados-de-carga)

---

## 10. Sesion Invalida — `onAuthStateChanged` como fuente unica

**Donde vive:** `src/global/providers/auth-provider.tsx`

**Reglas:**
- La suscripcion a `onAuthStateChanged` se hace **una sola vez**, en `AuthProvider`. Cuando emite `null`, se ejecuta `clearUser()` y `Q5ProtectedRoute` redirige a `/login`.
- Los componentes NO manejan la sesion individualmente.
- El efecto retorna el `unsubscribe`: sin eso, cada montaje deja un listener abierto contra Firebase.
- El guard distingue tres estados; redirigir durante `Loading` expulsa al usuario en cada recarga.

**Codigo real:**

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

Para APIs HTTP auxiliares (Cloud Functions) el interceptor 401 de Axios sigue vigente en `src/library/api/interceptors/error.interceptor.ts`.

Ver detalle completo: [11-http-error-handling.md](11-http-error-handling.md#regla-2-sesion-invalida--la-resuelve-onauthstatechanged-nunca-el-componente)

---

## 11. Error 403 — Componente Q2Forbidden Inline

**Donde vive:** Componente consumidor + `src/global/components/q2-forbidden/` + `src/global/hooks/use-http-error.ts`

**Reglas:**
- Un 403 no redirige ni bloquea la pantalla completa.
- Usar `useHttpError(error)` para obtener `isForbidden: boolean`.
- Cuando `isForbidden === true`, renderizar `<Q2Forbidden />` en lugar del contenido normal.
- `Q2Forbidden` es un componente q2 atomico en `src/global/components/q2-forbidden/`.

**Codigo real:**

```tsx
import { Skeleton } from 'primereact/skeleton';
import { Q2Forbidden } from '@global/components/q2-forbidden/q2-forbidden';
import { useHttpError } from '@global/hooks/use-http-error';

export function Q4ReportsList() {
  const { data, isLoading, error } = useReportsQuery();
  const { isForbidden } = useHttpError(error);

  if (isLoading) return <Skeleton width="100%" height="20rem" />;
  if (isForbidden) return <Q2Forbidden />;

  return <ul>{data?.map((r) => <li key={r.id}>{r.title}</li>)}</ul>;
}
```

Ver detalle completo: [11-http-error-handling.md](11-http-error-handling.md#regla-3-permission-denied--403--componente-q2forbidden-nivel-componente-no-pantalla)

---

## 12. AppShell Pattern — Layout Estandar MatchClass

**Donde vive:** `src/global/components/q3-app-shell/q3-app-shell.tsx`

**Reglas:**
- Es q3 (Celula) porque tiene estado local complejo: `sidebarOpen`, calculo de `pageTitle`, `avatarInitials`.
- Vive en `global/` porque es completamente configurable via props: `appName`, `navItems`, `topbarActions`.
- No conoce ningun dominio de negocio. Recibe `navItems` como prop y renderiza lo que le den.
- El sidebar es siempre dark (`--mc-sidebar-bg: #1B2A4A`), independientemente del tema light/dark.
- En desktop: sidebar fijo a la izquierda (280px), siempre visible.
- En mobile: sidebar como overlay con backdrop oscuro, toggle via hamburger.
- `useLogoutMutation` es la unica dependencia de modulo que tiene. Esta es la excepcion permitida para logout.

**Interface NavItem:**

```typescript
export interface NavItem {
  path: string;   // ruta exacta para NavLink — ej: '/apps'
  icon: LucideIcon;   // componente Lucide, ej: LayoutGrid
  label: string;  // texto visible en el sidebar — ej: 'Aplicaciones'
}
```

**Como registrar en el router:**

```typescript
// src/app/router/app-router.tsx
const NAV_ITEMS: NavItem[] = [
  { path: '/apps',    icon: LayoutGrid,  label: 'Aplicaciones' },
  { path: '/users',   icon: Users,     label: 'Usuarios' },
  { path: '/reports', icon: BarChart3, label: 'Reportes' },
];

export const router = createBrowserRouter([
  ...authenticationRoutes,
  {
    element: <Q5ProtectedRoute />,
    children: [
      {
        element: <Q3AppShell appName="Mi App" navItems={NAV_ITEMS} />,
        children: moduleRoutes,  // routes que se renderizan en el <Outlet>
      },
    ],
  },
  { path: '/', element: <PaLanding /> },
]);
```

**Codigo real:** `src/global/components/q3-app-shell/q3-app-shell.tsx`

```tsx
import { type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@global/store/auth.store';
import { useUiStore } from '@global/store/ui.store';
import { useLogoutMutation } from '@modules/authentication/core';

export interface NavItem {
  path: string;
  icon: string;
  label: string;
}

interface Props {
  appName: string;
  navItems: NavItem[];
  topbarTitle?: string;
  topbarActions?: ReactNode;
}

export function Q3AppShell({ appName, navItems, topbarTitle, topbarActions }: Props) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const location = useLocation();
  const activeNavItem = navItems.find((item) => item.path === location.pathname);
  const pageTitle = topbarTitle ?? activeNavItem?.label ?? 'MatchClass';

  const avatarInitials = user?.name
    ? user.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="mc-app-shell">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`mc-sidebar${sidebarOpen ? '' : ' mc-sidebar-collapsed'} lg:!transform-none`}
        data-testid="sidebar"
      >
        <div className="mc-gradient flex items-center gap-3 px-5 py-5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white/60 text-xs font-medium leading-none mb-0.5">MatchClass</p>
            <p className="text-white text-sm font-bold leading-none truncate">{appName}</p>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mc-sidebar-item${isActive ? ' mc-sidebar-item--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`${item.icon} mc-sidebar-item__icon`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className="flex-shrink-0 border-t px-4 py-4"
          style={{ borderColor: 'var(--mc-sidebar-border)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mc-gradient">
              {avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--mc-sidebar-text)' }}>
                {user?.name ?? 'Usuario'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--mc-sidebar-text-muted)' }}>
                {user?.email ?? ''}
              </p>
            </div>
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
            style={{
              color: 'var(--mc-sidebar-text-muted)',
              backgroundColor: 'transparent',
              border: '1px solid var(--mc-sidebar-border)',
            }}
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            <LogOut size={16} />
            {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      <div className={`mc-main${sidebarOpen ? '' : ' mc-main-full'} lg:!ml-[var(--mc-sidebar-width)]`}>
        <header className="mc-topbar">
          <button
            className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            data-testid="hamburger-button"
          >
            <Menu size={22} style={{ color: 'var(--mc-text-secondary)' }} />
          </button>
          <h1 className="text-base font-semibold flex-1" style={{ color: 'var(--mc-text-primary)' }}>
            {pageTitle}
          </h1>
          {topbarActions && (
            <div className="flex items-center gap-2">{topbarActions}</div>
          )}
        </header>

        <main className="mc-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

Ver referencia completa: [12-design-system.md](12-design-system.md#13-appshell-pattern-q3appshell--layout-estandar-matchclass)

---

## 8. MSW Handler

**Donde vive:** `src/library/mocks/handlers/{dominio}.handlers.ts`

**Reglas:**
- Usa `http.{method}` de MSW para interceptar requests por ruta.
- Se define una vez y se comparte entre modo browser (dev) y Node (tests).
- Valida el body recibido y retorna respuestas realistas.
- Para errores, usa el segundo argumento de `HttpResponse.json({ message }, { status: N })`.
- Se registra en `src/library/mocks/handlers/index.ts`.

**Codigo real:** `src/library/mocks/handlers/auth.handlers.ts`

```ts
// Con Firebase se mockea el REPOSITORIO, no el SDK: asi el test sigue
// valiendo si manana se cambia de proveedor.
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

// Simular un fallo concreto de Firebase
import { FirebaseError } from 'firebase/app';
vi.mocked(AuthRepository.loginWithEmail).mockRejectedValueOnce(
  new FirebaseError('auth/invalid-credential', 'Invalid credential'),
);
```

MSW se mantiene solo para APIs HTTP auxiliares (Cloud Functions, servicios de terceros).
