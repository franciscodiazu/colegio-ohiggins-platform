import { describe, it, expect, beforeEach, vi } from 'vitest';
import { studentsMockService } from '../../services/studentsMockService';

const STUDENTS_KEY = 'coh_students';

beforeEach(() => {
  localStorage.clear();
});

// ── listStudents ───────────────────────────────────────────────────────────────

describe('studentsMockService.listStudents', () => {
  it('retorna los estudiantes seed la primera vez', async () => {
    const students = await studentsMockService.listStudents();
    expect(students).toHaveLength(2);
    expect(students[0].nombre).toBe('Juan Perez');
  });

  it('persiste el seed en localStorage', async () => {
    await studentsMockService.listStudents();
    expect(localStorage.getItem(STUDENTS_KEY)).not.toBeNull();
  });

  it('retorna arreglo vacío si el JSON almacenado es inválido', async () => {
    localStorage.setItem(STUDENTS_KEY, '{invalid json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const students = await studentsMockService.listStudents();
    expect(students).toEqual([]);
    consoleSpy.mockRestore();
  });
});

// ── createStudent ──────────────────────────────────────────────────────────────

describe('studentsMockService.createStudent', () => {
  it('crea un estudiante válido', async () => {
    const created = await studentsMockService.createStudent({
      nombre: 'Pedro López', correo: 'PEDRO@ALUM.CL', curso: '3C', telefono: '123', cursosAsociados: 'Arte, Música',
    });
    expect(created.nombre).toBe('Pedro López');
    expect(created.correo).toBe('pedro@alum.cl'); // se normaliza a minúsculas
    expect(created.cursosAsociados).toEqual(['Arte', 'Música']);
  });

  it('asigna un id único incremental', async () => {
    const created = await studentsMockService.createStudent({
      nombre: 'Test', correo: 'test@alum.cl', curso: '1A', telefono: '', cursosAsociados: '',
    });
    expect(created.id).toBeGreaterThan(1002);
  });

  it('lanza error si falta el nombre', async () => {
    await expect(
      studentsMockService.createStudent({ nombre: '', correo: 'x@alum.cl', curso: '1A', telefono: '', cursosAsociados: '' })
    ).rejects.toThrow(/Nombre y curso son obligatorios/i);
  });

  it('lanza error si falta el curso', async () => {
    await expect(
      studentsMockService.createStudent({ nombre: 'Test', correo: 'x@alum.cl', curso: '', telefono: '', cursosAsociados: '' })
    ).rejects.toThrow(/Nombre y curso son obligatorios/i);
  });

  it('persiste el nuevo estudiante en localStorage', async () => {
    await studentsMockService.createStudent({
      nombre: 'Nuevo', correo: 'nuevo@alum.cl', curso: '1A', telefono: '', cursosAsociados: '',
    });
    const stored = JSON.parse(localStorage.getItem(STUDENTS_KEY));
    expect(stored).toHaveLength(3);
  });

  it('convierte la lista de cursos separada por comas correctamente, filtrando vacíos', async () => {
    const created = await studentsMockService.createStudent({
      nombre: 'Test', correo: 'test@alum.cl', curso: '1A', telefono: '', cursosAsociados: 'Arte, , Música,  ',
    });
    expect(created.cursosAsociados).toEqual(['Arte', 'Música']);
  });
});

// ── getStudentById ─────────────────────────────────────────────────────────────

describe('studentsMockService.getStudentById', () => {
  it('retorna el estudiante si existe', async () => {
    const found = await studentsMockService.getStudentById(1001);
    expect(found.nombre).toBe('Juan Perez');
  });

  it('retorna null si no existe', async () => {
    const found = await studentsMockService.getStudentById(9999);
    expect(found).toBeNull();
  });

  it('acepta el id como string', async () => {
    const found = await studentsMockService.getStudentById('1001');
    expect(found.nombre).toBe('Juan Perez');
  });
});

// ── updateStudent ──────────────────────────────────────────────────────────────

describe('studentsMockService.updateStudent', () => {
  it('actualiza un estudiante existente', async () => {
    const updated = await studentsMockService.updateStudent(1001, {
      nombre: 'Juan Pérez Actualizado', correo: 'juan2@alum.cl', curso: '2A', telefono: '999', cursosAsociados: 'Física',
    });
    expect(updated.nombre).toBe('Juan Pérez Actualizado');
    expect(updated.curso).toBe('2A');
  });

  it('retorna null si el estudiante no existe', async () => {
    const updated = await studentsMockService.updateStudent(9999, {
      nombre: 'X', correo: 'x@alum.cl', curso: '1A', telefono: '', cursosAsociados: '',
    });
    expect(updated).toBeNull();
  });

  it('lanza error de validación si faltan campos obligatorios', async () => {
    await expect(
      studentsMockService.updateStudent(1001, { nombre: '', correo: 'x@alum.cl', curso: '1A', telefono: '', cursosAsociados: '' })
    ).rejects.toThrow(/Nombre y curso son obligatorios/i);
  });

  it('persiste los cambios en localStorage', async () => {
    await studentsMockService.updateStudent(1001, {
      nombre: 'Cambiado', correo: 'c@alum.cl', curso: '1A', telefono: '', cursosAsociados: '',
    });
    const stored = JSON.parse(localStorage.getItem(STUDENTS_KEY));
    const found = stored.find((s) => s.id === 1001);
    expect(found.nombre).toBe('Cambiado');
  });
});

// ── listStudentCourses ─────────────────────────────────────────────────────────

describe('studentsMockService.listStudentCourses', () => {
  it('retorna los cursos asociados de un estudiante existente', async () => {
    const courses = await studentsMockService.listStudentCourses(1001);
    expect(courses).toEqual(['Matematicas', 'Lenguaje', 'Historia']);
  });

  it('retorna arreglo vacío si el estudiante no existe', async () => {
    const courses = await studentsMockService.listStudentCourses(9999);
    expect(courses).toEqual([]);
  });
});