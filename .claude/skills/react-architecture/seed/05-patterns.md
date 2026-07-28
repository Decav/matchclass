# 05 — Patrones de desarrollo

Patrones genéricos listos para copiar y renombrar. Ningún snippet importa desde paths específicos del proyecto.

---

## Repository Pattern

Los repositorios encapsulan la lógica de acceso a datos. Viven en `src/library/repositories/`.

```typescript
// src/library/repositories/items.repository.ts
import { apiClient } from '../api/axios.instance';
import type { Item, CreateItemDto, UpdateItemDto } from '@resources/entities/item.entity';

export const itemsRepository = {
  async findAll(): Promise<Item[]> {
    const { data } = await apiClient.get<Item[]>('/items');
    return data;
  },

  async findById(id: string): Promise<Item> {
    const { data } = await apiClient.get<Item>(`/items/${id}`);
    return data;
  },

  async create(dto: CreateItemDto): Promise<Item> {
    const { data } = await apiClient.post<Item>('/items', dto);
    return data;
  },

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    const { data } = await apiClient.patch<Item>(`/items/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/items/${id}`);
  },
};
```

---

## useQuery Hook Pattern

Los hooks de TanStack Query viven en `src/modules/{feature}/core/hooks/`.

```typescript
// src/modules/items/core/hooks/use-items-query.ts
import { useQuery } from '@tanstack/react-query';
import { itemsRepository } from '@library/repositories/items.repository';

export const itemsQueryKeys = {
  all: ['items'] as const,
  detail: (id: string) => ['items', id] as const,
};

export function useItemsQuery() {
  return useQuery({
    queryKey: itemsQueryKeys.all,
    queryFn: () => itemsRepository.findAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useItemQuery(id: string) {
  return useQuery({
    queryKey: itemsQueryKeys.detail(id),
    queryFn: () => itemsRepository.findById(id),
    enabled: Boolean(id),
  });
}
```

---

## useMutation Hook Pattern

```typescript
// src/modules/items/core/hooks/use-create-item.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsRepository } from '@library/repositories/items.repository';
import { itemsQueryKeys } from './use-items-query';
import type { CreateItemDto } from '@resources/entities/item.entity';

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateItemDto) => itemsRepository.create(dto),
    onSuccess: () => {
      // Invalida y refetch la lista
      queryClient.invalidateQueries({ queryKey: itemsQueryKeys.all });
    },
    // onError: no usar console.error. Los errores los captura el interceptor Axios
    // o Sentry automáticamente. El componente consume isError para mostrar feedback.
  });
}
```

---

## Zustand Store Pattern

Los stores globales viven en `src/global/stores/`. Los locales de módulo en `src/modules/{feature}/core/state/`.

```typescript
// src/global/stores/auth.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: true }, false, 'auth/setUser'),

      clearUser: () =>
        set({ user: null, isAuthenticated: false }, false, 'auth/clearUser'),
    }),
    { name: 'AuthStore' }
  )
);

// Selector para evitar re-renders innecesarios
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
```

---

## Protected Route Pattern

```typescript
// src/app/router/protected-route.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated } from '@global/stores/auth.store';

interface ProtectedRouteProps {
  redirectTo?: string;
  requiredRoles?: string[];
}

export function ProtectedRoute({
  redirectTo = '/login',
  requiredRoles = [],
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
```

---

## HTTP Error Interceptor Pattern

```typescript
// src/library/api/axios.instance.ts
import axios from 'axios';
import type { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado o no válido → redirigir a login
      window.location.href = '/login';
    }

    // 403 NO redirige — el usuario sigue autenticado pero sin permiso para ese recurso.
    // El componente consumidor usa useHttpError(error) + <Q2Forbidden /> inline.
    // Ver: architecture/11-http-error-handling.md

    return Promise.reject(error);
  }
);
```

---

## MSW Handler Pattern

Los handlers viven en `src/library/mocks/handlers/`.

```typescript
// src/library/mocks/handlers/items.handlers.ts
import { http, HttpResponse } from 'msw';
import type { Item } from '@resources/entities/item.entity';

const mockItems: Item[] = [
  { id: '1', name: 'Item One', status: 'active' },
  { id: '2', name: 'Item Two', status: 'inactive' },
];

export const itemHandlers = [
  http.get('/api/items', () => {
    return HttpResponse.json(mockItems);
  }),

  http.get('/api/items/:id', ({ params }) => {
    const item = mockItems.find((i) => i.id === params.id);
    if (!item) {
      return HttpResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    return HttpResponse.json(item);
  }),

  http.post('/api/items', async ({ request }) => {
    const body = await request.json() as Omit<Item, 'id'>;
    const newItem: Item = { id: String(Date.now()), ...body };
    mockItems.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),
];
```

---

## Axios Instance Factory Pattern

Para proyectos con múltiples APIs:

```typescript
// src/library/api/create-api-client.ts
import axios from 'axios';

interface ApiClientOptions {
  baseURL: string;
  withCredentials?: boolean;
  timeout?: number;
}

export function createApiClient(options: ApiClientOptions) {
  const client = axios.create({
    baseURL: options.baseURL,
    withCredentials: options.withCredentials ?? true,
    timeout: options.timeout ?? 30_000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Logging centralizado
      console.error('[API Error]', error.response?.status, error.config?.url);
      return Promise.reject(error);
    }
  );

  return client;
}

export const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

---

## Zod Schema + React Hook Form Pattern

```typescript
// src/modules/items/core/schemas/create-item.schema.ts
import { z } from 'zod';

export const createItemSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  description: z.string().optional(),
  quantity: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .int()
    .min(0, 'Debe ser 0 o mayor'),
  category: z.enum(['type-a', 'type-b', 'type-c'], {
    errorMap: () => ({ message: 'Categoría inválida' }),
  }),
});

export type CreateItemFormData = z.infer<typeof createItemSchema>;
```

```typescript
// Uso en componente
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createItemSchema, type CreateItemFormData } from '../core/schemas/create-item.schema';

export function CreateItemForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      quantity: 0,
    },
  });

  const onSubmit = async (data: CreateItemFormData) => {
    // llamar al mutation hook
    console.log(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Nombre" />
      {errors.name && <p>{errors.name.message}</p>}

      <input
        type="number"
        {...register('quantity', { valueAsNumber: true })}
      />
      {errors.quantity && <p>{errors.quantity.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Crear'}
      </button>
    </form>
  );
}
```
