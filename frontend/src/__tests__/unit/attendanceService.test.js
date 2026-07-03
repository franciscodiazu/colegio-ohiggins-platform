import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attendanceService } from '../../services/attendanceService';

vi.mock('../../services/bffClient', () => {
  const mockBffClient = {
    get: vi.fn(),
    post: vi.fn(),
  };
  return { bffClient: mockBffClient };
});

import { bffClient } from '../../services/bffClient';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

// ── listClasses ────────────────────────────────────────────────────────────────

describe('attendanceService.listClasses', () => {
  it('retorna las clases del backend', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 1, curso: '1A' }] });
    const result = await attendanceService.listClasses();
    expect(result).toEqual([{ id: 1, curso: '1A' }]);
  });

  it('llama al endpoint correcto', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await attendanceService.listClasses();
    expect(bffClient.get).toHaveBeenCalledWith('/api/clases');
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: null });
    const result = await attendanceService.listClasses();
    expect(result).toEqual([]);
  });

  it('relanza el error si la petición falla', async () => {
    bffClient.get.mockRejectedValue(new Error('Network error'));
    await expect(attendanceService.listClasses()).rejects.toThrow('Network error');
  });
});

// ── createClass ────────────────────────────────────────────────────────────────

describe('attendanceService.createClass', () => {
  it('crea una clase válida', async () => {
    bffClient.post.mockResolvedValue({ data: { id: 2, curso: '1A' } });
    const result = await attendanceService.createClass({ fecha: '2026-01-01', curso: '1A', asignatura: 'Mate' });
    expect(result).toEqual({ id: 2, curso: '1A' });
  });

  it('lanza error si falta fecha', async () => {
    await expect(
      attendanceService.createClass({ curso: '1A', asignatura: 'Mate' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta curso', async () => {
    await expect(
      attendanceService.createClass({ fecha: '2026-01-01', asignatura: 'Mate' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta asignatura', async () => {
    await expect(
      attendanceService.createClass({ fecha: '2026-01-01', curso: '1A' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('llama a bffClient.post con el endpoint y payload correctos', async () => {
    bffClient.post.mockResolvedValue({ data: { id: 3 } });
    const payload = { fecha: '2026-01-01', curso: '1A', asignatura: 'Mate' };
    await attendanceService.createClass(payload);
    expect(bffClient.post).toHaveBeenCalledWith('/api/clases', payload);
  });

  it('relanza el error si el servicio falla', async () => {
    bffClient.post.mockRejectedValue(new Error('Server error'));
    await expect(
      attendanceService.createClass({ fecha: '2026-01-01', curso: '1A', asignatura: 'Mate' })
    ).rejects.toThrow('Server error');
  });
});

// ── listAttendanceRecords ──────────────────────────────────────────────────────

describe('attendanceService.listAttendanceRecords', () => {
  it('retorna los registros de asistencia', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 1, estado: 'PRESENTE' }] });
    const result = await attendanceService.listAttendanceRecords();
    expect(result).toEqual([{ id: 1, estado: 'PRESENTE' }]);
  });

  it('llama al endpoint correcto', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await attendanceService.listAttendanceRecords();
    expect(bffClient.get).toHaveBeenCalledWith('/api/asistencia');
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: undefined });
    const result = await attendanceService.listAttendanceRecords();
    expect(result).toEqual([]);
  });
});

// ── createAttendanceRecord ─────────────────────────────────────────────────────

describe('attendanceService.createAttendanceRecord', () => {
  it('crea un registro válido mapeando el payload al formato backend', async () => {
    bffClient.post.mockResolvedValue({ data: { id: 10 } });

    await attendanceService.createAttendanceRecord({
      classId: 1, studentId: 2, estado: 'PRESENTE', observacion: 'OK',
    });

    expect(bffClient.post).toHaveBeenCalledWith('/api/asistencia', expect.objectContaining({
      clase_id: 1, estudiante_id: 2, tipo_registro: 'PRESENTE', es_justificada: false, notas: 'OK',
    }));
  });

  it('omite observacion del payload si no se provee', async () => {
    bffClient.post.mockResolvedValue({ data: { id: 11 } });

    await attendanceService.createAttendanceRecord({ classId: 1, studentId: 2, estado: 'PRESENTE' });

    const sentPayload = bffClient.post.mock.calls[0][1];
    expect(sentPayload).not.toHaveProperty('notas');
  });

  it('lanza error si falta classId', async () => {
    await expect(
      attendanceService.createAttendanceRecord({ studentId: 2, estado: 'PRESENTE' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta studentId', async () => {
    await expect(
      attendanceService.createAttendanceRecord({ classId: 1, estado: 'PRESENTE' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta estado', async () => {
    await expect(
      attendanceService.createAttendanceRecord({ classId: 1, studentId: 2 })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('asigna userMessage y type para error 404', async () => {
    const error = { response: { status: 404, data: {} } };
    bffClient.post.mockRejectedValue(error);

    await expect(
      attendanceService.createAttendanceRecord({ classId: 1, studentId: 2, estado: 'PRESENTE' })
    ).rejects.toMatchObject({
      userMessage: expect.stringContaining('no encontrado'),
      type: 'STUDENT_NOT_FOUND',
    });
  });

  it('asigna userMessage y type para error 503', async () => {
    const error = { response: { status: 503, data: {} } };
    bffClient.post.mockRejectedValue(error);

    await expect(
      attendanceService.createAttendanceRecord({ classId: 1, studentId: 2, estado: 'PRESENTE' })
    ).rejects.toMatchObject({
      userMessage: expect.stringContaining('mantenimiento'),
      type: 'SERVICE_UNAVAILABLE',
    });
  });

  it('asigna userMessage y type para error 400', async () => {
    const error = { response: { status: 400, data: { message: 'Campo inválido' } } };
    bffClient.post.mockRejectedValue(error);

    await expect(
      attendanceService.createAttendanceRecord({ classId: 1, studentId: 2, estado: 'PRESENTE' })
    ).rejects.toMatchObject({
      userMessage: expect.stringContaining('Campo inválido'),
      type: 'INVALID_PAYLOAD',
    });
  });

  it('asigna userMessage y type UNKNOWN_ERROR para otros errores', async () => {
    const error = new Error('Algo raro pasó');
    bffClient.post.mockRejectedValue(error);

    await expect(
      attendanceService.createAttendanceRecord({ classId: 1, studentId: 2, estado: 'PRESENTE' })
    ).rejects.toMatchObject({
      type: 'UNKNOWN_ERROR',
    });
  });
});

// ── listAttendanceByStudent ────────────────────────────────────────────────────

describe('attendanceService.listAttendanceByStudent', () => {
  it('llama al endpoint correcto con el studentId', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await attendanceService.listAttendanceByStudent(5);
    expect(bffClient.get).toHaveBeenCalledWith('/api/asistencia/estudiante/5');
  });

  it('retorna los registros encontrados', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    const result = await attendanceService.listAttendanceByStudent(5);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: null });
    const result = await attendanceService.listAttendanceByStudent(5);
    expect(result).toEqual([]);
  });

  it('relanza el error si falla', async () => {
    bffClient.get.mockRejectedValue(new Error('fail'));
    await expect(attendanceService.listAttendanceByStudent(5)).rejects.toThrow('fail');
  });
});

// ── listAttendanceByCourse ─────────────────────────────────────────────────────

describe('attendanceService.listAttendanceByCourse', () => {
  it('llama al endpoint correcto con el nombre del curso', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await attendanceService.listAttendanceByCourse('1A');
    expect(bffClient.get).toHaveBeenCalledWith('/api/asistencia/curso/1A');
  });

  it('retorna los registros encontrados', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 2 }] });
    const result = await attendanceService.listAttendanceByCourse('1A');
    expect(result).toEqual([{ id: 2 }]);
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: undefined });
    const result = await attendanceService.listAttendanceByCourse('1A');
    expect(result).toEqual([]);
  });
});

