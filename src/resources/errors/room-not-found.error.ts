/**
 * El código de sala ingresado no coincide con ninguna sala existente
 * (`RoomRepository.findByCode` devolvió `null`). Escenario 10 de HU-01.
 */
export class RoomNotFoundError extends Error {
  constructor() {
    super('No se encontró ninguna sala con ese código.');
    this.name = 'RoomNotFoundError';
  }
}
