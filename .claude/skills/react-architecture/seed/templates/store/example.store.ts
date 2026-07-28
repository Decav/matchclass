// Template: Zustand store con TypeScript
// Renombrar "Example/example" con el nombre de tu dominio
//
// Stores globales → src/global/stores/
// Stores de módulo → src/modules/{feature}/core/state/

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── State Shape ─────────────────────────────────────────────────────────────

interface ExampleItem {
  id: string;
  name: string;
  active: boolean;
}

interface ExampleFilters {
  search: string;
  onlyActive: boolean;
}

interface ExampleState {
  // Data
  selectedItem: ExampleItem | null;
  filters: ExampleFilters;

  // UI state
  isDetailPanelOpen: boolean;

  // Actions
  selectItem: (item: ExampleItem) => void;
  clearSelection: () => void;
  setFilter: (key: keyof ExampleFilters, value: ExampleFilters[keyof ExampleFilters]) => void;
  resetFilters: () => void;
  toggleDetailPanel: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialFilters: ExampleFilters = {
  search: '',
  onlyActive: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useExampleStore = create<ExampleState>()(
  devtools(
    (set) => ({
      // Initial data
      selectedItem: null,
      filters: initialFilters,
      isDetailPanelOpen: false,

      // Actions
      selectItem: (item) =>
        set({ selectedItem: item }, false, 'example/selectItem'),

      clearSelection: () =>
        set({ selectedItem: null, isDetailPanelOpen: false }, false, 'example/clearSelection'),

      setFilter: (key, value) =>
        set(
          (state) => ({ filters: { ...state.filters, [key]: value } }),
          false,
          'example/setFilter'
        ),

      resetFilters: () =>
        set({ filters: initialFilters }, false, 'example/resetFilters'),

      toggleDetailPanel: () =>
        set(
          (state) => ({ isDetailPanelOpen: !state.isDetailPanelOpen }),
          false,
          'example/toggleDetailPanel'
        ),
    }),
    { name: 'ExampleStore' }
  )
);

// ─── Selectors ───────────────────────────────────────────────────────────────
// Exportar selectores memoizados evita re-renders innecesarios.
// Uso: const selectedItem = useExampleStore(selectSelectedItem);

export const selectSelectedItem = (state: ExampleState) => state.selectedItem;
export const selectFilters = (state: ExampleState) => state.filters;
export const selectIsDetailPanelOpen = (state: ExampleState) => state.isDetailPanelOpen;
