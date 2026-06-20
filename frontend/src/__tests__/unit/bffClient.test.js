import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studentsService } from '../../services/bffClient';

// Mock de axios para interceptar las llamadas HTTP
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

import axios from 'axios';

const mockClient = axios.create();

beforeEach(() => {
  vi.clearAllMocks();
});

// ── listStudents ───────────────────────────────────────────────────────────────

describe('studentsService.listStudents', () => {
  it('mapea correctamente los datos del backend al formato frontend', async () => {
    mockClient.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Juan Pérez', rut: '11111111-1', email: 'juan@alum.cl', grade: '1A', phone: '123', courses: ['Mate'] },
      ],
    });

    const result = await studentsService.listStudents();

    expect(result).toEqual([
      { id: 1, nombre: 'Juan Pérez', rut: '11111111-1', correo: 'juan@alum.cl', curso: '1A', telefono: '123', cursosAsociados: ['Mate'] },
    ]);
  });

  it('llama al endpoint correcto', async () => {
    mockClient.get.mockResolvedValue({ data: [] });
    await studentsService.listStudents();
    expect(mockClient.get).toHaveBeenCalledWith('/api/students');
  });

  it('retorna arreglo vacío si la respuesta no es un array', async () => {
    mockClient.get.mockResolvedValue({ data: null });
    const result = await studentsService.listStudents();
    expect(result).toEqual([]);
  });

  it('usa valores por defecto cuando faltan campos opcionales', async () => {
    mockClient.get.mockResolvedValue({
      data: [{ id: 2, name: 'María', grade: '2B' }],
    });
    const result = await studentsService.listStudents();
    expect(result[0].correo).toBe('');
    expect(result[0].telefono).toBe('');
    expect(result[0].cursosAsociados).toEqual([]);
  });
});

// ── createStudent ──────────────────────────────────────────────────────────────

describe('studentsService.createStudent', () => {
  it('mapea el payload del frontend al formato backend antes de enviarlo', async () => {
    mockClient.post.mockResolvedValue({
      data: { id: 5, name: 'Pedro', grade: '3C', rut: '22222222-2' },
    });

    await studentsService.createStudent({ nombre: 'Pedro', curso: '3C' });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/api/students',
      expect.objectContaining({ name: 'Pedro', grade: '3C' })
    );
  });

  it('retorna el estudiante creado mapeado a formato frontend', async () => {
    mockClient.post.mockResolvedValue({
      data: { id: 5, name: 'Pedro', grade: '3C', rut: '22222222-2' },
    });

    const result = await studentsService.createStudent({ nombre: 'Pedro', curso: '3C' });

    expect(result.nombre).toBe('Pedro');
    expect(result.curso).toBe('3C');
  });

  it('genera un rut temporal si no se provee uno', async () => {
    mockClient.post.mockResolvedValue({ data: { id: 6, name: 'Ana', grade: '1A' } });
    await studentsService.createStudent({ nombre: 'Ana', curso: '1A' });

    const sentPayload = mockClient.post.mock.calls[0][1];
    expect(sentPayload.rut).toMatch(/^\d+-\d+$/);
  });

  it('usa el rut provisto si existe en el payload', async () => {
    mockClient.post.mockResolvedValue({ data: { id: 7, name: 'Luis', grade: '2A' } });
    await studentsService.createStudent({ nombre: 'Luis', curso: '2A', rut: '99999999-9' });

    const sentPayload = mockClient.post.mock.calls[0][1];
    expect(sentPayload.rut).toBe('99999999-9');
  });
});

// ── getStudentById ─────────────────────────────────────────────────────────────

describe('studentsService.getStudentById', () => {
  it('retorna el estudiante mapeado si existe', async () => {
    mockClient.get.mockResolvedValue({ data: { id: 1, name: 'Juan', grade: '1A' } });
    const result = await studentsService.getStudentById(1);
    expect(result.nombre).toBe('Juan');
  });

  it('retorna null si la respuesta no tiene datos', async () => {
    mockClient.get.mockResolvedValue({ data: null });
    const result = await studentsService.getStudentById(999);
    expect(result).toBeNull();
  });

  it('llama al endpoint correcto con el id', async () => {
    mockClient.get.mockResolvedValue({ data: { id: 1, name: 'X', grade: '1A' } });
    await studentsService.getStudentById(42);
    expect(mockClient.get).toHaveBeenCalledWith('/api/students/42');
  });
});

// ── updateStudent ──────────────────────────────────────────────────────────────

describe('studentsService.updateStudent', () => {
  it('llama al endpoint PUT correcto con el payload mapeado', async () => {
    mockClient.put.mockResolvedValue({ data: { id: 1, name: 'Juan Actualizado', grade: '2A' } });

    await studentsService.updateStudent(1, { nombre: 'Juan Actualizado', curso: '2A' });

    expect(mockClient.put).toHaveBeenCalledWith(
      '/api/students/1',
      expect.objectContaining({ name: 'Juan Actualizado', grade: '2A' })
    );
  });

  it('retorna el estudiante actualizado mapeado', async () => {
    mockClient.put.mockResolvedValue({ data: { id: 1, name: 'Actualizado', grade: '2A' } });
    const result = await studentsService.updateStudent(1, { nombre: 'Actualizado', curso: '2A' });
    expect(result.nombre).toBe('Actualizado');
  });

  it('retorna null si la respuesta no tiene datos', async () => {
    mockClient.put.mockResolvedValue({ data: null });
    const result = await studentsService.updateStudent(999, { nombre: 'X', curso: '1A' });
    expect(result).toBeNull();
  });
});

// ── listStudentCourses ─────────────────────────────────────────────────────────

describe('studentsService.listStudentCourses', () => {
  it('retorna la lista de cursos del estudiante', async () => {
    mockClient.get.mockResolvedValue({ data: ['Matemáticas', 'Historia'] });
    const result = await studentsService.listStudentCourses(1);
    expect(result).toEqual(['Matemáticas', 'Historia']);
  });

  it('retorna arreglo vacío si no hay datos', async () => {
    mockClient.get.mockResolvedValue({ data: null });
    const result = await studentsService.listStudentCourses(1);
    expect(result).toEqual([]);
  });

  it('llama al endpoint correcto', async () => {
    mockClient.get.mockResolvedValue({ data: [] });
    await studentsService.listStudentCourses(7);
    expect(mockClient.get).toHaveBeenCalledWith('/api/students/7/courses');
  });
});