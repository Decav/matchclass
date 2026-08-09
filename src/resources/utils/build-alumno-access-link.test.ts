import { describe, it, expect } from 'vitest';
import { buildAlumnoAccessLink } from './build-alumno-access-link';

describe('buildAlumnoAccessLink', () => {
  it('con origin explícito devuelve la URL completa al tab Alumno con el código', () => {
    expect(buildAlumnoAccessLink('EDS101', 'https://matchclass.cl')).toBe(
      'https://matchclass.cl/acceso?tipo=alumno&codigo=EDS101',
    );
  });

  it('sin origin explícito usa window.location.origin', () => {
    expect(buildAlumnoAccessLink('EDS101')).toBe(`${window.location.origin}/acceso?tipo=alumno&codigo=EDS101`);
  });
});
