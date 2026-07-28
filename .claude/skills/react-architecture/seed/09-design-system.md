# Seed 09 — Guia Minima: App MatchClass desde Cero

Guia ejecutable para crear una app MatchClass con: landing publica, login con Firebase Auth, AppShell con sidebar dark, y una pagina protegida. Basada en el seed `matchclass`.

---

## Objetivo

Con los archivos de esta guia, tenes una app funcional con:
- `/` — landing dark con gradiente brand y boton de login
- `/login` — formulario de acceso (Firebase Auth)
- `/dashboard` — destino tras el login exitoso
- `/apps` — pagina protegida dentro del AppShell (sidebar + topbar)

---

## Estructura minima de archivos

```
src/
├── styles/
│   ├── theme.css              ← COPIAR del seed (no modificar, ~600 lineas)
│   └── main.css               ← Tailwind entry point + @import theme.css
├── app/
│   ├── main.tsx               ← imports en el orden correcto
│   ├── providers/
│   │   └── app-providers.tsx  ← ThemeProvider + PrimeReactProvider + QueryClient + Router
│   └── router/
│       └── app-router.tsx     ← 4 rutas minimas con AppShell pattern
└── global/
    └── components/
        └── q3-app-shell/
            └── q3-app-shell.tsx  ← COPIAR del seed (no modificar)
```

Todo lo demas es especifico de la aplicacion.

---

## Paso 1 — Instalar dependencias

```bash
npm install \
  react@19.2.4 react-dom@19.2.4 \
  react-router-dom@7.13.1 \
  zustand@5.0.12 \
  @tanstack/react-query@5.91.2 \
  firebase@12.4.0 \
  primereact@10.9.7 lucide-react@0.548.0 \
  axios@1.13.6 \
  zod@4.3.6 \
  react-hook-form@7.71.2 @hookform/resolvers@5.2.2

npm install -D \
  tailwindcss@4.2.2 @tailwindcss/vite@4.2.2 \
  @vitejs/plugin-react@6.0.1 vite@8.0.1 \
  typescript@5.9.3 \
  @types/react@19.2.14 @types/react-dom@19.2.3
```

---

## Paso 2 — Los 5 archivos de configuracion (copiar tal cual)

### 2.1 `src/styles/theme.css`

**Copiar directamente del seed.** Este archivo (~600 lineas) contiene:
- CSS custom properties `--mc-*` para todos los tokens (colores, spacing, radios)
- Variables dark mode bajo `[data-theme="dark"]`
- Overrides de variables CSS de PrimeReact (`--p-primary-color`, `--p-surface-*`, etc.)
- Clases utility `mc-card`, `mc-badge-*`, `mc-btn-primary`, `mc-kpi-card`, `mc-sidebar-item`, `mc-app-shell`, etc.
- Animaciones `mc-animate-*`

```
# Copiar desde el seed:
cp path/to/matchclass/src/styles/theme.css src/styles/theme.css
```

### 2.2 `src/styles/main.css`

```css
/* src/styles/main.css */
@layer theme, base, components, utilities, primereact;

@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/utilities";
@import "./theme.css";
```

El orden importa: Tailwind primero, luego `theme.css` para que los tokens MatchClass tengan precedencia.

### 2.3 `src/app/main.tsx`

```tsx
// src/app/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './providers/app-providers';

// ORDEN CRITICO — no cambiar ni agregar temas de PrimeReact
import 'primereact/resources/primereact.min.css';
import '@/styles/theme.css';
import '@/styles/main.css';

// NO importar ningun archivo de tema:
// ❌ import 'primereact/resources/themes/lara-light-indigo/theme.css'
// theme.css ya sobreescribe todas las variables de PrimeReact con colores MatchClass

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);
```

### 2.4 `src/app/providers/app-providers.tsx`

```tsx
// src/app/providers/app-providers.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { ThemeProvider } from '@global/providers/theme-provider';
import { queryClient } from '@library/query/query-client';
import { router } from '../router/app-router';

export function AppProviders() {
  return (
    // ThemeProvider primero: aplica el tema antes de que PrimeReact renderice
    <ThemeProvider>
      {/* PrimeReactProvider: solo ripple: true, sin objeto theme */}
      <PrimeReactProvider value={{ ripple: true }}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </PrimeReactProvider>
    </ThemeProvider>
  );
}
```

