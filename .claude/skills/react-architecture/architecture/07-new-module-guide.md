# Guia: Crear un Modulo Nuevo (14 Pasos)

Guia ejecutable para agregar un modulo completo. Ejemplo: modulo `perfil` con entidad `Profile`.

---

## Paso 1: Crear la Estructura de Carpetas

```bash
mkdir -p src/modules/perfil/components
mkdir -p src/modules/perfil/core/hooks
mkdir -p src/modules/perfil/core/schemas
mkdir -p src/modules/perfil/core/state
mkdir -p src/modules/perfil/routes
```

**Resultado esperado:**
```
src/modules/perfil/
├── components/
├── core/
│   ├── hooks/
│   ├── schemas/
│   └── state/
└── routes/
```

---

## Paso 2: Definir Types/Interfaces en resources

**Ruta:** `src/resources/entities/profile.entity.ts`

```ts
export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}
```

**Ruta:** `src/resources/requests/profile.request.ts`

```ts
export interface UpdateProfileRequest {
  displayName: string;
  bio: string;
}
```

**Ruta:** `src/resources/responses/profile.response.ts`

```ts
import type { Profile } from '../entities/profile.entity';

export interface ProfileResponse {
  profile: Profile;
}
```

**Resultado esperado:** tipos disponibles en toda la app via `@resources`.

---

## Paso 3: Crear Schema Zod

**Ruta:** `src/modules/perfil/core/schemas/update-profile.schema.ts`

```ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'El nombre es obligatorio').max(50, 'Maximo 50 caracteres'),
  bio: z.string().max(200, 'Maximo 200 caracteres'),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
```

**Barrel:** `src/modules/perfil/core/schemas/index.ts`

```ts
export { updateProfileSchema, type UpdateProfileFormValues } from './update-profile.schema';
```

---

## Paso 4: Crear Repository

**Ruta:** `src/library/repositories/perfil.repository.ts`

```ts
import { api } from '@library/api/client/api-instance';
import type { UpdateProfileRequest } from '@resources/requests/profile.request';
import type { Profile } from '@resources/entities/profile.entity';

export const PerfilRepository = {
  getProfile: () =>
    api.get<Profile>('/api/perfil/me').then((r) => r.data),
  updateProfile: (data: UpdateProfileRequest) =>
    api.put<Profile>('/api/perfil/me', data).then((r) => r.data),
};
```

---

## Paso 5: Crear Service

**Ruta:** `src/library/services/perfil.service.ts`

```ts
import { PerfilRepository } from '@library/repositories/perfil.repository';
import type { UpdateProfileRequest } from '@resources/requests/profile.request';

export const PerfilService = {
  getProfile: () => PerfilRepository.getProfile(),
  updateProfile: (data: UpdateProfileRequest) => PerfilRepository.updateProfile(data),
};
```

---

## Paso 6: Crear Query Hook

**Ruta:** `src/modules/perfil/core/hooks/use-perfil-query.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { PerfilService } from '@library/services/perfil.service';

export function usePerfilQuery() {
  return useQuery({
    queryKey: ['perfil', 'me'],
    queryFn: PerfilService.getProfile,
    staleTime: 60_000,
  });
}
```

---

## Paso 7: Crear Mutation Hook

**Ruta:** `src/modules/perfil/core/hooks/use-update-perfil-mutation.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PerfilService } from '@library/services/perfil.service';

export function useUpdatePerfilMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PerfilService.updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['perfil', 'me'] });
    },
  });
}
```

**Barrel:** `src/modules/perfil/core/hooks/index.ts`

```ts
export { usePerfilQuery } from './use-perfil-query';
export { useUpdatePerfilMutation } from './use-update-perfil-mutation';
```

---

## Paso 8: Crear Componentes Atomicos (q1-q3)

Si el modulo necesita componentes muy especificos, los q1-q3 van en `global/components/`. Los q2-q3 especificos del modulo pueden ir en `modules/perfil/components/`.

**Ruta:** `src/modules/perfil/components/q2-avatar-upload/q2-avatar-upload.tsx`

```tsx
interface Q2AvatarUploadProps {
  avatarUrl: string | null;
  onUpload: (file: File) => void;
}

export function Q2AvatarUpload({ avatarUrl, onUpload }: Q2AvatarUploadProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full" /> : <div className="w-20 h-20 rounded-full bg-gray-200" />}
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
    </div>
  );
}
```

**Barrel:** `src/modules/perfil/components/q2-avatar-upload/index.ts`

```ts
export { Q2AvatarUpload } from './q2-avatar-upload';
```

---

## Paso 9: Crear Componente q4 (con Logica y Formulario)

**Ruta:** `src/modules/perfil/components/q4-edit-profile-form/q4-edit-profile-form.tsx`

