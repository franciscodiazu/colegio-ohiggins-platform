import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluationsService } from '../../services/evaluationsService';

vi.mock('../../services/bffClient', () => {
  const mockBffClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  };
  return { bffClient: mockBffClient };
});

import { bffClient } from '../../services/bffClient';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('evaluationsService.listEvaluations', () => {
  it('retorna las evaluaciones del backend', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 1, nombre: 'Prueba 1' }] });
    const result = await evaluationsService.listEvaluations();
    expect(result).toEqual([{ id: 1, nombre: 'Prueba 1' }]);
  });

  it('llama al endpoint correcto', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await evaluationsService.listEvaluations();
    expect(bffClient.get).toHaveBeenCalledWith('/api/evaluaciones');
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: null });
    const result = await evaluationsService.listEvaluations();
    expect(result).toEqual([]);
  });

  it('relanza el error si la petición falla', async () => {
    bffClient.get.mockRejectedValue(new Error('Network error'));
    await expect(evaluationsService.listEvaluations()).rejects.toThrow('Network error');
  });
});

describe('evaluationsService.createEvaluation', () => {
  it('crea una evaluación válida', async () => {
    bffClient.post.mockResolvedValue({ data: { id: 2, nombre: 'Prueba 2' } });
    const result = await evaluationsService.createEvaluation({ nombre: 'Prueba 2', curso: '1A', fecha: '2026-07-01' });
    expect(result).toEqual({ id: 2, nombre: 'Prueba 2' });
  });

  it('llama a bffClient.post con el endpoint y payload correctos', async () => {
    bffClient.post.mockResolvedValue({ data: { id: 3 } });
    const payload = { nombre: 'Prueba 3', curso: '2B', fecha: '2026-07-02', ponderacion: 30 };
    await evaluationsService.createEvaluation(payload);
    expect(bffClient.post).toHaveBeenCalledWith('/api/evaluaciones', payload);
  });

  it('relanza el error si el servicio falla', async () => {
    bffClient.post.mockRejectedValue(new Error('Server error'));
    await expect(
      evaluationsService.createEvaluation({ nombre: 'X', curso: '1A', fecha: '2026-01-01' })
    ).rejects.toThrow('Server error');
  });
});

describe('evaluationsService.updateEvaluation', () => {
  const validUpdate = { nombre: 'Actualizado', curso: '1A', fecha: '2026-07-15' };

  it('actualiza una evaluación existente', async () => {
    bffClient.put.mockResolvedValue({ data: { id: 1, nombre: 'Actualizado' } });
    const result = await evaluationsService.updateEvaluation(1, validUpdate);
    expect(result).toEqual({ id: 1, nombre: 'Actualizado' });
  });

  it('llama a bffClient.put con el endpoint y payload correctos', async () => {
    bffClient.put.mockResolvedValue({ data: {} });
    await evaluationsService.updateEvaluation(5, validUpdate);
    expect(bffClient.put).toHaveBeenCalledWith('/api/evaluaciones/5', { ...validUpdate, ponderacion: 30 });
  });

  it('relanza el error si falla', async () => {
    bffClient.put.mockRejectedValue(new Error('Not found'));
    await expect(evaluationsService.updateEvaluation(99, validUpdate)).rejects.toThrow('Not found');
  });
});

describe('evaluationsService.listEvaluationsByCourse', () => {
  it('llama al endpoint correcto con el nombre del curso', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await evaluationsService.listEvaluationsByCourse('1A');
    expect(bffClient.get).toHaveBeenCalledWith('/api/evaluaciones/curso/1A');
  });

  it('retorna las evaluaciones filtradas', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 1, curso: '1A' }] });
    const result = await evaluationsService.listEvaluationsByCourse('1A');
    expect(result).toEqual([{ id: 1, curso: '1A' }]);
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: null });
    const result = await evaluationsService.listEvaluationsByCourse('1A');
    expect(result).toEqual([]);
  });
});

describe('evaluationsService.listGrades', () => {
  it('retorna las calificaciones del backend', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 1, nota: '6.0' }] });
    const result = await evaluationsService.listGrades();
    expect(result).toEqual([{ id: 1, nota: '6.0' }]);
  });

  it('llama al endpoint correcto', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await evaluationsService.listGrades();
    expect(bffClient.get).toHaveBeenCalledWith('/api/evaluaciones/calificaciones');
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: undefined });
    const result = await evaluationsService.listGrades();
    expect(result).toEqual([]);
  });

  it('relanza el error si falla', async () => {
    bffClient.get.mockRejectedValue(new Error('fail'));
    await expect(evaluationsService.listGrades()).rejects.toThrow('fail');
  });
});

describe('evaluationsService.createGrade', () => {
  it('crea una calificación válida', async () => {
    bffClient.post.mockResolvedValue({ data: { id: 10, nota: '5.5' } });
    const result = await evaluationsService.createGrade({ evaluationId: 1, studentId: 2, nota: '5.5' });
    expect(result).toEqual({ id: 10, nota: '5.5' });
  });

  it('llama a bffClient.post con el endpoint correcto', async () => {
    bffClient.post.mockResolvedValue({ data: {} });
    const payload = { evaluationId: 1, studentId: 2, nota: '4.0' };
    await evaluationsService.createGrade(payload);
    expect(bffClient.post).toHaveBeenCalledWith('/api/evaluaciones/calificaciones', payload);
  });

  it('relanza el error si falla', async () => {
    bffClient.post.mockRejectedValue(new Error('Conflict'));
    await expect(
      evaluationsService.createGrade({ evaluationId: 1, studentId: 2, nota: '4.0' })
    ).rejects.toThrow('Conflict');
  });
});

describe('evaluationsService.listGradesByStudent', () => {
  it('llama al endpoint correcto con el studentId', async () => {
    bffClient.get.mockResolvedValue({ data: [] });
    await evaluationsService.listGradesByStudent(5);
    expect(bffClient.get).toHaveBeenCalledWith('/api/evaluaciones/calificaciones/estudiante/5');
  });

  it('retorna las calificaciones del estudiante', async () => {
    bffClient.get.mockResolvedValue({ data: [{ id: 1, nota: '6.0' }] });
    const result = await evaluationsService.listGradesByStudent(5);
    expect(result).toEqual([{ id: 1, nota: '6.0' }]);
  });

  it('retorna arreglo vacío si no hay data', async () => {
    bffClient.get.mockResolvedValue({ data: null });
    const result = await evaluationsService.listGradesByStudent(5);
    expect(result).toEqual([]);
  });

  it('relanza el error si falla', async () => {
    bffClient.get.mockRejectedValue(new Error('fail'));
    await expect(evaluationsService.listGradesByStudent(5)).rejects.toThrow('fail');
  });
});
