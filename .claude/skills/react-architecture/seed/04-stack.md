# 04 — Stack: Herramientas y versiones exactas

> Todas las versiones están tomadas directamente de `package.json`. Usar estas versiones exactas garantiza reproducibilidad.

---

## Dependencias de producción

### React 19.2.4 + React DOM 19.2.4

```bash
npm install react@19.2.4 react-dom@19.2.4
```

React 19 introduce el compilador React y mejoras en concurrent features. Hooks esenciales: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`, `useContext`, `useTransition`, `useDeferredValue`.

Documentación: https://react.dev

---

### React Router DOM 7.13.1

```bash
npm install react-router-dom@7.13.1
```

Routing basado en componentes. React Router v7 introduce el modo "framework" con loaders y actions. En este seed se usa el modo SPA tradicional con `BrowserRouter`.

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/products', element: <ProductsPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

---

### Zustand 5.0.12

```bash
npm install zustand@5.0.12
```

Gestión de estado global minimalista. Zustand v5 mejora el soporte TypeScript.

```typescript
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

Documentación: https://zustand.docs.pmnd.rs

---

### TanStack Query 5.91.2

```bash
npm install @tanstack/react-query@5.91.2
```

Gestión de estado del servidor: fetching, caching, sincronización, invalidación.

**Setup del QueryClient** (en `src/app/`):

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 2,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Documentación: https://tanstack.com/query/v5

---

### PrimeReact 10.9.7 + Lucide (lucide-react)

```bash
npm install primereact@10.9.7 lucide-react@0.548.0
```

Biblioteca de componentes UI. Incluye 90+ componentes accesibles.

**Setup en `src/app/App.tsx`**:

```typescript
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.min.css';  // base SIN tema — theme.css define los tokens MatchClass

export function App() {
  return (
    <PrimeReactProvider>
      {/* resto de la app */}
    </PrimeReactProvider>
  );
}
```

Documentación: https://primereact.org

---

### Firebase 12.4.0

```bash
npm install firebase@12.4.0
```

Autenticacion (Firebase Auth) y persistencia (Cloud Firestore). El SDK vive exclusivamente en `src/library/firebase/` y `src/library/repositories/`; ningun componente importa `firebase/*` directamente.

**Setup**:

```typescript
// src/library/firebase/firebase-app.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseApp = initializeApp({
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
```

Guia completa: [06-auth-integration.md](06-auth-integration.md)

Documentación: https://firebase.google.com/docs/web/setup

---

### Axios 1.13.6

```bash
npm install axios@1.13.6
```

Cliente HTTP con interceptores. Configurado con `withCredentials: true` para cookies httpOnly.

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

### Zod 4.3.6

```bash
npm install zod@4.3.6
```

Validación de schemas con inferencia TypeScript. Zod v4 es significativamente más rápido y tiene una API mejorada.

```typescript
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  price: z.number().positive('El precio debe ser positivo'),
  category: z.enum(['electronics', 'clothing', 'food']),
});

export type Product = z.infer<typeof productSchema>;
```

Documentación: https://zod.dev

---

### React Hook Form 7.71.2 + Resolvers 5.2.2

```bash
npm install react-hook-form@7.71.2 @hookform/resolvers@5.2.2
```

Formularios con validación de alto rendimiento. Integra con Zod a través de `zodResolver`.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

---

### Sentry 10.44.0

```bash
npm install @sentry/react@10.44.0
```

Monitoreo de errores en producción.

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  enabled: import.meta.env.VITE_APP_ENV === 'production',
  tracesSampleRate: 0.1,
});
```

---

## Dependencias de desarrollo

### TypeScript 5.9.3

```bash
npm install -D typescript@5.9.3
```

Configuración strict recomendada (ver [01-bootstrapping.md](01-bootstrapping.md)).

---

### Vite 8.0.1 + Plugin React 6.0.1

```bash
npm install -D vite@8.0.1 @vitejs/plugin-react@6.0.1
```

Build tool con HMR instantáneo. Usa el compilador SWC para transformaciones más rápidas.

Variables de entorno: prefijo `VITE_` para exponer al cliente (ver [08-environments.md](08-environments.md)).

---

### Vitest 4.1.0

```bash
npm install -D vitest@4.1.0 @vitest/coverage-v8
```

Test runner compatible con Vite. Misma configuración en `vite.config.ts`.

```typescript
// vite.config.ts
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
}
```

---

### Testing Library 16.3.2

```bash
npm install -D @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1 @testing-library/user-event@14.6.1
```

Testing centrado en el comportamiento del usuario, no en la implementación.

---

### MSW 2.12.13

```bash
npm install -D msw@2.12.13
```

Mock Service Worker. Intercepta requests HTTP a nivel de Service Worker en el browser y a nivel de módulo en Node.js.

**Para el browser** (`src/library/mocks/browser.ts`):
```typescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

**Para tests** (`src/test/server.ts`):
```typescript
import { setupServer } from 'msw/node';
import { handlers } from '../library/mocks/handlers';

export const server = setupServer(...handlers);
```

---

### Playwright 1.58.2

```bash
npm install -D @playwright/test@1.58.2
npx playwright install
```

Tests e2e en browsers reales (Chromium, Firefox, WebKit).

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Tailwind CSS 4.2.2

```bash
npm install -D tailwindcss@4.2.2 @tailwindcss/vite@4.2.2
```

Tailwind v4 usa el plugin de Vite en lugar de `postcss.config.js`. Solo requiere:

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

plugins: [react(), tailwindcss()]
```

Y en `src/styles/main.css`:

```css
@import "../../../../node_modules/tailwindcss/dist/lib.d.mts";
```

---

### Storybook 10.3.0

```bash
npm install -D storybook@10.3.0 @storybook/react-vite@10.3.0
npx storybook init
```

Catálogo de componentes aislado. Se integra automáticamente con Vite.

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: '@storybook/react-vite',
  addons: ['@storybook/addon-essentials'],
};

export default config;
```
