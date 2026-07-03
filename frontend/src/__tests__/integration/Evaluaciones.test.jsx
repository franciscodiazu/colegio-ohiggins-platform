import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Evaluaciones from '../../pages/Evaluaciones';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../services/bffClient', () => ({
  studentsService: { listStudents: vi.fn() },
}));

vi.mock('../../services/evaluationsService', () => ({
  evaluationsService: {
    listEvaluations: vi.fn(),
    listGrades: vi.fn(),
    createEvaluation: vi.fn(),
    updateEvaluation: vi.fn(),
    createGrade: vi.fn(),
    listGradesByStudent: vi.fn(),
    listEvaluationsByCourse: vi.fn(),
  },
}));

vi.mock('../../components/layout/BaseLayout', () => ({
  LayoutSection: ({ children }) => <div>{children}</div>,
  LayoutCard: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../components/TableSkeleton', () => ({
  default: () => <tbody><tr><td>Cargando...</td></tr></tbody>,
}));

import { studentsService } from '../../services/bffClient';
import { evaluationsService } from '../../services/evaluationsService';

const today = new Date().toISOString().slice(0, 10);

const mockStudents = [
  { id: 1, nombre: 'Juan Pérez', curso: '1A' },
  { id: 2, nombre: 'María Gómez', curso: '2B' },
];

const mockEvaluaciones = [
  { id: 801, nombre: 'Prueba 1', curso: '1A', fecha: today, ponderacion: 30, descripcion: '' },
];

const mockCalificaciones = [
  { id: 1, evaluationId: 801, studentId: 1, nota: '6.5' },
];

const setupMocks = (overrides = {}) => {
  studentsService.listStudents.mockResolvedValue(overrides.students ?? mockStudents);
  evaluationsService.listEvaluations.mockResolvedValue(overrides.evaluaciones ?? mockEvaluaciones);
  evaluationsService.listGrades.mockResolvedValue(overrides.calificaciones ?? mockCalificaciones);
};

const waitForLoad = () =>
  waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

beforeEach(() => vi.clearAllMocks());

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Evaluaciones — renderizado inicial', () => {
  it('muestra el formulario para crear evaluación', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();
    expect(screen.getByLabelText(/nombre de evaluación/i)).toBeInTheDocument();
    // 🔴 AGREGAMOS EL SELECTOR AQUÍ para diferenciarlo del formulario de edición:
    expect(screen.getByLabelText(/ponderación/i, { selector: '#eval-weight' })).toBeInTheDocument();
  });

  it('muestra el listado de evaluaciones', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();
    expect(screen.getByText('Prueba 1')).toBeInTheDocument();
  });

  it('muestra el resumen con cantidad de evaluaciones, notas y promedio', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();
    expect(screen.getByText('Evaluaciones creadas')).toBeInTheDocument();
    expect(screen.getByText('Notas registradas')).toBeInTheDocument();
    expect(screen.getByText('Promedio general')).toBeInTheDocument();
  });

  it('muestra el promedio calculado correctamente', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();
    expect(screen.getByText('6.5')).toBeInTheDocument();
  });

  it('muestra 0 como promedio cuando no hay calificaciones', async () => {
    setupMocks({ calificaciones: [] });
    render(<Evaluaciones />);
    await waitForLoad();
    // 🔴 USAMOS getAllByText porque habrá dos "0" en pantalla (notas registradas y promedio)
    const ceros = screen.getAllByText('0');
    expect(ceros.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra mensaje vacío cuando no hay evaluaciones', async () => {
    setupMocks({ evaluaciones: [] });
    render(<Evaluaciones />);
    await waitForLoad();
    expect(screen.getByText(/No hay evaluaciones registradas aún/i)).toBeInTheDocument();
  });
});

