import { describe, it, expect, vi, afterEach } from 'vitest';
import { copyToClipboard, selectElementText } from './copy-to-clipboard';

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('copia el texto y devuelve true cuando navigator.clipboard.writeText existe', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const result = await copyToClipboard('EDS101');

    expect(writeTextMock).toHaveBeenCalledWith('EDS101');
    expect(result).toBe(true);
  });

  it('devuelve false sin lanzar cuando navigator.clipboard no existe (Escenario 4)', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

    await expect(copyToClipboard('EDS101')).resolves.toBe(false);
  });

  it('devuelve false sin lanzar cuando writeText rechaza (permiso denegado)', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    });

    await expect(copyToClipboard('EDS101')).resolves.toBe(false);
  });
});

describe('selectElementText', () => {
  it('selecciona el contenido del elemento con la Selection API', () => {
    const el = document.createElement('span');
    el.textContent = 'EDS101';
    document.body.appendChild(el);

    selectElementText(el);

    const selection = window.getSelection();
    expect(selection?.toString()).toBe('EDS101');

    document.body.removeChild(el);
  });
});
