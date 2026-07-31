import { describe, it, expect } from 'vitest';
import { roomCodeSchema } from './room-code.schema';

describe('roomCodeSchema', () => {
  it('acepta un código de exactamente 6 caracteres', () => {
    expect(roomCodeSchema.safeParse({ code: 'ABC123' }).success).toBe(true);
  });

  it('rechaza un código incompleto', () => {
    const result = roomCodeSchema.safeParse({ code: 'ABC' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('El código debe tener 6 caracteres');
  });

  it('rechaza un código con más de 6 caracteres', () => {
    expect(roomCodeSchema.safeParse({ code: 'ABC1234' }).success).toBe(false);
  });

  it('rechaza un código vacío', () => {
    expect(roomCodeSchema.safeParse({ code: '' }).success).toBe(false);
  });
});
