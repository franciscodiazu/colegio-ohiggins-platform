import { describe, it, expect, beforeEach, vi } from 'vitest';
import { attendanceMockService } from '../../services/attendanceMockService';

const CLASSES_KEY = 'coh_classes';
const ATTENDANCE_KEY = 'coh_attendance_records';
const STUDENTS_KEY = 'coh_students';

const seedStudents = [
  { id: 1, nombre: 'Juan Pérez', curso: '1A' },
  { id: 2, nombre: 'María Gómez', curso: '2B' },
];

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(seedStudents));
});

// ── listClasses ────────────────────────────────────────────────────────────────

describe('attendanceMockService.listClasses', () => {
  it('retorna las clases seed la primera vez', async () => {
    const classes = await attendanceMockService.listClasses();
    expect(classes).toHaveLength(2);
    expect(classes[0].curso).toBe('1A');
  });

  it('persiste el seed en localStorage', async () => {
    await attendanceMockService.listClasses();
    expect(localStorage.getItem(CLASSES_KEY)).not.toBeNull();
  });
});

// ── createClass ────────────────────────────────────────────────────────────────

describe('attendanceMockService.createClass', () => {
  it('crea una clase válida', async () => {
    const created = await attendanceMockService.createClass({
      fecha: '2026-03-01', curso: '1A', asignatura: 'Lenguaje', bloque: '10:00',
    });
    expect(created.curso).toBe('1A');
    expect(created.id).toBeGreaterThan(0);
  });

  it('lanza error si falta la fecha', async () => {
    await expect(
      attendanceMockService.createClass({ fecha: '', curso: '1A', asignatura: 'X', bloque: '10:00' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta el curso', async () => {
    await expect(
      attendanceMockService.createClass({ fecha: '2026-03-01', curso: '', asignatura: 'X', bloque: '10:00' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta la asignatura', async () => {
    await expect(
      attendanceMockService.createClass({ fecha: '2026-03-01', curso: '1A', asignatura: '', bloque: '10:00' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta el bloque', async () => {
    await expect(
      attendanceMockService.createClass({ fecha: '2026-03-01', curso: '1A', asignatura: 'X', bloque: '' })
    ).rejects.toThrow(/obligatorios/i);
  });
});

// ── listAttendanceRecords ──────────────────────────────────────────────────────

describe('attendanceMockService.listAttendanceRecords', () => {
  it('retorna arreglo vacío la primera vez', async () => {
    const records = await attendanceMockService.listAttendanceRecords();
    expect(records).toEqual([]);
  });

  it('normaliza estados en inglés a español', async () => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([
      { id: 1, classId: 501, studentId: 1, estado: 'PRESENT' },
    ]));
    const records = await attendanceMockService.listAttendanceRecords();
    expect(records[0].estado).toBe('PRESENTE');
  });
});

// ── createAttendanceRecord ─────────────────────────────────────────────────────

describe('attendanceMockService.createAttendanceRecord', () => {
  it('crea un registro de asistencia válido', async () => {
    const created = await attendanceMockService.createAttendanceRecord({
      classId: 501, studentId: 1, estado: 'PRESENTE', observacion: 'OK',
    });
    expect(created.classId).toBe(501);
    expect(created.studentId).toBe(1);
    expect(created.estado).toBe('PRESENTE');
  });

  it('lanza error si falta classId', async () => {
    await expect(
      attendanceMockService.createAttendanceRecord({ studentId: 1, estado: 'PRESENTE' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta studentId', async () => {
    await expect(
      attendanceMockService.createAttendanceRecord({ classId: 501, estado: 'PRESENTE' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta estado', async () => {
    await expect(
      attendanceMockService.createAttendanceRecord({ classId: 501, studentId: 1, estado: '' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si la clase no existe', async () => {
    await expect(
      attendanceMockService.createAttendanceRecord({ classId: 9999, studentId: 1, estado: 'PRESENTE' })
    ).rejects.toThrow(/clase previamente registrada/i);
  });

  it('lanza error si el estudiante no existe', async () => {
    await expect(
      attendanceMockService.createAttendanceRecord({ classId: 501, studentId: 9999, estado: 'PRESENTE' })
    ).rejects.toThrow(/estudiante existente/i);
  });

  it('lanza error si el estado es inválido', async () => {
    await expect(
      attendanceMockService.createAttendanceRecord({ classId: 501, studentId: 1, estado: 'INVALIDO' })
    ).rejects.toThrow(/Estado de asistencia invalido/i);
  });

  it('lanza error si el estudiante ya tiene registro para esa clase', async () => {
    await attendanceMockService.createAttendanceRecord({ classId: 501, studentId: 1, estado: 'PRESENTE' });
    await expect(
      attendanceMockService.createAttendanceRecord({ classId: 501, studentId: 1, estado: 'AUSENTE' })
    ).rejects.toThrow(/solo puede tener un registro/i);
  });

  it('acepta estados normalizados desde inglés', async () => {
    const created = await attendanceMockService.createAttendanceRecord({
      classId: 501, studentId: 1, estado: 'ABSENT',
    });
    expect(created.estado).toBe('AUSENTE');
  });
});

// ── listAttendanceByStudent ────────────────────────────────────────────────────

describe('attendanceMockService.listAttendanceByStudent', () => {
  it('filtra registros por estudiante', async () => {
    await attendanceMockService.createAttendanceRecord({ classId: 501, studentId: 1, estado: 'PRESENTE' });
    const result = await attendanceMockService.listAttendanceByStudent(1);
    expect(result).toHaveLength(1);
    expect(result[0].studentId).toBe(1);
  });

  it('retorna vacío si el estudiante no tiene registros', async () => {
    const result = await attendanceMockService.listAttendanceByStudent(999);
    expect(result).toEqual([]);
  });
});

// ── listAttendanceByCourse ─────────────────────────────────────────────────────

describe('attendanceMockService.listAttendanceByCourse', () => {
  it('filtra registros por curso usando las clases asociadas', async () => {
    await attendanceMockService.createAttendanceRecord({ classId: 501, studentId: 1, estado: 'PRESENTE' });
    const result = await attendanceMockService.listAttendanceByCourse('1A');
    expect(result).toHaveLength(1);
  });

  it('retorna vacío si el curso no tiene clases asociadas', async () => {
    const result = await attendanceMockService.listAttendanceByCourse('9Z');
    expect(result).toEqual([]);
  });

  it('acepta un cache de clases opcional', async () => {
    await attendanceMockService.createAttendanceRecord({ classId: 501, studentId: 1, estado: 'PRESENTE' });
    const classesCache = [{ id: 501, curso: '1A' }];
    const result = await attendanceMockService.listAttendanceByCourse('1A', classesCache);
    expect(result).toHaveLength(1);
  });
});

// ── Manejo de errores de lectura ───────────────────────────────────────────────

describe('attendanceMockService — manejo de errores de localStorage', () => {
  it('retorna arreglo vacío si el JSON almacenado es inválido', async () => {
    localStorage.setItem(CLASSES_KEY, '{not valid json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const classes = await attendanceMockService.listClasses();
    expect(classes).toEqual([]);
    consoleSpy.mockRestore();
  });
});