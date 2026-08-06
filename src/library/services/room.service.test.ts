import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Room } from '@resources/entities/room.entity';

vi.mock('@library/repositories/room.repository', () => ({
  RoomRepository: { listByOwner: vi.fn(), findByCode: vi.fn(), create: vi.fn() },
}));
vi.mock('@library/repositories/response.repository', () => ({
  ResponseRepository: { countByRoom: vi.fn() },
}));

import { RoomRepository } from '@library/repositories/room.repository';
import { ResponseRepository } from '@library/repositories/response.repository';
import { RoomCodeGenerationError } from '@resources/errors/room-code-generation.error';
import { RoomService } from './room.service';

function makeRoom(overrides: Partial<Room>): Room {
  return {
    id: 'r1',
    code: 'ABC123',
    name: 'Sala de prueba',
    subject: 'Materia',
    section: 'Secc 1',
    createdBy: 'u1',
    createdAt: new Date('2026-01-01'),
    status: 'active',
    helperBlockedSlots: [],
    ...overrides,
  };
}

describe('RoomService.getDashboardRooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('combina salas + conteo de respuestas, y ordena activas primero por createdAt DESC', async () => {
    const rooms: Room[] = [
      makeRoom({ id: 'closed-old', status: 'closed', createdAt: new Date('2026-01-01') }),
      makeRoom({ id: 'active-old', status: 'active', createdAt: new Date('2026-01-05') }),
      makeRoom({ id: 'active-new', status: 'active', createdAt: new Date('2026-01-10') }),
    ];
    const counts: Record<string, number> = { 'closed-old': 5, 'active-old': 2, 'active-new': 9 };

    vi.mocked(RoomRepository.listByOwner).mockResolvedValue(rooms);
    vi.mocked(ResponseRepository.countByRoom).mockImplementation((roomId) =>
      Promise.resolve(counts[roomId] ?? 0),
    );

    const result = await RoomService.getDashboardRooms('u1');

    expect(result.map((r) => r.id)).toEqual(['active-new', 'active-old', 'closed-old']);
    expect(result.find((r) => r.id === 'active-new')?.responseCount).toBe(9);
    expect(result.find((r) => r.id === 'closed-old')?.responseCount).toBe(5);
    expect(RoomRepository.listByOwner).toHaveBeenCalledWith('u1');
    expect(ResponseRepository.countByRoom).toHaveBeenCalledTimes(3);
  });

  it('dos salas activas se ordenan entre sí por createdAt DESC, no por conteo', async () => {
    const rooms: Room[] = [
      makeRoom({ id: 'a', status: 'active', createdAt: new Date('2026-01-01') }),
      makeRoom({ id: 'b', status: 'active', createdAt: new Date('2026-01-20') }),
    ];
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue(rooms);
    vi.mocked(ResponseRepository.countByRoom).mockResolvedValue(0);

    const result = await RoomService.getDashboardRooms('u1');

    expect(result.map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('sin salas devuelve un arreglo vacío sin llamar countByRoom', async () => {
    vi.mocked(RoomRepository.listByOwner).mockResolvedValue([]);

    const result = await RoomService.getDashboardRooms('u1');

    expect(result).toEqual([]);
    expect(ResponseRepository.countByRoom).not.toHaveBeenCalled();
  });
});

describe('RoomService.createRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const formData = { name: 'Sala', subject: 'Materia', section: 'Secc 1' };

  it('genera un código de 6 caracteres en mayúsculas y crea la sala en el primer intento', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(null);
    vi.mocked(RoomRepository.create).mockResolvedValue({ id: 'room-nuevo' });

    const result = await RoomService.createRoom('helper-1', formData);

    expect(result.id).toBe('room-nuevo');
    expect(result.code).toMatch(/^[A-Z0-9]{6}$/);
    expect(RoomRepository.findByCode).toHaveBeenCalledTimes(1);
    expect(RoomRepository.create).toHaveBeenCalledWith({
      ...formData,
      code: result.code,
      createdBy: 'helper-1',
    });
  });

  it('reintenta cuando el primer código generado ya existe (colisión)', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValueOnce(makeRoom({})).mockResolvedValueOnce(null);
    vi.mocked(RoomRepository.create).mockResolvedValue({ id: 'room-nuevo' });

    const result = await RoomService.createRoom('helper-1', formData);

    expect(RoomRepository.findByCode).toHaveBeenCalledTimes(2);
    expect(result.id).toBe('room-nuevo');
  });

  it('lanza RoomCodeGenerationError si los 3 intentos colisionan', async () => {
    vi.mocked(RoomRepository.findByCode).mockResolvedValue(makeRoom({}));

    await expect(RoomService.createRoom('helper-1', formData)).rejects.toBeInstanceOf(
      RoomCodeGenerationError,
    );
    expect(RoomRepository.findByCode).toHaveBeenCalledTimes(3);
    expect(RoomRepository.create).not.toHaveBeenCalled();
  });
});
