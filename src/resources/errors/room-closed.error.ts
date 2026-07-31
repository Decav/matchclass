/**
 * La sala existe pero su `status` no es `'active'`: ya no acepta
 * respuestas. Escenario 11 de HU-01.
 */
export class RoomClosedError extends Error {
  constructor() {
    super('Esta sala ya no acepta respuestas.');
    this.name = 'RoomClosedError';
  }
}
