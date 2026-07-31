import { describe, it, expect } from 'vitest';
import { studentNameSchema } from './student-name.schema';

describe('studentNameSchema', () => {
  it('acepta un nombre de 2 o más caracteres', () => {
    expect(studentNameSchema.safeParse({ studentName: 'Ana' }).success).toBe(true);
  });

  it('rechaza un nombre vacío', () => {
    const result = studentNameSchema.safeParse({ studentName: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('El nombre debe tener al menos 2 caracteres');
  });

  it('rechaza un nombre de 1 caracter', () => {
    expect(studentNameSchema.safeParse({ studentName: 'A' }).success).toBe(false);
  });

  it('descarta espacios al inicio/fin antes de validar el largo', () => {
    const result = studentNameSchema.safeParse({ studentName: '  A  ' });
    expect(result.success).toBe(false);
  });
});
