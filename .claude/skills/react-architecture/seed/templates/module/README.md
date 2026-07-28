# Template de Módulo React

Este directorio es el scaffold de un módulo completo usando la NDK Architecture.

## Cómo usar este template

1. Copia esta carpeta y renómbrala con el nombre de tu feature (kebab-case):
   ```
   cp -r seed/templates/module src/modules/my-feature
   ```

2. Renombra los archivos reemplazando `example` con el nombre de tu feature.

3. Exporta el módulo desde `src/modules/index.ts` (o directamente desde el router).

## Estructura

```
my-feature/
  components/
    q5-my-feature-page/        ← página principal del módulo
      q5-my-feature-page.tsx
      q5-my-feature-page.test.tsx
      q5-my-feature-page.stories.tsx
      index.ts
    q3-my-feature-list/        ← organismo (listado)
      q3-my-feature-list.tsx
      q3-my-feature-list.test.tsx
      index.ts
    q2-my-feature-card/        ← molécula (tarjeta individual)
      q2-my-feature-card.tsx
      q2-my-feature-card.test.tsx
      index.ts
  core/
    hooks/
      use-my-feature-query.ts  ← useQuery hook
      use-create-my-feature.ts ← useMutation hook
    schemas/
      my-feature-form.schema.ts ← Zod schema
    state/
      my-feature-filters.store.ts ← Zustand store local (si hace falta)
  routes/
    my-feature.routes.tsx       ← Rutas del módulo
  index.ts                      ← Barrel export público
```

## Reglas

- Los componentes del módulo solo se importan desde el router (`src/app/router.tsx`)
- Si un componente se necesita en otro módulo → moverlo a `src/global/components/`
- Si una entidad se necesita en otro módulo → moverla a `src/resources/entities/`
- El módulo exporta solo lo que necesita exponer en `index.ts`
