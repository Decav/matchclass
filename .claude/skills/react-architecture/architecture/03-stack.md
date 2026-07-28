# Stack Tecnologico

Versiones exactas de `package.json` del proyecto. Fecha de referencia: 2026-03-20.

---

## Tabla de Tecnologias

| Tecnologia | Version | Capa | Alias | Proposito |
|-----------|---------|------|-------|-----------|
| React | 19.2.4 | modules, global | — | Framework UI principal |
| TypeScript | 5.9.3 | todas | — | Tipado estatico, strict mode |
| Vite | 8.0.1 | raiz | — | Build tool, dev server, bundler |
| React Router DOM | 7.13.1 | modules, app | — | Enrutamiento SPA, navegacion |
| TanStack Query | 5.91.2 | library, modules | — | Server state, caching, queries y mutations |
| Zustand | 5.0.12 | global, modules | — | Client state (auth, UI preferences) |
| Firebase | 12.4.0 | library | — | Autenticacion (Firebase Auth) y persistencia (Cloud Firestore) |
| Axios | 1.13.6 | library | — | Cliente HTTP para APIs auxiliares (Cloud Functions, terceros) |
| React Hook Form | 7.71.2 | modules (q4) | — | Gestion de formularios performante |
| @hookform/resolvers | 5.2.2 | modules (q4) | — | Bridge RHF ↔ Zod validation |
| Zod | 4.3.6 | modules/schemas, resources | — | Validacion y fuente de verdad de tipos |
| PrimeReact | 10.9.7 | global (q1-q3) | — | Libreria de componentes UI |
| lucide-react | 0.548.0 | global, modules | — | Iconografía oficial (trazo 2px, 22px default) |
| Tailwind CSS | 4.2.2 | global, modules | — | Estilos utilitarios, layout |
| @tailwindcss/vite | 4.2.2 | raiz | — | Plugin Tailwind para Vite |
| Vitest | 4.1.0 | todas (test) | — | Unit e integration tests (integrado en Vite) |
| @testing-library/react | 16.3.2 | tests de componentes | — | Renderizado y queries orientadas al usuario |
| @testing-library/user-event | 14.6.1 | tests de componentes | — | Simulacion de interacciones de usuario |
| @testing-library/jest-dom | 6.9.1 | test setup | — | Matchers adicionales (toBeInTheDocument) |
| Playwright | 1.58.2 | e2e/ | — | Tests end-to-end multi-browser |
| MSW | 2.12.13 | library/mocks | — | Mocking de APIs HTTP auxiliares (Firebase se mockea en el repository) |
| Sentry React | 10.44.0 | library/integrations | — | Monitoreo de errores y performance en prod |
| Storybook | 10.3.0 | .storybook/ | — | Desarrollo y documentacion de componentes |
| @storybook/react-vite | 10.3.0 | .storybook/ | — | Integracion Storybook con Vite |
| jsdom | 29.0.0 | test | — | DOM virtual para Vitest |
| @vitejs/plugin-react | 6.0.1 | raiz | — | Plugin React Fast Refresh para Vite |

---

## Aliases de Path

Definidos en `tsconfig.app.json` y replicados en `vite.config.ts`:

| Alias | Ruta Real | Cuando Usar |
|-------|-----------|-------------|
| `@/*` | `src/*` | Imports generales desde raiz de src |
| `@global/*` | `src/global/*` | Componentes, stores, hooks y utils reutilizables |
| `@library/*` | `src/library/*` | Repositorios, servicios, API client, mocks |
| `@modules/*` | `src/modules/*` | Rutas y exports de modulos (uso desde app/) |
| `@resources/*` | `src/resources/*` | Tipos, interfaces, enums, schemas base |

### Configuracion en tsconfig.app.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@global/*": ["src/global/*"],
      "@library/*": ["src/library/*"],
      "@modules/*": ["src/modules/*"],
      "@resources/*": ["src/resources/*"]
    }
  }
}
```

### Configuracion en vite.config.ts

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@global': path.resolve(__dirname, './src/global'),
    '@library': path.resolve(__dirname, './src/library'),
    '@modules': path.resolve(__dirname, './src/modules'),
    '@resources': path.resolve(__dirname, './src/resources'),
  },
},
```

---

## Distribucion por Capa

| Capa | Tecnologias que viven ahi |
|------|--------------------------|
| `resources` | TypeScript, Zod (schemas base) |
| `global` | React, Zustand, PrimeReact, Tailwind, RHF (wrappers) |
| `library` | Firebase SDK, Axios, TanStack Query (client), MSW, Sentry |
| `modules` | React, TanStack Query (hooks), Zustand (local), Zod (schemas de modulo), RHF |
| `app/` | React Router, QueryClientProvider |
| `e2e/` | Playwright |
| `*.test.*` | Vitest, Testing Library, MSW |
| `*.stories.*` | Storybook |
