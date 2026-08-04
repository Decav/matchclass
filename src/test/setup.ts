import '@testing-library/jest-dom/vitest';

// jsdom no implementa `matchMedia` (gap conocido) — `useTheme` (RC-002) lo
// llama al montar `ThemeProvider`/`Q5AppShell`. Primer test que monta ese
// árbol es RC-008 (`PaDashboard`); sin este polyfill, `getInitialTheme()`
// revienta en cualquier test futuro que renderice una pantalla autenticada.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => {
    const mediaQueryList: MediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    };
    return mediaQueryList;
  };
}
