# Configuracion Tecnica del Proyecto

Toda la configuracion critica del proyecto en un solo lugar.

---

## TypeScript — tsconfig.app.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "vitest/globals"],
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
      "@/*": ["src/*"],
      "@global/*": ["src/global/*"],
      "@library/*": ["src/library/*"],
      "@modules/*": ["src/modules/*"],
      "@resources/*": ["src/resources/*"]
    }
  },
  "include": ["src"]
}
```

### Opciones Clave

| Opcion | Valor | Razon |
|--------|-------|-------|
| `strict` | `true` | Habilita todas las verificaciones estrictas de TypeScript |
| `noUnusedLocals` | `true` | Falla si hay variables locales no usadas |
| `noUnusedParameters` | `true` | Falla si hay parametros de funcion no usados |
| `moduleResolution` | `"bundler"` | Compatible con Vite y sus reglas de resolucion |
| `types` | `["vite/client", "vitest/globals"]` | `vite/client` para `import.meta.env`; `vitest/globals` para `describe`, `it`, `expect` sin imports |
| `noEmit` | `true` | TypeScript solo verifica tipos; Vite hace el build |

---

## Vite — vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@global': path.resolve(__dirname, './src/global'),
      '@library': path.resolve(__dirname, './src/library'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@resources': path.resolve(__dirname, './src/resources'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.stories.tsx',
        'src/app/main.tsx',
      ],
    },
  },
});
```

### Plugins

| Plugin | Proposito |
|--------|-----------|
| `@vitejs/plugin-react` | React Fast Refresh en dev, JSX transform |
| `@tailwindcss/vite` | Tailwind v4 via plugin oficial (sin postcss.config.js) |

### Configuracion de Tests (bloque `test`)

| Opcion | Valor | Proposito |
|--------|-------|-----------|
| `globals` | `true` | `describe`, `it`, `expect`, `vi` disponibles sin imports |
| `environment` | `jsdom` | DOM virtual para tests de componentes |
| `passWithNoTests` | `true` | No falla si no hay archivos de test |
| `setupFiles` | `['./src/test/setup.ts']` | Configura jest-dom y MSW server |
| `exclude` | incluye `e2e/**` | Playwright tests no se ejecutan con Vitest |
| `coverage.provider` | `v8` | Cobertura nativa de Node.js, rapida |

---

## Variables de Entorno — .env.example

```bash
# Firebase (auth + Firestore)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Emuladores locales (auth 9099 / firestore 8080)
VITE_FIREBASE_USE_EMULATORS=false

# API auxiliar (Cloud Functions HTTP, terceros) — opcional
VITE_API_URL=http://localhost:3000

# Sentry DSN (leave empty to disable)
VITE_SENTRY_DSN=
```

### Descripcion de Variables

| Variable | Ejemplo | Descripcion |
|----------|---------|-------------|
| `VITE_FIREBASE_API_KEY` | `AIza...` | Clave web del proyecto Firebase. Publica por diseno: viaja en el bundle. |
| `VITE_FIREBASE_AUTH_DOMAIN` | `matchclass-dev.firebaseapp.com` | Dominio de Firebase Auth. |
| `VITE_FIREBASE_PROJECT_ID` | `matchclass-dev` | ID del proyecto. Determina a que Firestore apunta la app. |
| `VITE_FIREBASE_STORAGE_BUCKET` | `matchclass-dev.appspot.com` | Bucket de Cloud Storage. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Sender ID de FCM. |
| `VITE_FIREBASE_APP_ID` | `1:123:web:abc` | ID de la app web registrada. |
| `VITE_FIREBASE_USE_EMULATORS` | `true` / `false` | Si es `true`, conecta a los emuladores locales en vez del proyecto real. |
| `VITE_API_URL` | `http://localhost:3000` | URL base de APIs HTTP auxiliares. `baseURL` de Axios. Opcional. |
| `VITE_SENTRY_DSN` | `https://xxx@sentry.io/123` | DSN del proyecto en Sentry. Dejar vacio para deshabilitar. |

### Uso en Codigo

```ts
// src/library/firebase/firebase-app.ts
export const firebaseApp = initializeApp({
  apiKey:     import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
});

// src/library/integrations/sentry/sentry.client.ts
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});
```

**Convencion:** todas las variables de entorno expuestas al cliente deben empezar con `VITE_`. Las que no tienen el prefijo no son accesibles desde el codigo del navegador.

**Sobre las claves de Firebase:** son publicas por diseno — van en el bundle. Lo que protege los datos son las Firestore Security Rules y App Check, no ocultar el `apiKey`. Se cargan por `.env` para poder apuntar a distintos proyectos por entorno (dev / QA / prod).

---

## Scripts NPM — package.json

| Script | Comando | Descripcion |
|--------|---------|-------------|
| `dev` | `vite` | Servidor de desarrollo con HMR y MSW activo en puerto 5173 |
| `build` | `tsc -b && vite build` | Verifica tipos con TypeScript y genera bundle de produccion |
| `preview` | `vite preview` | Sirve el build de produccion localmente para verificar |
| `test` | `vitest` | Ejecuta tests en modo watch (re-ejecuta al guardar) |
| `test:ui` | `vitest --ui` | Vitest con interfaz grafica en el navegador |
| `test:coverage` | `vitest run --coverage` | Ejecuta todos los tests y genera reporte de cobertura en `coverage/` |
| `test:e2e` | `playwright test` | Ejecuta tests e2e con Playwright (requiere servidor activo) |
| `test:e2e:ui` | `playwright test --ui` | Playwright con interfaz grafica de Playwright |
| `storybook` | `storybook dev -p 6006` | Servidor de desarrollo de Storybook en puerto 6006 |
| `build-storybook` | `storybook build` | Genera build estatico de Storybook en `storybook-static/` |
| `msw:init` | `npx msw init public/` | Genera el Service Worker de MSW en `public/mockServiceWorker.js` |

---

## Playwright — playwright.config.ts

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Opciones Clave

| Opcion | Valor | Descripcion |
|--------|-------|-------------|
| `testDir` | `./e2e` | Directorio de tests e2e |
| `fullyParallel` | `true` | Tests corren en paralelo |
| `forbidOnly` | `!!process.env.CI` | En CI, falla si hay `test.only` |
| `retries` | `2` en CI, `0` local | Reintentos en CI para tests flaky |
| `baseURL` | `http://localhost:5173` | URL base para `page.goto('/')` |
| `trace` | `on-first-retry` | Captura trace en el primer reintento para debugging |
| `webServer` | `npm run dev` | Arranca el servidor de dev antes de los tests si no esta activo |

### Variable de Entorno para Override

```bash
PLAYWRIGHT_BASE_URL=https://staging.example.com npm run test:e2e
```

---

## MSW — Configuracion

**`package.json`:**
```json
{
  "msw": {
    "workerDirectory": ["public"]
  }
}
```

El Service Worker se sirve desde `public/mockServiceWorker.js`. Se genera una vez con `npm run msw:init` y se commitea al repositorio.

**Inicializacion en dev:** El browser worker solo se activa en modo desarrollo (ver `src/app/main.tsx` y `src/library/mocks/browser.ts`).
