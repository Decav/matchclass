import { describe, it, expect } from 'vitest';
import { loginSchema } from './login.schema';

describe('loginSchema', () => {
  it('acepta email y password válidos', () => {
    const result = loginSchema.safeParse({ email: 'test@matchclass.cl', password: 'secreta123' });
    expect(result.success).toBe(true);
  });

  it('rechaza email vacío con "Este campo es obligatorio"', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secreta123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Este campo es obligatorio');
  });

  it('rechaza email con formato inválido', () => {
    const result = loginSchema.safeParse({ email: 'no-es-un-email', password: 'secreta123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Ingresa un email válido');
  });

  it('rechaza password vacía', () => {
    const result = loginSchema.safeParse({ email: 'test@matchclass.cl', password: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Este campo es obligatorio');
  });
});
