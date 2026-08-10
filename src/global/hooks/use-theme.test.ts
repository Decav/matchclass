import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTheme } from './use-theme';

const STORAGE_KEY = 'matchclass-theme';

/**
 * RC-016 (HU-14): cobertura del mecanismo de tema. `src/test/setup.ts` ya
 * define un `matchMedia` global que siempre devuelve `matches: false`; acá se
 * sobreescribe por test con `vi.stubGlobal` para poder simular las dos
 * preferencias del sistema. `vi.unstubAllGlobals()` restaura el polyfill.
 */
function stubPrefersColorScheme(prefersDark: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    (query: string): MediaQueryList => ({
      matches: query.includes('prefers-color-scheme: dark') ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  );
}

function themeAttribute(): string | null {
  return document.documentElement.getAttribute('data-theme');
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sin preferencia guardada y con el sistema en oscuro, arranca en oscuro (Escenario 4)', () => {
    stubPrefersColorScheme(true);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(themeAttribute()).toBe('dark');
  });

  it('sin preferencia guardada y con el sistema en claro, arranca en claro', () => {
    stubPrefersColorScheme(false);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(themeAttribute()).toBeNull();
  });

  it('con "dark" guardado arranca en oscuro aunque el sistema esté en claro (Escenario 3)', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    stubPrefersColorScheme(false);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(themeAttribute()).toBe('dark');
  });

  it('toggleTheme pasa a oscuro, escribe data-theme en <html> y persiste (Escenario 1)', () => {
    stubPrefersColorScheme(false);

    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(themeAttribute()).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('el segundo toggle vuelve a claro, quita data-theme y persiste "light" (Escenario 2)', () => {
    stubPrefersColorScheme(false);

    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(themeAttribute()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('al montar sin tocar el toggle no escribe en localStorage (D2)', () => {
    // El sistema en oscuro es el caso que importa: antes de RC-016 el efecto
    // de montaje persistía ese valor derivado y lo congelaba, así que la app
    // dejaba de seguir a `prefers-color-scheme` sin que el usuario eligiera
    // nada.
    stubPrefersColorScheme(true);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
