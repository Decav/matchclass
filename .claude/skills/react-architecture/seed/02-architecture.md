# 02 — NDK React Architecture

## Visión general

La arquitectura NDK organiza el código en **5 capas concéntricas**. Las capas externas pueden importar de las internas, nunca al revés.

```
┌─────────────────────────────────────────────┐
│                  modules/                    │  ← Features de la app
│  ┌───────────────────────────────────────┐  │
│  │              global/                  │  │  ← Shared UI + stores
│  │  ┌─────────────────────────────────┐  │  │
│  │  │           library/              │  │  │  ← API, repos, servicios
│  │  │  ┌───────────────────────────┐  │  │  │
│  │  │  │       resources/          │  │  │  │  ← Tipos, schemas, enums
│  │  │  └───────────────────────────┘  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
             app/ (bootstrap, providers, router)
```

---

## Las 5 capas

### `src/app/` — Bootstrap y configuración

**Responsabilidad**: Arranque de la aplicación, configuración global de providers, router raíz.

**Contiene**:
- `App.tsx` — Componente raíz con todos los providers
- `router.tsx` — Definición del router con React Router
- Configuración de QueryClient, Sentry, PrimeReact

**Ejemplos**:
```
src/app/
  App.tsx
  router.tsx
  providers/
    query-provider.tsx
    theme-provider.tsx
```

---

### `src/resources/` — Entidades, tipos y schemas compartidos

**Responsabilidad**: Definiciones de tipos que se usan en toda la app. **Sin lógica de negocio**.

**Contiene**:
- Entidades de dominio (interfaces TypeScript)
- Enums compartidos
- Schemas de validación Zod
- Types utilitarios

**Ejemplos**:
```
src/resources/
  entities/
    product.entity.ts
    user.entity.ts
  enums/
    status.enum.ts
  schemas/
    product.schema.ts
  types/
    api.types.ts
```

---

### `src/library/` — API clients, repositorios y servicios

**Responsabilidad**: Todo lo que interactúa con el exterior (HTTP, WebSockets, storage).

**Contiene**:
- Instancia de Axios configurada
- Repositorios (funciones que llaman a la API)
- Mocks MSW para testing
- Configuración de TanStack Query

**Ejemplos**:
```
src/library/
  api/
    axios.instance.ts
    query-client.ts
  repositories/
    products.repository.ts
    users.repository.ts
  mocks/
    handlers/
      products.handlers.ts
    browser.ts
    server.ts
```

---

### `src/global/` — Componentes y hooks compartidos

**Responsabilidad**: Componentes UI reutilizables entre múltiples módulos. Stores Zustand globales.

**Contiene**:
- Componentes de layout (q3–q4)
- Atoms y molecules reutilizables (q1–q2)
- Hooks compartidos
- Stores Zustand globales (sesión, UI state)

**Ejemplos**:
```
src/global/
  components/
    q1-button/
    q2-data-card/
    q3-header/
    q4-dashboard-layout/
  hooks/
    use-debounce.ts
    use-local-storage.ts
  stores/
    auth.store.ts
    ui.store.ts
```

---

### `src/modules/` — Features de la aplicación

**Responsabilidad**: Cada módulo implementa una feature completa y autocontenida.

**Contiene**:
- Componentes específicos del módulo (q5 pages)
- Hooks de TanStack Query del módulo
- Stores locales (solo si el estado no es global)
- Rutas del módulo
- Schemas de validación del módulo

**Estructura interna de un módulo**:
```
src/modules/products/
  components/
    q5-products-page/
    q4-product-list-template/
    q3-product-table/
    q2-product-card/
  core/
    hooks/
      use-products-query.ts
      use-create-product.ts
    schemas/
      product-form.schema.ts
    state/
      product-filters.store.ts
  routes/
    products.routes.tsx
  index.ts
```

---

## Reglas de dependencia

| Capa | Puede importar de | NO puede importar de |
|------|-------------------|----------------------|
| `app/` | todas | — |
| `modules/` | `global/`, `library/`, `resources/` | `app/`, otros `modules/` directamente |
| `global/` | `library/`, `resources/` | `app/`, `modules/` |
| `library/` | `resources/` | `app/`, `global/`, `modules/` |
| `resources/` | — (solo tipos externos) | ninguna capa interna |

---

## Flujo de datos

```
User Action
    │
    ▼
Module Component (q5 page)
    │ useQuery / useMutation (TanStack Query)
    ▼
Repository (library/)
    │ axios instance
    ▼
API / Backend
    │
    ▼
Repository (transforma respuesta → entidad)
    │
    ▼
TanStack Query cache
    │
    ▼
Component re-render
```

---

## Anti-patterns a evitar

| Anti-pattern | Solución correcta |
|--------------|-------------------|
| Llamar `fetch`/`axios` directamente en un componente | Usar un repositorio en `library/` + TanStack Query hook |
| Importar de otro módulo directamente | Extraer lo compartido a `global/` o `resources/` |
| Poner lógica de negocio en un componente | Extraer a un hook o use case |
| Stores Zustand con demasiados dominios mezclados | Un store por dominio, separar UI state de domain state |
| Schemas Zod duplicados en varios módulos | Centralizar schemas compartidos en `resources/schemas/` |
| Componentes en `global/` que importan de `modules/` | `global/` es independiente de features |
