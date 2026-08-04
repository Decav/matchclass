import { describe, it, expect } from 'vitest';
import { recoverSchema } from './recover.schema';

describe('recoverSchema', () => {
  it('acepta un email válido', () => {
    const result = recoverSchema.safeParse({ email: 'test@matchclass.cl' });
    expect(result.success).toBe(true);
  });

  it('rechaza email vacío con "Este campo es obligatorio" (Escenario 4)', () => {
    const result = recoverSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Este campo es obligatorio');
  });

  it('rechaza email con formato inválido con "Ingresa un email válido" (Escenario 3)', () => {
    const result = recoverSchema.safeParse({ email: 'hola' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Ingresa un email válido');
  });
});
