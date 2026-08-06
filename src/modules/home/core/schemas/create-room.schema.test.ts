import { describe, it, expect } from 'vitest';
import { createRoomSchema } from './create-room.schema';

describe('createRoomSchema', () => {
  it('acepta los tres campos completos', () => {
    const result = createRoomSchema.safeParse({
      name: 'Estructuras de Datos - Secc 1',
      subject: 'Estructuras de Datos',
      section: '1',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza name vacío con "Este campo es obligatorio" (Escenario 2)', () => {
    const result = createRoomSchema.safeParse({ name: '', subject: 'Materia', section: '1' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.find((issue) => issue.path[0] === 'name')?.message).toBe(
      'Este campo es obligatorio',
    );
  });

  it('rechaza subject vacío con "Este campo es obligatorio" (Escenario 2)', () => {
    const result = createRoomSchema.safeParse({ name: 'Sala', subject: '', section: '1' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.find((issue) => issue.path[0] === 'subject')?.message).toBe(
      'Este campo es obligatorio',
    );
  });

  it('rechaza section vacío con "Este campo es obligatorio" (Escenario 2)', () => {
    const result = createRoomSchema.safeParse({ name: 'Sala', subject: 'Materia', section: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.find((issue) => issue.path[0] === 'section')?.message).toBe(
      'Este campo es obligatorio',
    );
  });

  it('rechaza los tres campos vacíos a la vez con un error por campo', () => {
    const result = createRoomSchema.safeParse({ name: '', subject: '', section: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toHaveLength(3);
  });
});