// ── getAttendanceStats ─────────────────────────────────────────────────────────

describe('attendanceService.getAttendanceStats', () => {
  it('retorna las estadísticas del estudiante', async () => {
    bffClient.get.mockResolvedValue({ data: { presentes: 10, ausentes: 2 } });
    const result = await attendanceService.getAttendanceStats(5);
    expect(result).toEqual({ presentes: 10, ausentes: 2 });
  });

  it('retorna objeto vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: null });
    const result = await attendanceService.getAttendanceStats(5);
    expect(result).toEqual({});
  });

  it('llama al endpoint correcto', async () => {
    bffClient.get.mockResolvedValue({ data: {} });
    await attendanceService.getAttendanceStats(9);
    expect(bffClient.get).toHaveBeenCalledWith('/api/asistencia/estadisticas/9');
  });
});

// ── getAtrasos ─────────────────────────────────────────────────────────────────

describe('attendanceService.getAtrasos', () => {
  it('usa el umbral por defecto de 15 si no se especifica', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await attendanceService.getAtrasos(5);
    expect(bffClient.get).toHaveBeenCalledWith('/api/asistencia/estudiante/5/atrasos?umbral=15');
  });

  it('usa el umbral especificado', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await attendanceService.getAtrasos(5, 30);
    expect(bffClient.get).toHaveBeenCalledWith('/api/asistencia/estudiante/5/atrasos?umbral=30');
  });

  it('retorna los atrasos encontrados', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    const result = await attendanceService.getAtrasos(5);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: null });
    const result = await attendanceService.getAtrasos(5);
    expect(result).toEqual([]);
  });
});