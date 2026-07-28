# Architecture Decision Records (ADRs)

7 decisiones de arquitectura del proyecto matchclass.

---

## ADR-001: Arquitectura NDK en 4 Capas

**Estado:** Accepted
**Fecha:** Inicio del proyecto

### Contexto

Los proyectos React crecen rapidamente en complejidad. Sin una estructura clara, el codigo tiende a mezclarse: componentes que llaman HTTP directamente, logica de negocio en JSX, tipos duplicados en multiples archivos. Equipos grandes generan conflictos frecuentes cuando no hay separacion de responsabilidades.

### Decision

Adoptar la arquitectura NDK (Nuestro Diseño de Conocimiento) de 4 capas con flujo unidireccional:

```
modules → library → global → resources
```

Reglas de dependencia estrictas:
- `resources` no importa nada
- `global` solo importa de `resources`
- `library` importa de `global` y `resources`
- `modules` importa de `library`, `global` y `resources`

### Consecuencias

**Positivas:**
- Bajo acoplamiento: cambios en `library` no rompen `global` ni `resources`.
- Testeable por capas: cada capa puede testearse en aislamiento.
- Escalable: agregar un modulo no afecta otros modulos.
- Equipos paralelos: diferentes equipos pueden trabajar en capas distintas.
- Auditable: las reglas de dependencia pueden verificarse con ESLint (`eslint-plugin-boundaries`).

**Negativas:**
- Mayor ceremonia inicial al crear un feature (hay que crear archivos en varias capas).
- Requiere que todo el equipo conozca las reglas de dependencia.
- Overhead de carpetas para features simples.

---

## ADR-002: Atomic Design Extendido (q1-q5 + pa)

**Estado:** Accepted
**Fecha:** Inicio del proyecto

### Contexto

Atomic Design clasico (atoms, molecules, organisms, templates, pages) usa nombres largos que no mapean bien a un sistema de prefijos en archivos y carpetas. Los terminos "atom" vs "molecule" no son obvios cuando se leen listas de archivos. Ademas, el nivel de complejidad de un componente debe ser visible en el nombre del archivo.

### Decision

Reemplazar los niveles de Atomic Design con prefijos numericos cortos que forman parte del nombre de archivo y carpeta:

| Prefijo | Equivalente | Descripcion |
|---------|-------------|-------------|
| q1 | atom | Componente minimo, sin dependencias de negocio |
| q2 | molecule | Composicion de 2-3 q1 |
| q3 | cell | Unidad funcional con estado local |
| q4 | organism | Bloque complejo con logica de negocio |
| q5 | ecosystem | Flujo completo o layout/guard |
| pa | page | Vista directamente enrutable |

El prefijo es parte del nombre del archivo: `q4-login-form/q4-login-form.tsx`.

### Consecuencias

**Positivas:**
- El nivel de complejidad es visible directamente en el nombre del archivo en cualquier explorador de archivos.
- Consistencia total en el codebase: todos los componentes siguen el mismo patron.
- Facilita la revision de PRs: un q1 no deberia tener logica de negocio — es trivial verificarlo.
- Los nuevos integrantes aprenden rapidamente donde buscar o crear componentes.

**Negativas:**
- Nomenclatura propia no estandar — los nuevos deben aprenderla.
- La frontera entre q3/q4 puede ser subjetiva en casos limites.

---

## ADR-003: Vitest Embebido en vite.config.ts

**Estado:** Accepted
**Fecha:** Inicio del proyecto

### Contexto

Proyectos que usan Jest + Babel + Vite tienen doble configuracion de transpilacion, lo que genera conflictos, lentitud y configuracion compleja. Los path aliases de Vite no funcionan automaticamente en Jest sin configuracion adicional.

### Decision

Configurar Vitest directamente en `vite.config.ts` usando el bloque `test:`:

