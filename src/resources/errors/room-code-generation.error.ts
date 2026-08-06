/**
 * `RoomService.createRoom` generó 3 códigos cortos y los 3 ya existían en
 * `rooms` (colisión). Caso raro (36⁶ combinaciones posibles con códigos de 6
 * caracteres) — RC-009 §4. La UI le da el mismo tratamiento que
 * `NetworkError` (mensaje "Error de conexión. Intenta de nuevo"): desde la
 * perspectiva del ayudante no hay una acción distinta que tomar.
 */
export class RoomCodeGenerationError extends Error {
  constructor() {
    super('No se pudo generar un código único para la sala.');
    this.name = 'RoomCodeGenerationError';
  }
}
