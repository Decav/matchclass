# Convenciones de Nomenclatura

Reglas de nombrado para todos los tipos de archivo del proyecto. La nomenclatura es consistente, predecible y auditable.

---

## Tabla Completa de Nomenclatura

| Tipo de Archivo | Patron de Nombre | Ejemplo Real | Donde Vive | Export Esperado |
|----------------|-----------------|--------------|------------|-----------------|
| Componente q1 | `q1-{nombre}.tsx` | `q1-button.tsx` | `src/global/components/q1-{nombre}/` | `export function Q1Button` |
| Componente q2 | `q2-{nombre}.tsx` | `q2-badge.tsx` | `src/global/components/q2-{nombre}/` o `src/modules/{mod}/components/q2-{nombre}/` | `export function Q2Badge` |
| Componente q3 | `q3-{nombre}.tsx` | `q3-stat-card.tsx` | `src/global/components/q3-{nombre}/` | `export function Q3StatCard` |
| Componente q4 | `q4-{nombre}.tsx` | `q4-login-form.tsx` | `src/modules/{modulo}/components/q4-{nombre}/` | `export function Q4LoginForm` |
| Componente q5 | `q5-{nombre}.tsx` | `q5-protected-route.tsx` | `src/global/components/q5-{nombre}/` | `export function Q5ProtectedRoute` |
| Pagina (pa) | `pa-{nombre}.tsx` | `pa-login.tsx` | `src/modules/{modulo}/components/pa-{nombre}/` | `export function PaLogin` |
| Carpeta componente | `{nivel}-{nombre}/` | `q1-button/` | Misma ubicacion que el archivo | — |
| Hook (query) | `use-{nombre}-query.ts` | `use-stats-query.ts` | `src/modules/{modulo}/core/hooks/` | `export function useStatsQuery` |
| Hook (mutation) | `use-{nombre}-mutation.ts` | `use-login-mutation.ts` | `src/modules/{modulo}/core/hooks/` | `export function useLoginMutation` |
| Hook (generico) | `use-{nombre}.ts` | `use-debounce.ts` | `src/global/hooks/` | `export function useDebounce` |
| Repository | `{dominio}.repository.ts` | `auth.repository.ts` | `src/library/repositories/` | `export const AuthRepository` |
| Service | `{dominio}.service.ts` | `auth.service.ts` | `src/library/services/` | `export const AuthService` |
| Store Zustand | `{dominio}.store.ts` | `auth.store.ts` | `src/global/store/` o `src/modules/{mod}/core/state/` | `export const useAuthStore` |
| Schema Zod | `{nombre}.schema.ts` | `login.schema.ts` | `src/modules/{modulo}/core/schemas/` | `export const loginSchema`, `export type LoginFormValues` |
| Interfaz / tipo | `{nombre}.entity.ts` | `user.entity.ts` | `src/resources/entities/` | `export interface User` |
| Request type | `{dominio}.request.ts` | `auth.request.ts` | `src/resources/requests/` | `export interface LoginRequest` |
| Response type | `{dominio}.response.ts` | `auth.response.ts` | `src/resources/responses/` | `export interface AuthResponse` |
| Enum | `{nombre}.enum.ts` | `auth-status.enum.ts` | `src/resources/enums/` | `export enum AuthStatus` |
| Handler MSW | `{dominio}.handlers.ts` | `auth.handlers.ts` | `src/library/mocks/handlers/` | `export const authHandlers` |
| Rutas de modulo | `{modulo}.routes.tsx` | `authentication.routes.tsx` | `src/modules/{modulo}/routes/` | `export const authenticationRoutes` |
| Barrel index | `index.ts` | `index.ts` | En cada carpeta publica | Re-exports de los archivos del directorio |
| Test componente | `{nombre}.test.tsx` | `q1-button.test.tsx` | Junto al componente | — |
| Test logica | `{nombre}.test.ts` | `use-login-mutation.test.ts` | Junto al archivo testeado | — |
| Storybook | `{nombre}.stories.tsx` | `q1-button.stories.tsx` | Junto al componente | `export default { ... }` |

---

## Regla de Exports Nombrados

**No se usan default exports en componentes, hooks, stores ni servicios.**

Razon: los exports nombrados son refactorizables automaticamente por TypeScript, son mas faciles de importar (IDE autocompleta), y evitan inconsistencias de nombrado al importar.

```ts
// CORRECTO
export function Q1Button() { ... }
export const AuthRepository = { ... };
export const useAuthStore = create<AuthState>(...);

// INCORRECTO
export default function Button() { ... }
export default AuthRepository;
```

Excepcion: los archivos de configuracion (vite.config.ts, playwright.config.ts, storybook meta) usan `export default` porque sus herramientas lo requieren.

---

## Convencion de Barrel index.ts

Cada carpeta "publica" tiene un `index.ts` que re-exporta sus elementos:

```ts
// src/global/components/q1-button/index.ts
export { Q1Button } from './q1-button';

// src/modules/authentication/index.ts
export { authenticationRoutes } from './routes/authentication.routes';
export { PaLogin } from './components/pa-login/pa-login';
```

**Regla:** el barrel index de un modulo solo exporta lo que el resto de la app necesita ver: las rutas y los componentes pa-. Los internos (q4, hooks, schemas) no necesitan estar en el barrel raiz del modulo.

---

## Convencion de Nombres de Funciones/Clases

El nombre del export nombrado es la version PascalCase del nombre del archivo, eliminando el nivel:

| Archivo | Export |
|---------|--------|
| `q1-button.tsx` | `Q1Button` |
| `q2-badge.tsx` | `Q2Badge` |
| `q3-stat-card.tsx` | `Q3StatCard` |
| `q4-login-form.tsx` | `Q4LoginForm` |
| `q5-protected-route.tsx` | `Q5ProtectedRoute` |
| `pa-login.tsx` | `PaLogin` |
| `pa-dashboard.tsx` | `PaDashboard` |
| `auth.repository.ts` | `AuthRepository` |
| `auth.service.ts` | `AuthService` |
| `auth.store.ts` | `useAuthStore` |
| `use-login-mutation.ts` | `useLoginMutation` |
| `use-stats-query.ts` | `useStatsQuery` |
| `login.schema.ts` | `loginSchema` + `LoginFormValues` |
| `auth.handlers.ts` | `authHandlers` |

---

## Casing en Rutas de Archivo

- Archivos: `kebab-case` siempre (`q1-loading-spinner.tsx`, `auth-status.enum.ts`)
- Carpetas: `kebab-case` siempre (`q1-loading-spinner/`, `auth-status/`)
- Variables y funciones: `camelCase` o `PascalCase` segun sea funcion/clase o variable
- Constantes de objeto: `PascalCase` (ej: `AuthRepository`, `AuthService`)
- Hooks: `camelCase` con prefijo `use` (ej: `useLoginMutation`)
