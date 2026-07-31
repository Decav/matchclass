import { describe, it, expect } from 'vitest';
import { registerSchema } from './register.schema';

const VALID_INPUT = {
  displayName: 'María González',
  email: 'test@matchclass.cl',
  password: 'secreta123',
  confirmPassword: 'secreta123',
};

describe('registerSchema', () => {
  it('acepta datos válidos', () => {
    const result = registerSchema.safeParse(VALID_INPUT);
    expect(result.success).toBe(true);
  });

  it('rechaza displayName vacío con "Este campo es obligatorio"', () => {
    const result = registerSchema.safeParse({ ...VALID_INPUT, displayName: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Este campo es obligatorio');
  });

  it('rechaza email vacío con "Este campo es obligatorio"', () => {
    const result = registerSchema.safeParse({ ...VALID_INPUT, email: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Este campo es obligatorio');
  });

  it('rechaza email con formato inválido', () => {
    const result = registerSchema.safeParse({ ...VALID_INPUT, email: 'no-es-un-email' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Ingresa un email válido');
  });

  it('rechaza password vacía con "Este campo es obligatorio"', () => {
    const result = registerSchema.safeParse({ ...VALID_INPUT, password: '', confirmPassword: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Este campo es obligatorio');
  });

  it('rechaza password de menos de 6 caracteres', () => {
    const result = registerSchema.safeParse({ ...VALID_INPUT, password: 'abc', confirmPassword: 'abc' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('La contraseña debe tener al menos 6 caracteres');
  });

  it('rechaza confirmPassword que no coincide con password', () => {
    const result = registerSchema.safeParse({ ...VALID_INPUT, confirmPassword: 'otra-contraseña' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Las contraseñas no coinciden');
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });
});
