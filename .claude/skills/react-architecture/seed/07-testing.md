# 07 — Estrategia de Testing

## Visión general

| Capa | Herramienta | Qué testear | Cuándo |
|------|-------------|-------------|--------|
| Unit | Vitest | Stores, hooks puros, schemas, utils | Siempre |
| Integration | Vitest + Testing Library + MSW | Componentes con queries/mutations | Siempre para componentes con side effects |
| E2E | Playwright | Flujos críticos del usuario | Flujos de negocio clave |

**Coverage target**: > 90% en unit + integration.

---

## Setup inicial

### `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

### `src/test/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from '../library/mocks/handlers';

export const server = setupServer(...handlers);
```

### `src/test/render.tsx` (helper de render con providers)

```typescript
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import type { ReactNode } from 'react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface TestWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
}

function TestWrapper({ children, initialEntries = ['/'] }: TestWrapperProps) {
  const queryClient = createTestQueryClient();
  return (
    <PrimeReactProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </PrimeReactProvider>
  );
}

export function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] }
) {
  const { initialEntries, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper initialEntries={initialEntries}>{children}</TestWrapper>
    ),
    ...renderOptions,
  });
}
```

---

## Tests unitarios (Vitest)

### Cuándo usar

- Stores Zustand
- Schemas Zod
- Funciones utilitarias
- Hooks sin side effects externos

### Ejemplo: test de Zustand store

```typescript
// src/global/stores/auth.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Resetear el store entre tests
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('starts with no user', () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('sets user on setUser', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', roles: ['user'] };
    useAuthStore.getState().setUser(mockUser);

    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(isAuthenticated).toBe(true);
  });

  it('clears user on clearUser', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', roles: ['user'] };
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });

    useAuthStore.getState().clearUser();

    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });
});
```

### Ejemplo: test de schema Zod

```typescript
// src/modules/items/core/schemas/create-item.schema.test.ts
import { describe, it, expect } from 'vitest';
import { createItemSchema } from './create-item.schema';

describe('createItemSchema', () => {
  it('validates a valid item', () => {
    const result = createItemSchema.safeParse({
      name: 'Test Item',
      quantity: 5,
      category: 'type-a',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createItemSchema.safeParse({
      name: '',
      quantity: 5,
      category: 'type-a',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name');
    }
  });

  it('rejects negative quantity', () => {
    const result = createItemSchema.safeParse({
      name: 'Test',
      quantity: -1,
      category: 'type-a',
    });
    expect(result.success).toBe(false);
  });
});
```

---

## Tests de integración (Testing Library + MSW)

### Cuándo usar

- Componentes que hacen fetch de datos (useQuery)
- Formularios con validación y submit
- Componentes con estados de carga/error

### Ejemplo: test de componente con useQuery

```typescript
// src/modules/items/components/q3-items-list/q3-items-list.test.tsx
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { server } from '../../../../test/server';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '../../../../test/render';
import { Q3ItemsList } from './q3-items-list';

describe('Q3ItemsList', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<Q3ItemsList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders items after fetch', async () => {
    renderWithProviders(<Q3ItemsList />);

    await waitFor(() => {
      expect(screen.getByText('Item One')).toBeInTheDocument();
      expect(screen.getByText('Item Two')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    server.use(
      http.get('/api/items', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );

    renderWithProviders(<Q3ItemsList />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Ejemplo: test de formulario

```typescript
// src/modules/items/components/q3-create-item-form/q3-create-item-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../../test/render';
import { Q3CreateItemForm } from './q3-create-item-form';

describe('Q3CreateItemForm', () => {
  it('shows validation error for empty name', async () => {
    renderWithProviders(<Q3CreateItemForm onSuccess={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess after successful submit', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(<Q3CreateItemForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByPlaceholderText(/nombre/i), 'New Item');
    await userEvent.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });
});
```

---

## Tests E2E (Playwright)

### Cuándo usar

- Flujos de autenticación completos
- Flujos críticos de negocio (crear, editar, eliminar)
- Navegación entre páginas
- NO para cada variante de UI — eso va en unit/integration

### Configuración (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Ejemplo: test e2e

```typescript
// e2e/items.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Items management', () => {
  test.beforeEach(async ({ page }) => {
    // Asumiendo que hay un mock de sesión o usuario de test
    await page.goto('/items');
  });

  test('shows the items list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /items/i })).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount.greaterThan(1);
  });

  test('creates a new item', async ({ page }) => {
    await page.getByRole('button', { name: /nuevo item/i }).click();

    await page.getByLabel(/nombre/i).fill('E2E Test Item');
    await page.getByRole('button', { name: /guardar/i }).click();

    await expect(page.getByText('E2E Test Item')).toBeVisible();
  });
});
```

---

## Comandos

```bash
# Unit + Integration
npm run test              # watch mode
npm run test:coverage     # con reporte de cobertura

# E2E
npm run test:e2e          # headless
npm run test:e2e:ui       # con UI de Playwright

# Solo un archivo
npx vitest run src/global/stores/auth.store.test.ts
```

---

## Guía de selección de capa de test

| Escenario | Capa recomendada |
|-----------|-----------------|
| Función utilitaria pura | Unit (Vitest) |
| Schema de validación Zod | Unit (Vitest) |
| Zustand store | Unit (Vitest) |
| Componente sin side effects | Unit (Vitest + Testing Library) |
| Componente con useQuery | Integration (Testing Library + MSW) |
| Formulario con validación | Integration (Testing Library) |
| Flujo de autenticación | E2E (Playwright) |
| CRUD completo de entidad | E2E (Playwright) |
| Navegación entre páginas | E2E (Playwright) |