```ts
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

Elimina completamente Jest, Babel y archivos de configuracion duplicados.

### Consecuencias

**Positivas:**
- Una sola herramienta de transpilacion (esbuild via Vite).
- Los path aliases `@global`, `@library`, etc. funcionan automaticamente en tests.
- Sin archivo `jest.config.js` ni `babel.config.js`.
- Vitest usa la misma config de TypeScript que Vite.
- Los tests son mas rapidos que con Jest.

**Negativas:**
- Vitest no es Jest — algunos mocks de Jest no funcionan directamente.
- Ecosistema ligeramente menos maduro que Jest (aunque en rapido crecimiento).

---

## ADR-004: MSW para Mocking en Desarrollo y Tests

**Estado:** Accepted
**Fecha:** Inicio del proyecto

### Contexto

Los proyectos frontend suelen depender de un backend real para desarrollar, lo que introduce latencia y acoplamiento. Los mocks con `jest.fn()` o `axios-mock-adapter` no interceptan requests reales y no documentan el contrato de la API de forma legible.

### Decision

Usar Mock Service Worker (MSW) en dos modos:

1. **Desarrollo (browser):** `src/library/mocks/browser.ts` — intercepta requests reales en el navegador via Service Worker. El desarrollador ve requests reales en DevTools.
2. **Tests (node):** `src/library/mocks/server.ts` — intercepta requests en Node via `@mswjs/interceptors`.

Los handlers se definen una vez en `src/library/mocks/handlers/` y se reutilizan en ambos modos.

### Consecuencias

**Positivas:**
- El frontend puede desarrollarse sin backend.
- Los tests son deterministicos (no dependen de red real).
- Los handlers documentan el contrato de la API de forma ejecutable.
- Un mismo handler funciona en dev, tests y Storybook.
- Las requests son reales — aparecen en DevTools Network.

**Negativas:**
- Requiere inicializar el Service Worker en `public/` (`npm run msw:init`).
- Los handlers deben mantenerse sincronizados con el backend real.

---

## ADR-005: Zustand para Estado Global

**Estado:** Accepted
**Fecha:** Inicio del proyecto

### Contexto

Redux es verboso para proyectos de tamano mediano: requiere actions, reducers, dispatchers y mucho boilerplate. Context API causa re-renders excesivos cuando el estado es frecuentemente actualizado. MobX tiene mayor curva de aprendizaje.

### Decision

Usar Zustand con stores separados por dominio:

- `global/store/auth.store.ts` — usuario autenticado, accessToken, estado de sesion.
- `global/store/ui.store.ts` — preferencias de UI (tema, estado del sidebar).
- `modules/{modulo}/core/state/` — estado local de UI del modulo (wizard, dialogo abierto).

**Regla:** Zustand solo para client state. Los datos del servidor van en TanStack Query.

### Consecuencias

**Positivas:**
- API minimalista: no hay actions, reducers ni dispatchers.
- Los stores son directamente testeables con Vitest sin providers.
- Subscripciones selectivas: `useAuthStore((s) => s.accessToken)` solo re-renderiza cuando `accessToken` cambia.
- Sin boilerplate de Redux.

**Negativas:**
- El estado se pierde al recargar la pagina (sin `localStorage` por defecto).
- Sin devtools tan maduros como Redux DevTools (aunque Zustand tiene middleware).
- El limite entre "client state" y "server state" puede ser subjetivo.

---

## ADR-006: TanStack Query para Server State

**Estado:** Accepted
**Fecha:** Inicio del proyecto

### Contexto

El estado del servidor (datos cargados de una API) tiene caracteristicas distintas al estado de UI: necesita caching, invalidacion automatica, refetch por ventana activa, y manejo de loading/error. Gestionar todo esto manualmente con `useState + useEffect` es propenso a bugs (race conditions, stale data, etc.).

### Decision

Separar completamente "server state" de "client state":
- **TanStack Query** para datos que vienen de la API: queries y mutations.
- **Zustand** para estado de UI y sesion (ver ADR-005).

Infraestructura compartida en `library/query/`:
- `query-client.ts` — `QueryClient` configurado con opciones por defecto.
- `query-keys.ts` — registro central de query keys.

Hooks especificos por modulo en `modules/{modulo}/core/hooks/`.

### Consecuencias

**Positivas:**
- Caching automatico de queries con `staleTime` configurable.
- Invalidacion precisa por query key tras mutations.
- Loading y error states sin boilerplate de `useState`.
- Deduplicacion automatica de requests identicos.
- Integracion con React DevTools via TanStack Query DevTools.

**Negativas:**
- Curva de aprendizaje del sistema de query keys y invalidacion.
- No usar para client state (tentacion de reemplazar Zustand).
- Requiere `QueryClientProvider` en el arbol de componentes.

---

## ADR-007: Zod como Fuente de Verdad para Tipos y Validacion

**Estado:** Accepted
**Fecha:** Inicio del proyecto

### Contexto

Tener tipos TypeScript y validacion de formularios por separado introduce duplicacion: el tipo `LoginFormValues` y la validacion del formulario definen exactamente lo mismo dos veces. Cuando la validacion cambia, hay que actualizar el tipo manualmente. Con React Hook Form, integrar validacion requiere un resolver.

### Decision

Usar Zod schemas como fuente de verdad unica:

```ts
// modules/authentication/core/schemas/login.schema.ts
export const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contrasena es obligatoria'),
});

// El tipo se infiere del schema — no se escribe manualmente
export type LoginFormValues = z.infer<typeof loginSchema>;
```

El schema se conecta a React Hook Form via `@hookform/resolvers/zod`.

**Ubicacion:**
- Schemas de formulario: `modules/{modulo}/core/schemas/`
- Schemas base reutilizables: `resources/schemas/`

### Consecuencias

**Positivas:**
- Una sola fuente de verdad para tipos de formulario.
- Mensajes de validacion centralizados en el schema.
- Los schemas pueden usarse en runtime para validar responses de API.
- Zod 4 tiene mejor performance y soporte JSON Schema nativo.
- TypeScript infiere los tipos automaticamente.

**Negativas:**
- Los schemas de Zod son verbosos para objetos grandes.
- Zod 4 tiene cambios de API respecto a Zod 3 (migracion necesaria si se actualiza desde proyectos anteriores).
- Overhead de runtime en validacion (minimo pero existe).