### 2.5 `vite.config.ts`

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@global': resolve(__dirname, './src/global'),
      '@library': resolve(__dirname, './src/library'),
      '@modules': resolve(__dirname, './src/modules'),
      '@resources': resolve(__dirname, './src/resources'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

---

## Paso 3 — AppShell listo para usar

**Copiar directamente del seed:**

```
cp path/to/matchclass/src/global/components/q3-app-shell/q3-app-shell.tsx \
   src/global/components/q3-app-shell/q3-app-shell.tsx
```

El codigo completo (tal como quedo en el seed):

```tsx
// src/global/components/q3-app-shell/q3-app-shell.tsx
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

      <div
        className={`mc-main${sidebarOpen ? '' : ' mc-main-full'} lg:!ml-[var(--mc-sidebar-width)]`}
      >
        <header className="mc-topbar">
          <button
            className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            data-testid="hamburger-button"
          >
            <Menu size={22} style={{ color: 'var(--mc-text-secondary)' }} />
          </button>
          <h1
            className="text-base font-semibold flex-1"
            style={{ color: 'var(--mc-text-primary)' }}
          >
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

---

## Paso 4 — Router minimo con 4 rutas

```typescript
// src/app/router/app-router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Q5ProtectedRoute } from '@global/components/q5-protected-route/q5-protected-route';
import { Q3AppShell } from '@global/components/q3-app-shell/q3-app-shell';
import type { NavItem } from '@global/components/q3-app-shell/q3-app-shell';

// Importar rutas de modulos
import { authenticationRoutes } from '@modules/authentication';  // /login
import { homeRoutes } from '@modules/home';                      // /, /apps

const NAV_ITEMS: NavItem[] = [
  { path: '/apps', icon: LayoutGrid, label: 'Aplicaciones' },
  // Agregar items adicionales aqui a medida que se agreguen modulos:
  // { path: '/users', icon: Users, label: 'Usuarios' },
];

export const router = createBrowserRouter([
  // Rutas de autenticacion (publicas)
  // Incluye: /login (Firebase Auth)
  ...authenticationRoutes,

  // Rutas protegidas — envueltas en Q5ProtectedRoute + Q3AppShell
  {
    element: <Q5ProtectedRoute />,
    children: [
      {
        element: <Q3AppShell appName="Mi App" navItems={NAV_ITEMS} />,
        children: homeRoutes.filter((r) => r.path === '/apps'),
      },
    ],
  },

  // Ruta publica raiz — landing page
  homeRoutes.find((r) => r.path === '/')!,
]);
```

**Estructura de rutas resultante:**

| Ruta | Componente | Protegida |
|------|-----------|-----------|
| `/` | `PaLanding` | No — verifica sesion y redirige si existe |
| `/login` | `PaLogin` | No — formulario Firebase Auth |
| `/apps` | `PaApps` dentro de `Q3AppShell` | Si — `Q5ProtectedRoute` verifica sesion |

---

## Paso 5 — Agregar un nuevo modulo

Para cada nueva feature, solo se necesitan 3 archivos:

### 5.1 Las rutas del modulo

```typescript
// src/modules/mi-modulo/routes/mi-modulo.routes.tsx
import { PaMiPagina } from '../components/pa-mi-pagina/pa-mi-pagina';

export const miModuloRoutes = [
  { path: '/mi-ruta', element: <PaMiPagina /> },
];
```

### 5.2 La pagina del modulo

```tsx
// src/modules/mi-modulo/components/pa-mi-pagina/pa-mi-pagina.tsx
export function PaMiPagina() {
  return (
    <div className="flex flex-col gap-6 mc-animate-slide-up">
      <div className="mc-page-header">
        <h1 className="mc-page-header__title">Mi Pagina</h1>
        <p className="mc-page-header__subtitle">Descripcion de la pagina</p>
      </div>
      {/* Contenido */}
    </div>
  );
}
```

### 5.3 El barrel del modulo

```typescript
// src/modules/mi-modulo/index.ts
export { miModuloRoutes } from './routes/mi-modulo.routes';
```

### 5.4 Registrar en el router

```typescript
// En app-router.tsx, agregar las rutas dentro del children del Q3AppShell:
import { miModuloRoutes } from '@modules/mi-modulo';

const NAV_ITEMS: NavItem[] = [
  { path: '/apps',     icon: LayoutGrid, label: 'Aplicaciones' },
  { path: '/mi-ruta',  icon: Star,     label: 'Mi Modulo' },  // nuevo
];

// En el children del AppShell:
children: [
  ...homeRoutes.filter((r) => r.path === '/apps'),
  ...miModuloRoutes,  // nuevo
],
```

---

## Checklist — De git clone a app funcional (10 pasos)

- [ ] **1. Clonar** el seed: `git clone <repo> mi-app && cd mi-app`
- [ ] **2. Instalar**: `npm install`
- [ ] **3. Variables de entorno**: `cp .env.example .env.local` y completar las `VITE_FIREBASE_*` del proyecto
- [ ] **4. Verificar** que `src/styles/theme.css` existe (archivo de ~600 lineas con variables `--mc-*`)
- [ ] **5. Verificar** que `src/app/main.tsx` importa en el orden correcto: `primereact.min.css` → `theme.css` → `main.css` (sin `primeicons`)
- [ ] **6. Verificar** que `AppProviders` NO pasa `theme` al `PrimeReactProvider` (solo `{ ripple: true }`)
- [ ] **7. Personalizar** `appName` en `Q3AppShell` dentro de `app-router.tsx`
- [ ] **8. Ejecutar** `npm run dev` — deberia ver la landing dark con el gradiente navy → índigo
- [ ] **9. Verificar dark mode**: `document.documentElement.setAttribute('data-theme', 'dark')` en consola
- [ ] **10. Verificar AppShell**: loguear y confirmar sidebar dark (280px) + topbar + Outlet

---

## Referencia Completa

- [12-design-system.md](../architecture/12-design-system.md) — tokens completos, dark mode, clases `mc-*`
- [12-design-system.md#13](../architecture/12-design-system.md#13-appshell-pattern-q3appshell--layout-estandar-matchclass) — AppShell pattern completo
- [12-design-system.md#14](../architecture/12-design-system.md#14-primereact-setup--sin-tema-css-externo) — PrimeReact setup sin tema externo
- [04-patterns.md](../architecture/04-patterns.md#12-appshell-pattern--layout-estandar-matchclass) — Patron AppShell en patrones canonicos
- [07-new-module-guide.md](../architecture/07-new-module-guide.md) — Guia de 14 pasos para un modulo completo con API
