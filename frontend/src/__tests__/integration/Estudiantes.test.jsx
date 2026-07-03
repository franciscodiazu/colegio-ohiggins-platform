import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Estudiantes from '../../pages/Estudiantes';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../services/bffClient', () => ({
  studentsService: {
    listStudents: vi.fn(),
    createStudent: vi.fn(),
    getStudentById: vi.fn(),
    updateStudent: vi.fn(),
    listStudentCourses: vi.fn(),
  },
}));

vi.mock('../../components/layout/BaseLayout', () => ({
  LayoutSection: ({ children }) => <div>{children}</div>,
  LayoutCard: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../components/ConfirmModal', () => ({
  default: ({ open, onConfirm, onCancel, title }) =>
    open ? (
      <div role="dialog">
        <p>{title}</p>
        <button onClick={onConfirm}>Sí, actualizar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    ) : null,
}));

vi.mock('../../components/TableSkeleton', () => ({
  default: () => <tbody><tr><td>Cargando...</td></tr></tbody>,
}));

import { studentsService } from '../../services/bffClient';

const mockStudents = [
  { id: 1001, nombre: 'Juan Pérez', correo: 'juan@alum.cl', curso: '1A', telefono: '+56 9 1111', cursosAsociados: ['Matemáticas'] },
  { id: 1002, nombre: 'María Gómez', correo: 'maria@alum.cl', curso: '2B', telefono: '+56 9 2222', cursosAsociados: ['Biología'] },
];

const setupMocks = (overrides = {}) => {
  studentsService.listStudents.mockResolvedValue(overrides.students ?? mockStudents);
  studentsService.getStudentById.mockResolvedValue(overrides.getById ?? mockStudents[0]);
  studentsService.createStudent.mockResolvedValue(overrides.created ?? { ...mockStudents[0], id: 1003 });
  studentsService.updateStudent.mockResolvedValue(overrides.updated ?? mockStudents[0]);
  studentsService.listStudentCourses.mockResolvedValue(overrides.courses ?? ['Matemáticas', 'Lenguaje']);
};

const waitForLoad = () =>
  waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

// Helpers para apuntar exclusivamente al formulario de CREACIÓN (evita ambigüedad
// con el formulario de edición, que coexiste porque el primer estudiante se
// auto-selecciona al cargar).
const getCreateNombreInput = () => document.getElementById('create-est-nombre');
const getCreateCorreoInput = () => document.getElementById('create-est-correo');
const getCreateCursoInput = () => document.getElementById('create-est-curso');

beforeEach(() => vi.clearAllMocks());

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Estudiantes — renderizado inicial', () => {
  it('muestra el formulario de registro', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();
    expect(getCreateNombreInput()).toBeInTheDocument();
    expect(getCreateCorreoInput()).toBeInTheDocument();
    expect(getCreateCursoInput()).toBeInTheDocument();
  });

  it('muestra la tabla de estudiantes con datos cargados', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();
    const table = screen.getByRole('table');
    expect(within(table).getByText('Juan Pérez')).toBeInTheDocument();
    expect(within(table).getByText('María Gómez')).toBeInTheDocument();
  });

  it('muestra el total de estudiantes en el resumen', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();
    expect(screen.getByText('Estudiantes registrados')).toBeInTheDocument();
    const summaryValues = screen.getAllByText('2');
    expect(summaryValues.length).toBeGreaterThan(0);
  });

  it('muestra mensaje vacío si no hay estudiantes', async () => {
    setupMocks({ students: [] });
    studentsService.getStudentById.mockResolvedValue(null);
    render(<Estudiantes />);
    await waitForLoad();
    expect(screen.getByText(/No hay estudiantes registrados/i)).toBeInTheDocument();
  });
});

