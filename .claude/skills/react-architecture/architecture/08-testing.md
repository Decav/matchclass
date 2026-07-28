## Regla Obligatoria: Tests E2E

Los tests e2e son OBLIGATORIOS en todo cambio que involucre:
- Flujos de autenticación (login, logout, persistencia de sesión tras recarga)
- Rutas protegidas (guards, redirects)
- Navegación entre páginas
- Integración con servicios externos (Firebase Auth, Firestore, Cloud Functions HTTP)
- Cualquier feature visible para el usuario final

**Herramienta:** Playwright (`e2e/` directory, config: `playwright.config.ts`)

**Cobertura mínima por feature:**
- Happy path completo (flujo exitoso end-to-end)
- Error path principal (qué pasa cuando falla)
- Estado no autenticado vs autenticado
- Redirects y guards de rutas
- CSRF/seguridad si aplica

**Convenciones:**
- Mockear APIs externas con `page.route()` — no depender del servidor real en tests
- Usar `page.evaluate()` para manipular sessionStorage/localStorage
- Usar `expect(page).toHaveURL()` en lugar de `page.waitForNavigation()` (deprecado)
- Organizar en `e2e/*.spec.ts` por módulo/feature

**No se considera una implementación completa sin tests e2e.**

---

# Estrategia de Testing

Testing por capas con herramientas especificas. Vitest integrado en vite.config.ts, Testing Library para componentes, Playwright para e2e.

---

## Tabla: Tipo de Codigo → Herramienta → Que Testear

| Tipo de Codigo | Herramienta | Archivo de Test | Que Testear |
|---------------|-------------|-----------------|-------------|
| Componente q1/q2/q3 | Vitest + Testing Library | `*.test.tsx` junto al componente | Renderizado, props, eventos de usuario, accesibilidad |
| Componente q4 (formulario) | Vitest + Testing Library + MSW | `*.test.tsx` junto al componente | Validacion de campos, submit, estados loading/error |
| Pagina pa | Vitest + Testing Library + MSW | `*.test.tsx` junto al componente | Integracion de componentes, flujo completo |
| Hook useQuery | Vitest + renderHook + MSW | `*.test.ts` junto al hook | Data, isLoading, isError con API mockeada |
| Hook useMutation | Vitest + renderHook + MSW | `*.test.ts` junto al hook | mutate, isSuccess, isError, side effects |
| Store Zustand | Vitest + renderHook | `*.test.ts` junto al store | Estado inicial, acciones, estado resultante |
| Schema Zod | Vitest | `*.test.ts` junto al schema | Validaciones validas, invalidas, mensajes de error |
| Repository | Vitest + MSW | `*.test.ts` junto al repositorio | Llamadas correctas, retorno de data |
| Service | Vitest + spy/mock | `*.test.ts` junto al servicio | Delegacion correcta al repositorio |
| E2E flujo critico | Playwright | `e2e/{flujo}/{nombre}.spec.ts` | Flujos de usuario reales en browser real |

---

## Cobertura por Capa

| Capa | Objetivo | Tipo de Test |
|------|----------|-------------|
| `resources` | 100% | Unit: validar que schemas Zod aceptan/rechazan correctamente |
| `global` | 80%+ | Unit de stores, Unit + Integration de componentes |
| `library` | 70%+ | Unit de services/repositories con MSW |
| `modules` | 60%+ | Integration de hooks, Integration de formularios q4 |

```bash
npm run test:coverage   # genera reporte HTML en coverage/
```

---

## Setup de Tests

**`src/test/setup.ts`** configura:
- `@testing-library/jest-dom` — matchers adicionales
- MSW server para interceptar requests en tests de integracion

---

## Snippets por Tipo de Test

### 1. Unit Test de Componente React (Testing Library)

**Real del proyecto:** `src/global/components/q1-button/q1-button.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Q1Button } from './q1-button';

describe('Q1Button', () => {
  it('renders label', () => {
    render(<Q1Button label="Hola" />);
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Q1Button label="Click" onClick={onClick} />);
    await userEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when loading', () => {
    render(<Q1Button label="Loading" loading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Principio:** testea comportamiento visible, no implementacion interna.

---

### 2. Unit Test de Schema Zod

**Real del proyecto:** `src/modules/authentication/core/schemas/login.schema.test.ts` (patron)

```ts
import { loginSchema } from './login.schema';

