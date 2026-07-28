// Template: use-{feature}-query.ts
// Renombrar el dominio "example" con el nombre de tu feature

import { useQuery } from '@tanstack/react-query';
// import { exampleRepository } from '@library/repositories/example.repository';
// import type { Example } from '@resources/entities/example.entity';

// ─── Query Keys ─────────────────────────────────────────────────────────────
// Centraliza todas las query keys del módulo aquí para evitar typos y
// facilitar invalidaciones selectivas.
export const exampleQueryKeys = {
  all: ['examples'] as const,
  detail: (id: string) => ['examples', id] as const,
  filtered: (filters: Record<string, unknown>) => ['examples', 'filtered', filters] as const,
};

// ─── List Query ──────────────────────────────────────────────────────────────
export function useExamplesQuery() {
  return useQuery({
    queryKey: exampleQueryKeys.all,
    // queryFn: () => exampleRepository.findAll(),
    queryFn: async () => {
      // TODO: reemplazar con el repositorio real
      throw new Error('Not implemented');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// ─── Detail Query ────────────────────────────────────────────────────────────
export function useExampleQuery(id: string) {
  return useQuery({
    queryKey: exampleQueryKeys.detail(id),
    // queryFn: () => exampleRepository.findById(id),
    queryFn: async () => {
      // TODO: reemplazar con el repositorio real
      throw new Error('Not implemented');
    },
    enabled: Boolean(id), // no ejecutar si id es vacío
  });
}
