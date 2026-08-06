import { describe, it, expect } from 'vitest';
import { generateShortCode } from './generate-short-code';

describe('generateShortCode', () => {
  it('genera un código de 6 caracteres por defecto', () => {
    expect(generateShortCode()).toHaveLength(6);
  });

  it('respeta la longitud pasada por parámetro', () => {
    expect(generateShortCode(3)).toHaveLength(3);
    expect(generateShortCode(10)).toHaveLength(10);
  });

  it('solo contiene caracteres alfanuméricos en mayúsculas', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(generateShortCode(6)).toMatch(/^[A-Z0-9]{6}$/);
    }
  });

  it('no conoce el dominio "sala": es un generador de códigos genérico', () => {
    // No debería lanzar ni requerir ningún argumento relacionado a salas.
    expect(() => generateShortCode()).not.toThrow();
  });
});