describe('loginSchema', () => {
  it('acepta credenciales validas', () => {
    const result = loginSchema.safeParse({ username: 'admin', password: 'admin123' });
    expect(result.success).toBe(true);
  });

  it('rechaza username vacio', () => {
    const result = loginSchema.safeParse({ username: '', password: 'admin123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('El usuario es obligatorio');
  });

  it('rechaza password vacia', () => {
    const result = loginSchema.safeParse({ username: 'admin', password: '' });
    expect(result.success).toBe(false);
  });
});
```

---

### 3. Unit Test de Store Zustand

**Real del proyecto:** `src/global/store/auth.store.test.ts`

```ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';

const mockAuthResponse = {
  accessToken: 'token-123',
  refreshToken: 'refresh-123',
  user: { id: '1', username: 'admin', email: 'admin@test.com', roles: ['admin'] },
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, status: AuthStatus.Unauthenticated });
  });

  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.status).toBe(AuthStatus.Unauthenticated);
    expect(result.current.user).toBeNull();
  });

  it('login sets user and token', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.login(mockAuthResponse));
    expect(result.current.status).toBe(AuthStatus.Authenticated);
    expect(result.current.user?.username).toBe('admin');
  });

  it('logout clears state', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.login(mockAuthResponse));
    act(() => result.current.logout());
    expect(result.current.status).toBe(AuthStatus.Unauthenticated);
    expect(result.current.user).toBeNull();
  });
});
```

---

### 4. Test de Hook con renderHook y MSW

**Real del proyecto:** `src/modules/authentication/core/hooks/use-login-mutation.test.ts`

```ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createElement } from 'react';
import { useLoginMutation } from './use-login-mutation';
import { server } from '@library/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc },
    createElement(MemoryRouter, null, children)
  );
}

describe('useLoginMutation', () => {
  it('succeeds with valid credentials', async () => {
    const { result } = renderHook(() => useLoginMutation(), { wrapper });
    result.current.mutate({ username: 'admin', password: 'admin123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fails with invalid credentials', async () => {
    const { result } = renderHook(() => useLoginMutation(), { wrapper });
    result.current.mutate({ username: 'wrong', password: 'wrong' });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

---

### 5. Test de Componente q4 con MSW (Integration)

**Real del proyecto:** `src/modules/authentication/components/q4-login-form/q4-login-form.test.tsx`

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Q4LoginForm } from './q4-login-form';
import { server } from '@library/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Q4LoginForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Q4LoginForm', () => {
  it('renders username and password fields', () => {
    renderForm();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    await waitFor(() => {
      expect(screen.getByText(/usuario es obligatorio/i)).toBeInTheDocument();
    });
  });

  it('submits with valid credentials', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/usuario/i), 'admin');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'admin123');
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    await waitFor(() => {
      expect(screen.queryByText(/credenciales inválidas/i)).not.toBeInTheDocument();
    });
  });
});
```

---

### 6. Test con Override de MSW Handler

Para testear estados de error especificos, se puede sobreescribir un handler para un test puntual:

```tsx
import { server } from '@library/mocks/server';
import { http, HttpResponse } from 'msw';

it('muestra error con credenciales invalidas', async () => {
  server.use(
    http.post('/api/auth/login', () =>
      HttpResponse.json({ message: 'No autorizado' }, { status: 401 })
    )
  );
  renderForm();
  await userEvent.type(screen.getByLabelText(/usuario/i), 'cualquiera');
  await userEvent.type(screen.getByLabelText(/contraseña/i), 'cualquiera');
  await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));
  await waitFor(() => {
    expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
  });
});
```

---

### 7. Test E2E con Playwright

**Ruta:** `e2e/auth/login.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('login con credenciales validas redirige al dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/usuario/i).fill('admin');
  await page.getByLabel(/contraseña/i).fill('admin123');
  await page.getByRole('button', { name: /ingresar/i }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText(/dashboard/i)).toBeVisible();
});

test('login con credenciales invalidas muestra error', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/usuario/i).fill('wrong');
  await page.getByLabel(/contraseña/i).fill('wrong');
  await page.getByRole('button', { name: /ingresar/i }).click();

  await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
  await expect(page).toHaveURL('/login');
});
```

---

## Configuracion de Vitest (en vite.config.ts)

```ts
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
    exclude: ['src/test/**', 'src/**/*.stories.tsx', 'src/app/main.tsx'],
  },
},
```

**Beneficio clave:** los path aliases `@global`, `@library`, etc. funcionan automaticamente en tests sin configuracion adicional.