describe('Estudiantes — registro de nuevo estudiante', () => {
  it('muestra error de validación si se envía el formulario vacío', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();

    await userEvent.click(screen.getByRole('button', { name: /registrar estudiante/i }));

    expect(screen.getByText(/nombre, correo y curso son obligatorios/i)).toBeInTheDocument();
  });

  it('llama a createStudent con los datos correctos', async () => {
    setupMocks();
    studentsService.listStudents
      .mockResolvedValueOnce(mockStudents)
      .mockResolvedValue([...mockStudents, { id: 1003, nombre: 'Nuevo', correo: 'nuevo@alum.cl', curso: '3C', telefono: '', cursosAsociados: [] }]);

    render(<Estudiantes />);
    await waitForLoad();

    await userEvent.type(getCreateNombreInput(), 'Nuevo Estudiante');
    await userEvent.type(getCreateCorreoInput(), 'nuevo@alum.cl');
    await userEvent.type(getCreateCursoInput(), '3C');
    await userEvent.click(screen.getByRole('button', { name: /registrar estudiante/i }));

    await waitFor(() => expect(studentsService.createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Nuevo Estudiante', correo: 'nuevo@alum.cl', curso: '3C' })
    ));
  });

  it('muestra mensaje de éxito tras registrar correctamente', async () => {
    setupMocks();
    studentsService.listStudents.mockResolvedValue(mockStudents);
    render(<Estudiantes />);
    await waitForLoad();

    await userEvent.type(getCreateNombreInput(), 'Test');
    await userEvent.type(getCreateCorreoInput(), 'test@alum.cl');
    await userEvent.type(getCreateCursoInput(), '1A');
    await userEvent.click(screen.getByRole('button', { name: /registrar estudiante/i }));

    await waitFor(() =>
      expect(screen.getByText(/estudiante registrado correctamente/i)).toBeInTheDocument()
    );
  });

  it('muestra error si el servicio falla al registrar', async () => {
    setupMocks();
    studentsService.createStudent.mockRejectedValue(new Error('Error de red'));
    render(<Estudiantes />);
    await waitForLoad();

    await userEvent.type(getCreateNombreInput(), 'Test');
    await userEvent.type(getCreateCorreoInput(), 'test@alum.cl');
    await userEvent.type(getCreateCursoInput(), '1A');
    await userEvent.click(screen.getByRole('button', { name: /registrar estudiante/i }));

    await waitFor(() =>
      expect(screen.getByText(/Error de red/)).toBeInTheDocument()
    );
  });
});

describe('Estudiantes — selección y detalle', () => {
  it('muestra el detalle del estudiante al hacer clic en "Ver detalle"', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();

    const botonesDetalle = screen.getAllByRole('button', { name: /ver detalle/i });
    await userEvent.click(botonesDetalle[0]);

    await waitFor(() =>
      expect(screen.getAllByText(/Juan Pérez/i).length).toBeGreaterThanOrEqual(1)
    );
  });

  it('muestra mensaje de hint cuando no hay estudiante seleccionado', async () => {
    setupMocks({ students: [] });
    studentsService.getStudentById.mockResolvedValue(null);
    render(<Estudiantes />);
    await waitForLoad();
    expect(screen.getByText(/selecciona un estudiante del listado/i)).toBeInTheDocument();
  });
});

describe('Estudiantes — actualización', () => {
  it('abre el modal de confirmación al enviar el formulario de edición', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();

    // El primer estudiante se selecciona automáticamente
    await waitFor(() => expect(document.getElementById('edit-est-nombre')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /actualizar información/i }));

    await waitFor(() =>
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    );
  });

  it('llama a updateStudent al confirmar en el modal', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();

    await waitFor(() => expect(document.getElementById('edit-est-nombre')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /actualizar información/i }));

    await waitFor(() => screen.getByRole('dialog'));
    await userEvent.click(screen.getByRole('button', { name: /sí, actualizar/i }));

    await waitFor(() =>
      expect(studentsService.updateStudent).toHaveBeenCalled()
    );
  });

  it('cierra el modal al cancelar', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();

    await waitFor(() => expect(document.getElementById('edit-est-nombre')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /actualizar información/i }));

    await waitFor(() => screen.getByRole('dialog'));
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });
});

describe('Estudiantes — consultar cursos', () => {
  it('llama a listStudentCourses al hacer clic en "Consultar cursos asociados"', async () => {
    setupMocks();
    render(<Estudiantes />);
    await waitForLoad();

    await waitFor(() => screen.getByRole('button', { name: /consultar cursos asociados/i }));
    await userEvent.click(screen.getByRole('button', { name: /consultar cursos asociados/i }));

    await waitFor(() =>
      expect(studentsService.listStudentCourses).toHaveBeenCalled()
    );
  });
});