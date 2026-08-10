import { describe, it, expect } from 'vitest';
import { landingCodeSchema } from './landing-code.schema';

describe('landingCodeSchema', () => {
  it('acepta exactamente 6 caracteres', () => {
    expect(landingCodeSchema.safeParse({ code: 'EDS101' }).success).toBe(true);
  });

  it('rechaza menos de 6 caracteres con el mensaje de largo', () => {
    const result = landingCodeSchema.safeParse({ code: 'EDS1' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('El código debe tener 6 caracteres');
  });

  it('rechaza más de 6 caracteres', () => {
    expect(landingCodeSchema.safeParse({ code: 'EDS1010' }).success).toBe(false);
  });
});