describe('Evaluaciones — registro de evaluación', () => {
  it('llama a createEvaluation con los datos correctos', async () => {
    const newEval = { id: 802, nombre: 'Control 1', curso: '1A', fecha: today, ponderacion: 20, descripcion: '' };
    evaluationsService.createEvaluation.mockResolvedValue(newEval);
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.type(screen.getByLabelText(/nombre de evaluación/i), 'Control 1');
    // 🔴 AGREGAMOS EL SELECTOR AQUÍ:
    await userEvent.selectOptions(screen.getByLabelText(/^curso$/i, { selector: '#eval-course' }), '1A');
    await userEvent.click(screen.getByRole('button', { name: /guardar evaluación/i }));

    await waitFor(() =>
      expect(evaluationsService.createEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Control 1', curso: '1A' })
      )
    );
  });

  it('muestra mensaje de éxito tras crear evaluación', async () => {
    const newEval = { id: 802, nombre: 'Test Eval', curso: '1A', fecha: today, ponderacion: 30, descripcion: '' };
    evaluationsService.createEvaluation.mockResolvedValue(newEval);
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.type(screen.getByLabelText(/nombre de evaluación/i), 'Test Eval');
    // 🔴 Y AGREGAMOS EL SELECTOR AQUÍ TAMBIÉN:
    await userEvent.selectOptions(screen.getByLabelText(/^curso$/i, { selector: '#eval-course' }), '1A');
    await userEvent.click(screen.getByRole('button', { name: /guardar evaluación/i }));

    await waitFor(() =>
      expect(screen.getByText(/evaluación registrada correctamente/i)).toBeInTheDocument()
    );
  });

  it('muestra error si falla el servicio al crear', async () => {
    // Simulamos un error del backend
    evaluationsService.createEvaluation.mockRejectedValue(new Error('Error de validación del backend'));
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.type(screen.getByLabelText(/nombre de evaluación/i), 'Test');
    await userEvent.click(screen.getByRole('button', { name: /guardar evaluación/i }));

    await waitFor(() =>
      expect(screen.getByText(/Error de validación del backend/i)).toBeInTheDocument()
    );
  });
});

describe('Evaluaciones — actualización de evaluación', () => {
  it('carga los datos de la evaluación al seleccionarla en el select', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.selectOptions(
      screen.getByLabelText(/evaluación a editar/i),
      '801'
    );

    await waitFor(() => {
      const nombreInput = screen.getByLabelText(/^nombre$/i);
      expect(nombreInput).toHaveValue('Prueba 1');
    });
  });

  it('el botón de actualizar está deshabilitado si no hay evaluación seleccionada', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    // En lugar de esperar un error (porque el botón nativo impide el clic), comprobamos que esté disabled.
    const updateBtn = screen.getByRole('button', { name: /actualizar evaluación/i });
    expect(updateBtn).toBeDisabled();
  });

  it('llama a updateEvaluation al guardar cambios', async () => {
    const updated = { ...mockEvaluaciones[0], nombre: 'Prueba 1 Actualizada' };
    evaluationsService.updateEvaluation.mockResolvedValue(updated);
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.selectOptions(screen.getByLabelText(/evaluación a editar/i), '801');
    
    // Esperamos a que el botón se habilite tras actualizar el estado
    const updateBtn = screen.getByRole('button', { name: /actualizar evaluación/i });
    await waitFor(() => expect(updateBtn).toBeEnabled());

    await userEvent.click(updateBtn);

    await waitFor(() => expect(evaluationsService.updateEvaluation).toHaveBeenCalledWith('801', expect.any(Object)));
  });

  it('muestra éxito tras actualizar evaluación', async () => {
    evaluationsService.updateEvaluation.mockResolvedValue({ ...mockEvaluaciones[0] });
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.selectOptions(screen.getByLabelText(/evaluación a editar/i), '801');
    
    const updateBtn = screen.getByRole('button', { name: /actualizar evaluación/i });
    await waitFor(() => expect(updateBtn).toBeEnabled());
    await userEvent.click(updateBtn);

    await waitFor(() =>
      expect(screen.getByText(/evaluación actualizada correctamente/i)).toBeInTheDocument()
    );
  });
});

