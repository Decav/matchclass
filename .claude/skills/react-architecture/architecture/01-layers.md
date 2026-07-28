# Capas NDK — Arquitectura en 4 Capas

La arquitectura NDK React divide el codigo en 4 capas con dependencias estrictamente unidireccionales:

```
modules  →  library  →  global  →  resources
```

Cada capa solo puede importar de capas situadas a su derecha (capas inferiores).

---

## Capa 1: resources

### Definicion
Capa base del sistema. Define contratos, modelos y tipos puros. Es la fuente de verdad de la forma de los datos. No contiene logica de ningun tipo.

### Ruta en el proyecto
`src/resources/`

### Alias de path
`@resources` → `src/resources/`

### Contenido

| Subcarpeta | Proposito |
|------------|-----------|
| `entities/` | Interfaces de entidades de dominio (`User`) |
| `requests/` | Tipos de request HTTP (`LoginRequest`) |
| `responses/` | Tipos de response HTTP (`AuthResponse`) |
| `enums/` | Enumeraciones (`AuthStatus`) |
| `errors/` | Tipos de error personalizados de dominio |
| `schemas/` | Schemas Zod base muy puros (reutilizables entre capas) |
| `types/` | Tipos utilitarios de TypeScript |

### Reglas de importacion

- **Puede importar de:** nada (cero dependencias externas al proyecto)
- **No puede importar de:** `@global`, `@library`, `@modules`, ni ninguna libreria con efectos de lado
- Solo TypeScript puro y Zod permitidos

### Ejemplo real

```ts
// src/resources/entities/user.entity.ts
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

// src/resources/requests/auth.request.ts
export interface LoginRequest {
  username: string;
  password: string;
}

// src/resources/responses/auth.response.ts
import type { User } from '../entities/user.entity';
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// src/resources/enums/auth-status.enum.ts
export enum AuthStatus {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}
```

---

## Capa 2: global

### Definicion
Componentes UI, hooks, utilidades y estado global reutilizables en toda la aplicacion. No conoce la logica de ningun modulo de negocio ni la API.

### Ruta en el proyecto
`src/global/`

### Alias de path
`@global` → `src/global/`

### Contenido

| Subcarpeta | Proposito |
|------------|-----------|
| `components/` | Componentes UI clasificados por nivel atomic (q1-q5) |
| `store/` | Stores Zustand globales (auth, ui) |
| `hooks/` | Hooks utilitarios reutilizables sin logica de dominio |
| `utils/` | Funciones puras utilitarias |
| `validators/` | Validadores reutilizables |
| `constants/` | Constantes globales de la aplicacion |

### Reglas de importacion

- **Puede importar de:** `@resources`
- **No puede importar de:** `@library`, `@modules`
- Los componentes en `global/` no deben mencionar dominios de negocio ("autenticacion", "home") en su implementacion

### Ejemplo real

```ts
// src/global/store/auth.store.ts
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

## Capa 3: library

### Definicion
Integracion con servicios externos: API HTTP, repositorios de datos, mocking, observabilidad. No contiene UI. Es el puente entre la aplicacion y el mundo exterior.

### Ruta en el proyecto
`src/library/`

### Alias de path
`@library` → `src/library/`

### Contenido

| Subcarpeta | Proposito |
|------------|-----------|
| `api/client/` | Instancia Axios configurada con baseURL |
| `api/interceptors/` | Interceptores de autenticacion y manejo de errores |
| `query/` | TanStack QueryClient configurado y query keys centralizadas |
| `repositories/` | Llamadas HTTP directas, sin logica de negocio |
| `services/` | Logica de negocio sobre repositorios (puede combinar llamadas) |
| `mocks/` | MSW: browser.ts, server.ts, y handlers por dominio |
| `integrations/sentry/` | Inicializacion y configuracion de Sentry |

### Reglas de importacion

- **Puede importar de:** `@global`, `@resources`
- **No puede importar de:** `@modules`
- **No puede contener:** JSX, imports de React, componentes

### Ejemplo real

```ts
// src/library/repositories/auth.repository.ts
import { api } from '@library/api/client/api-instance';
import type { LoginRequest } from '@resources/requests/auth.request';
import type { AuthResponse } from '@resources/responses/auth.response';

export const AuthRepository = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),
  logout: () => api.post('/api/auth/logout').then((r) => r.data),
};
```

---

## Capa 4: modules

### Definicion
Contiene la logica de negocio, pantallas y rutas organizadas por dominio. Orquesta `library + global + resources` para implementar features completos. Es la capa de composicion final.

### Ruta en el proyecto
`src/modules/`

### Alias de path
`@modules` → `src/modules/`

### Contenido

Cada modulo sigue esta estructura interna fija:

| Subcarpeta | Proposito |
|------------|-----------|
| `components/` | Componentes UI del modulo: q2, q3, q4, q5, pa |
| `core/hooks/` | Hooks especificos del modulo (useQuery, useMutation) |
| `core/schemas/` | Schemas Zod del modulo (fuente de verdad de tipos de formulario) |
| `core/state/` | Stores Zustand locales al modulo (si aplica) |
| `routes/` | Definicion de rutas React Router del modulo |
| `index.ts` | Barrel export del modulo (expone rutas y componentes pa-) |

### Reglas de importacion

- **Puede importar de:** `@library`, `@global`, `@resources`
- **No puede importar de:** otros modulos en `@modules` (modulos son aislados entre si)
- **Solo exporta hacia:** `app/router` (rutas) y `app/providers`

### Ejemplo real

```ts
// src/modules/authentication/core/hooks/use-login-mutation.ts
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

## Resumen de Dependencias

```
resources  ← sin imports de otras capas
global     ← solo @resources
library    ← @global, @resources  (NO @modules)
modules    ← @library, @global, @resources
```

### Prohibiciones absolutas

```
resources → cualquier capa      ❌
global    → @library, @modules  ❌
library   → @modules            ❌
modules   → otros @modules      ❌
```
