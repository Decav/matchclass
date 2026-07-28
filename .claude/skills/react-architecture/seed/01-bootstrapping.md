# 01 — Bootstrapping: De cero a `npm run dev`

## Prerequisitos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Node.js | 20.x | `node --version` |
| npm | 10.x | `npm --version` |

---

## Paso 1: Crear el proyecto con Vite

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
```

Esto genera la estructura base con React + TypeScript usando Vite.

---

## Paso 2: Instalar dependencias de producción

Instala las dependencias con versiones exactas para garantizar reproducibilidad:

```bash
npm install \
  react@19.2.4 \
  react-dom@19.2.4 \
  react-router-dom@7.13.1 \
  zustand@5.0.12 \
  @tanstack/react-query@5.91.2 \
  firebase@12.4.0 \
  primereact@10.9.7 \
  lucide-react@0.548.0 \
  axios@1.13.6 \
  zod@4.3.6 \
  react-hook-form@7.71.2 \
  @hookform/resolvers@5.2.2 \
  @sentry/react@10.44.0
```

---

## Paso 3: Instalar dependencias de desarrollo

```bash
npm install -D \
  typescript@5.9.3 \
  vite@8.0.1 \
  @vitejs/plugin-react@6.0.1 \
  vitest@4.1.0 \
  @vitest/coverage-v8 \
  @testing-library/react@16.3.2 \
  @testing-library/jest-dom@6.9.1 \
  @testing-library/user-event@14.6.1 \
  jsdom@29.0.0 \
  msw@2.12.13 \
  @playwright/test@1.58.2 \
  storybook@10.3.0 \
  @storybook/react-vite@10.3.0 \
  tailwindcss@4.2.2 \
  @tailwindcss/vite@4.2.2 \
  @types/react@19.2.14 \
  @types/react-dom@19.2.3
```

---

## Paso 4: Configurar `vite.config.ts`

Reemplaza el contenido de `vite.config.ts` con:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@app': resolve(__dirname, 'src/app'),
      '@global': resolve(__dirname, 'src/global'),
      '@library': resolve(__dirname, 'src/library'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@resources': resolve(__dirname, 'src/resources'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
```

---

## Paso 5: Configurar `tsconfig.app.json`

Agrega los `paths` correspondientes a los aliases de Vite:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@global/*": ["src/global/*"],
      "@library/*": ["src/library/*"],
      "@modules/*": ["src/modules/*"],
      "@resources/*": ["src/resources/*"]
    }
  },
  "include": ["src"]
}
```

---

## Paso 5b: Configurar estilos — Design System MatchClass

### Copiar theme.css del seed

El archivo `src/styles/theme.css` del seed es el corazon del design system. Copiarlo al nuevo proyecto:

```bash
cp path/to/matchclass/src/styles/theme.css src/styles/theme.css
```

Este archivo (~600 lineas) contiene:
- Variables CSS `--mc-*` para todos los tokens (colores, spacing, radios, sombras)
- Overrides de PrimeReact (`--p-primary-color`, `--p-surface-*`, `--p-text-color`)
- Dark mode bajo `[data-theme="dark"]`
- Clases utility `mc-card`, `mc-btn-*`, `mc-badge-*`, `mc-kpi-card`, `mc-sidebar-item`, etc.

### Crear main.css (entry point de Tailwind)

```css
/* src/styles/main.css */
@layer theme, base, components, utilities, primereact;

@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/utilities";
@import "./theme.css";
```

### Configurar main.tsx con el orden correcto de imports

```tsx
// src/app/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './providers/app-providers';

// ORDEN CRITICO — no reordenar, no agregar temas de PrimeReact
import 'primereact/resources/primereact.min.css'; // base de PrimeReact (SIN tema)
import '@/styles/theme.css';                      // tokens MatchClass + overrides PrimeReact
import '@/styles/main.css';                       // Tailwind utilities

// NUNCA importar ningun archivo de tema de PrimeReact:
// ❌ import 'primereact/resources/themes/lara-light-indigo/theme.css'
// ❌ import 'primereact/resources/themes/aura-light-blue/theme.css'
//
// Por que: theme.css ya sobreescribe todas las variables CSS que esos archivos definen,
// con los colores brand MatchClass (navy #1B2A4A + índigo #4F46E5). Si se importara un tema
// CSS de PrimeReact, sobrescribiria los colores MatchClass y romperia el dark mode.

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);
```

### Configurar AppProviders

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
    <ThemeProvider>
      {/* Solo ripple: true — NO pasar objeto theme, los colores vienen de theme.css */}
      <PrimeReactProvider value={{ ripple: true }}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </PrimeReactProvider>
    </ThemeProvider>
  );
}
```

---

## Paso 6: Crear estructura de carpetas

```bash
mkdir -p src/app
mkdir -p src/global/components
mkdir -p src/global/hooks
mkdir -p src/global/stores
mkdir -p src/library/api
mkdir -p src/library/repositories
mkdir -p src/library/mocks/handlers
mkdir -p src/modules
mkdir -p src/resources/entities
mkdir -p src/resources/schemas
mkdir -p src/resources/types
mkdir -p src/test
```

---

## Paso 7: Archivo de setup para tests

Crea `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

---

## Paso 8: Configurar MSW

```bash
npx msw init public/
```

Agrega al `package.json`:

```json
{
  "msw": {
    "workerDirectory": ["public"]
  }
}
```

---

## Paso 9: Crear `.env.example`

Crea `.env.example` en la raíz del proyecto:

```bash
# API
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_USE_EMULATORS=false
VITE_API_BASE_URL=http://localhost:3000

# App
VITE_APP_ENV=development
VITE_SENTRY_DSN=
```

Copia el archivo:

```bash
cp .env.example .env.local
```

---

## Paso 10: Verificar arranque

```bash
npm run dev
```

Deberías ver:

```
  VITE v8.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build de producción |
| `npm run test` | Tests unitarios con Vitest (watch mode) |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run test:e2e` | Tests e2e con Playwright |
| `npm run storybook` | Storybook en puerto 6006 |