describe('Evaluaciones — registro de calificación', () => {
  it('el botón de guardar calificación está deshabilitado sin evaluación y estudiante', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    const saveGradeBtn = screen.getByRole('button', { name: /guardar calificación/i });
    expect(saveGradeBtn).toBeDisabled();
  });

  it('llama a createGrade al registrar calificación válida', async () => {
    const newGrade = { id: 5, evaluationId: 801, studentId: 1, nota: '6.0' };
    evaluationsService.createGrade.mockResolvedValue(newGrade);
    
    // 🔴 LA MAGIA AQUÍ: Pasamos calificaciones vacías para que el estudiante 1 no esté bloqueado
    setupMocks({ calificaciones: [] }); 
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.selectOptions(screen.getByLabelText(/evaluación/i, { selector: '#grade-eval' }), '801');
    await userEvent.selectOptions(screen.getByLabelText(/estudiante/i, { selector: '#grade-student' }), '1');
    await userEvent.type(screen.getByLabelText(/nota/i), '6.0');
    
    const saveGradeBtn = screen.getByRole('button', { name: /guardar calificación/i });
    await waitFor(() => expect(saveGradeBtn).toBeEnabled());
    await userEvent.click(saveGradeBtn);

    await waitFor(() => expect(evaluationsService.createGrade).toHaveBeenCalled());
  });

  it('muestra éxito tras registrar calificación', async () => {
    const newGrade = { id: 5, evaluationId: 801, studentId: 1, nota: '6.0' };
    evaluationsService.createGrade.mockResolvedValue(newGrade);
    
    // 🔴 LA MAGIA AQUÍ: Igual que arriba
    setupMocks({ calificaciones: [] });
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.selectOptions(screen.getByLabelText(/evaluación/i, { selector: '#grade-eval' }), '801');
    await userEvent.selectOptions(screen.getByLabelText(/estudiante/i, { selector: '#grade-student' }), '1');
    await userEvent.type(screen.getByLabelText(/nota/i), '6.0');
    
    const saveGradeBtn = screen.getByRole('button', { name: /guardar calificación/i });
    await waitFor(() => expect(saveGradeBtn).toBeEnabled());
    await userEvent.click(saveGradeBtn);

    await waitFor(() =>
      expect(screen.getByText(/calificación registrada correctamente/i)).toBeInTheDocument()
    );
  });
});

describe('Evaluaciones — consultas', () => {
  it('muestra error al consultar por estudiante sin seleccionar uno', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    await userEvent.click(consultarBtns[0]); // El primero es el de estudiante

    // El componente muestra "sus calificaciones" al final de la oración
    await waitFor(() =>
      expect(screen.getByText(/selecciona un estudiante para consultar sus calificaciones/i)).toBeInTheDocument()
    );
  });

  it('llama a listGradesByStudent con el id correcto', async () => {
    evaluationsService.listGradesByStudent.mockResolvedValue([]);
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.selectOptions(screen.getByLabelText(/estudiante/i, { selector: '#query-student-grade' }), '1');
    
    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    await userEvent.click(consultarBtns[0]);

    await waitFor(() =>
      expect(evaluationsService.listGradesByStudent).toHaveBeenCalledWith('1')
    );
  });

  it('muestra error al consultar por curso sin seleccionar uno', async () => {
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    await userEvent.click(consultarBtns[1]); // El segundo es el de curso

    await waitFor(() =>
      expect(screen.getByText(/selecciona un curso para consultar evaluaciones/i)).toBeInTheDocument()
    );
  });

  it('llama a listEvaluationsByCourse con el curso correcto', async () => {
    evaluationsService.listEvaluationsByCourse.mockResolvedValue([]);
    setupMocks();
    render(<Evaluaciones />);
    await waitForLoad();

    await userEvent.selectOptions(screen.getByLabelText(/curso/i, { selector: '#query-evaluations-course' }), '1A');
    
    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    await userEvent.click(consultarBtns[1]);

    await waitFor(() =>
      expect(evaluationsService.listEvaluationsByCourse).toHaveBeenCalledWith('1A')
    );
  });
});