```tsx
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { updateProfileSchema, type UpdateProfileFormValues } from '../../core/schemas/update-profile.schema';
import { useUpdatePerfilMutation } from '../../core/hooks/use-update-perfil-mutation';

export function Q4EditProfileForm() {
  const { mutate: updateProfile, isPending } = useUpdatePerfilMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { displayName: '', bio: '' },
  });

  const onSubmit = (data: UpdateProfileFormValues) => updateProfile(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="displayName"
        control={control}
        render={({ field }) => (
          <div>
            <label htmlFor="displayName">Nombre</label>
            <input id="displayName" {...field} />
            {errors.displayName && <p className="text-red-500">{errors.displayName.message}</p>}
          </div>
        )}
      />
      <Button type="submit" label={isPending ? 'Guardando...' : 'Guardar'} disabled={isPending} />
    </form>
  );
}
```

---

## Paso 10: Crear Pagina pa (Ensambladora)

**Ruta:** `src/modules/perfil/components/pa-perfil/pa-perfil.tsx`

```tsx
import { Q4EditProfileForm } from '../q4-edit-profile-form/q4-edit-profile-form';

export function PaPerfil() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      <Q4EditProfileForm />
    </main>
  );
}
```

**Barrel:** `src/modules/perfil/components/pa-perfil/index.ts`

```ts
export { PaPerfil } from './pa-perfil';
```

---

## Paso 11: Crear Store Zustand (si aplica)

Solo si el modulo necesita estado local de UI (wizard, tabs, dialogo abierto).

**Ruta:** `src/modules/perfil/core/state/perfil-ui.store.ts`

```ts
import { create } from 'zustand';

interface PerfilUiState {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
}

export const usePerfilUiStore = create<PerfilUiState>((set) => ({
  editMode: false,
  setEditMode: (value) => set({ editMode: value }),
}));
```

---

## Paso 12: Crear MSW Handlers para Tests

**Ruta:** `src/library/mocks/handlers/perfil.handlers.ts`

```ts
import { http, HttpResponse } from 'msw';
import type { Profile } from '@resources/entities/profile.entity';

const mockProfile: Profile = {
  id: '1',
  userId: '1',
  displayName: 'Admin',
  bio: 'Administrador del sistema',
  avatarUrl: null,
};

export const perfilHandlers = [
  http.get('/api/perfil/me', () => HttpResponse.json(mockProfile)),
  http.put('/api/perfil/me', async ({ request }) => {
    const body = await request.json() as Partial<Profile>;
    return HttpResponse.json({ ...mockProfile, ...body });
  }),
];
```

**Registrar en** `src/library/mocks/handlers/index.ts`:

```ts
import { authHandlers } from './auth.handlers';
import { perfilHandlers } from './perfil.handlers';

export const handlers = [...authHandlers, ...perfilHandlers];
```

---

## Paso 13: Registrar en Router

**Ruta:** `src/modules/perfil/routes/perfil.routes.tsx`

```tsx
import { RouteObject } from 'react-router-dom';
import { PaPerfil } from '../components/pa-perfil/pa-perfil';

export const perfilRoutes: RouteObject[] = [
  {
    path: '/perfil',
    element: <PaPerfil />,
  },
];
```

**Actualizar** `src/app/router/app-router.tsx`:

```tsx
import { perfilRoutes } from '@modules/perfil';

export const router = createBrowserRouter([
  ...authenticationRoutes,
  {
    element: <Q5ProtectedRoute />,
    children: [
      ...homeRoutes.filter((r) => r.path === '/dashboard'),
      ...perfilRoutes,  // Agregar aqui dentro de la ruta protegida
    ],
  },
  homeRoutes.find((r) => r.path === '/')!,
]);
```

---

## Paso 14: Crear Barrel index.ts del Modulo

**Ruta:** `src/modules/perfil/index.ts`

```ts
export { perfilRoutes } from './routes/perfil.routes';
export { PaPerfil } from './components/pa-perfil/pa-perfil';
```

**Verificacion final:**

```bash
# Verificar que TypeScript compila sin errores
npx tsc --noEmit

# Ejecutar tests
npm run test

# Verificar en dev
npm run dev
# Navegar a http://localhost:5173/perfil (con sesion activa)
```

---

## Resumen de Archivos Creados

| Paso | Archivo | Capa |
|------|---------|------|
| 1 | Estructura de carpetas | modules |
| 2 | `resources/entities/profile.entity.ts` | resources |
| 2 | `resources/requests/profile.request.ts` | resources |
| 2 | `resources/responses/profile.response.ts` | resources |
| 3 | `modules/perfil/core/schemas/update-profile.schema.ts` | modules |
| 4 | `library/repositories/perfil.repository.ts` | library |
| 5 | `library/services/perfil.service.ts` | library |
| 6 | `modules/perfil/core/hooks/use-perfil-query.ts` | modules |
| 7 | `modules/perfil/core/hooks/use-update-perfil-mutation.ts` | modules |
| 8 | `modules/perfil/components/q2-avatar-upload/q2-avatar-upload.tsx` | modules |
| 9 | `modules/perfil/components/q4-edit-profile-form/q4-edit-profile-form.tsx` | modules |
| 10 | `modules/perfil/components/pa-perfil/pa-perfil.tsx` | modules |
| 11 | `modules/perfil/core/state/perfil-ui.store.ts` | modules |
| 12 | `library/mocks/handlers/perfil.handlers.ts` | library |
| 13 | `modules/perfil/routes/perfil.routes.tsx` | modules |
| 14 | `modules/perfil/index.ts` | modules |
