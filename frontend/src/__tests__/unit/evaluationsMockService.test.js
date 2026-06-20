import { describe, it, expect, beforeEach, vi } from 'vitest';
import { evaluationsMockService, convertScoreToGrade } from '../../services/evaluationsMockService';

const STUDENTS_KEY = 'coh_students';
const EVALUATIONS_KEY = 'coh_evaluations';
const GRADES_KEY = 'coh_grades';

const seedStudents = [
  { id: 1, nombre: 'Juan Pérez', curso: '1A' },
  { id: 2, nombre: 'María Gómez', curso: '2B' },
];

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(seedStudents));
});

// ── listEvaluations ────────────────────────────────────────────────────────────

describe('evaluationsMockService.listEvaluations', () => {
  it('retorna las evaluaciones seed la primera vez', async () => {
    const evaluations = await evaluationsMockService.listEvaluations();
    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].nombre).toBe('Diagnostico Matematicas');
  });

  it('persiste el seed en localStorage tras la primera lectura', async () => {
    await evaluationsMockService.listEvaluations();
    expect(localStorage.getItem(EVALUATIONS_KEY)).not.toBeNull();
  });
});

// ── createEvaluation ───────────────────────────────────────────────────────────

describe('evaluationsMockService.createEvaluation', () => {
  it('crea una evaluación válida y la persiste', async () => {
    const created = await evaluationsMockService.createEvaluation({
      nombre: 'Control 1', curso: '1A', fecha: '2026-03-01', ponderacion: '30', descripcion: 'Test',
    });
    expect(created.nombre).toBe('Control 1');
    expect(created.id).toBeGreaterThan(0);
  });

  it('lanza error si falta el nombre', async () => {
    await expect(
      evaluationsMockService.createEvaluation({ nombre: '', curso: '1A', fecha: '2026-03-01', ponderacion: '30' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta el curso', async () => {
    await expect(
      evaluationsMockService.createEvaluation({ nombre: 'Test', curso: '', fecha: '2026-03-01', ponderacion: '30' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta la fecha', async () => {
    await expect(
      evaluationsMockService.createEvaluation({ nombre: 'Test', curso: '1A', fecha: '', ponderacion: '30' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si la ponderación es 0', async () => {
    await expect(
      evaluationsMockService.createEvaluation({ nombre: 'Test', curso: '1A', fecha: '2026-03-01', ponderacion: '0' })
    ).rejects.toThrow(/ponderacion debe estar entre 1 y 100/i);
  });

  it('lanza error si la ponderación es mayor a 100', async () => {
    await expect(
      evaluationsMockService.createEvaluation({ nombre: 'Test', curso: '1A', fecha: '2026-03-01', ponderacion: '150' })
    ).rejects.toThrow(/ponderacion debe estar entre 1 y 100/i);
  });

  it('lanza error si la ponderación no es un número', async () => {
    await expect(
      evaluationsMockService.createEvaluation({ nombre: 'Test', curso: '1A', fecha: '2026-03-01', ponderacion: 'abc' })
    ).rejects.toThrow(/ponderacion debe estar entre 1 y 100/i);
  });

  it('lanza error si el curso no existe entre los estudiantes', async () => {
    await expect(
      evaluationsMockService.createEvaluation({ nombre: 'Test', curso: '9Z', fecha: '2026-03-01', ponderacion: '30' })
    ).rejects.toThrow(/curso existente/i);
  });
});

// ── updateEvaluation ───────────────────────────────────────────────────────────

describe('evaluationsMockService.updateEvaluation', () => {
  it('actualiza una evaluación existente', async () => {
    const updated = await evaluationsMockService.updateEvaluation(801, {
      nombre: 'Actualizada', curso: '1A', fecha: '2026-04-01', ponderacion: '40', descripcion: '',
    });
    expect(updated.nombre).toBe('Actualizada');
    expect(updated.ponderacion).toBe(40);
  });

  it('retorna null si la evaluación no existe', async () => {
    const updated = await evaluationsMockService.updateEvaluation(9999, {
      nombre: 'X', curso: '1A', fecha: '2026-04-01', ponderacion: '40',
    });
    expect(updated).toBeNull();
  });

  it('lanza error de validación igual que createEvaluation', async () => {
    await expect(
      evaluationsMockService.updateEvaluation(801, { nombre: '', curso: '1A', fecha: '2026-04-01', ponderacion: '40' })
    ).rejects.toThrow(/obligatorios/i);
  });
});

// ── listEvaluationsByCourse ────────────────────────────────────────────────────

describe('evaluationsMockService.listEvaluationsByCourse', () => {
  it('filtra evaluaciones por curso', async () => {
    const result = await evaluationsMockService.listEvaluationsByCourse('1A');
    expect(result).toHaveLength(1);
    expect(result[0].curso).toBe('1A');
  });

  it('retorna vacío si el curso no tiene evaluaciones', async () => {
    const result = await evaluationsMockService.listEvaluationsByCourse('9Z');
    expect(result).toHaveLength(0);
  });
});

// ── listGrades ─────────────────────────────────────────────────────────────────

describe('evaluationsMockService.listGrades', () => {
  it('retorna arreglo vacío la primera vez (seed vacío)', async () => {
    const grades = await evaluationsMockService.listGrades();
    expect(grades).toEqual([]);
  });
});

// ── createGrade ────────────────────────────────────────────────────────────────

describe('evaluationsMockService.createGrade', () => {
  it('crea una calificación válida', async () => {
    const created = await evaluationsMockService.createGrade({
      evaluationId: 801, studentId: 1, nota: '6.5', observacion: 'Buen trabajo',
    });
    expect(created.nota).toBe('6.5');
    expect(created.evaluationId).toBe(801);
    expect(created.studentId).toBe(1);
  });

  it('lanza error si falta evaluationId', async () => {
    await expect(
      evaluationsMockService.createGrade({ studentId: 1, nota: '6.0' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si falta studentId', async () => {
    await expect(
      evaluationsMockService.createGrade({ evaluationId: 801, nota: '6.0' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si la nota está vacía', async () => {
    await expect(
      evaluationsMockService.createGrade({ evaluationId: 801, studentId: 1, nota: '' })
    ).rejects.toThrow(/obligatorios/i);
  });

  it('lanza error si la nota es menor a 1.0', async () => {
    await expect(
      evaluationsMockService.createGrade({ evaluationId: 801, studentId: 1, nota: '0.5' })
    ).rejects.toThrow(/rango 1\.0 a 7\.0/i);
  });

  it('lanza error si la nota es mayor a 7.0', async () => {
    await expect(
      evaluationsMockService.createGrade({ evaluationId: 801, studentId: 1, nota: '8.0' })
    ).rejects.toThrow(/rango 1\.0 a 7\.0/i);
  });

  it('lanza error si la evaluación no existe', async () => {
    await expect(
      evaluationsMockService.createGrade({ evaluationId: 9999, studentId: 1, nota: '6.0' })
    ).rejects.toThrow(/evaluacion seleccionada no existe/i);
  });

  it('lanza error si el estudiante no existe', async () => {
    await expect(
      evaluationsMockService.createGrade({ evaluationId: 801, studentId: 9999, nota: '6.0' })
    ).rejects.toThrow(/estudiante seleccionado no existe/i);
  });

  it('lanza error si el estudiante no pertenece al curso de la evaluación', async () => {
    // Estudiante 2 es de 2B, evaluación 801 es de 1A
    await expect(
      evaluationsMockService.createGrade({ evaluationId: 801, studentId: 2, nota: '6.0' })
    ).rejects.toThrow(/no pertenece al curso/i);
  });
});

// ── listGradesByStudent ────────────────────────────────────────────────────────

describe('evaluationsMockService.listGradesByStudent', () => {
  it('filtra calificaciones por estudiante', async () => {
    await evaluationsMockService.createGrade({ evaluationId: 801, studentId: 1, nota: '6.0' });
    const result = await evaluationsMockService.listGradesByStudent(1);
    expect(result).toHaveLength(1);
    expect(result[0].studentId).toBe(1);
  });

  it('retorna vacío si el estudiante no tiene calificaciones', async () => {
    const result = await evaluationsMockService.listGradesByStudent(999);
    expect(result).toEqual([]);
  });
});

// ── convertScoreToGrade ────────────────────────────────────────────────────────

describe('convertScoreToGrade', () => {
  it('retorna 1.0 para puntajes menores a 60', () => {
    expect(convertScoreToGrade(0)).toBe(1.0);
    expect(convertScoreToGrade(59)).toBe(1.0);
  });

  it('retorna 4.0 para puntaje exacto de 60', () => {
    expect(convertScoreToGrade(60)).toBe(4.0);
  });

  it('retorna 7.0 para puntaje de 100', () => {
    expect(convertScoreToGrade(100)).toBe(7.0);
  });

  it('calcula proporcionalmente para puntajes intermedios', () => {
    // 80 -> ((80-60)/40)*3+4 = 5.5
    expect(convertScoreToGrade(80)).toBe(5.5);
  });

  it('lanza error si el puntaje es negativo', () => {
    expect(() => convertScoreToGrade(-1)).toThrow(/entre 0 y 100/i);
  });

  it('lanza error si el puntaje es mayor a 100', () => {
    expect(() => convertScoreToGrade(101)).toThrow(/entre 0 y 100/i);
  });

  it('lanza error si el puntaje no es un número', () => {
    expect(() => convertScoreToGrade('abc')).toThrow(/entre 0 y 100/i);
  });
});

// ── Manejo de errores de lectura ───────────────────────────────────────────────

describe('evaluationsMockService — manejo de errores de localStorage', () => {
  it('retorna arreglo vacío si el JSON almacenado es inválido', async () => {
    localStorage.setItem(EVALUATIONS_KEY, '{not valid json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const evaluations = await evaluationsMockService.listEvaluations();
    expect(evaluations).toEqual([]);
    consoleSpy.mockRestore();
  });
});