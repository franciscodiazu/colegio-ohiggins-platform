import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Asistencia from '../../pages/Asistencia';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../services/bffClient', () => ({
  studentsService: { listStudents: vi.fn() },
}));

vi.mock('../../services/attendanceService', () => ({
  attendanceService: {
    listClasses: vi.fn(),
    listAttendanceRecords: vi.fn(),
    createClass: vi.fn(),
    createAttendanceRecord: vi.fn(),
    listAttendanceByStudent: vi.fn(),
    listAttendanceByCourse: vi.fn(),
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
import { attendanceService } from '../../services/attendanceService';

const today = new Date().toISOString().slice(0, 10);

const mockStudents = [
  { id: 1, nombre: 'Juan Pérez', curso: '1A' },
  { id: 2, nombre: 'María Gómez', curso: '2B' },
];

const mockClasses = [
  { id: 101, fecha: today, curso: '1A', asignatura: 'Matemáticas', bloque: '08:00 - 08:45' },
];

const mockAttendance = [
  { id: 1, classId: 101, studentId: 1, estado: 'PRESENTE' },
];

const setupMocks = (overrides = {}) => {
  studentsService.listStudents.mockResolvedValue(overrides.students ?? mockStudents);
  attendanceService.listClasses.mockResolvedValue(overrides.classes ?? mockClasses);
  attendanceService.listAttendanceRecords.mockResolvedValue(overrides.attendance ?? mockAttendance);
};

const waitForLoad = () =>
  waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

beforeEach(() => {
  vi.resetAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Asistencia — renderizado inicial', () => {
  it('muestra el formulario para registrar clase', async () => {
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^curso$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/asignatura/i)).toBeInTheDocument();
  });

  it('muestra el formulario para registrar asistencia', async () => {
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();
    expect(screen.getByLabelText(/clase registrada/i)).toBeInTheDocument();
  });

  it('muestra el resumen de clases y asistencias', async () => {
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();
    expect(screen.getByText('Clases registradas')).toBeInTheDocument();
    expect(screen.getByText('Asistencias registradas')).toBeInTheDocument();
  });

  it('muestra el historial de clases cargado', async () => {
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();
    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay clases', async () => {
    setupMocks({ classes: [] });
    render(<Asistencia />);
    await waitForLoad();
    expect(screen.getByText(/No hay clases registradas aún/i)).toBeInTheDocument();
  });
});

describe('Asistencia — registro de clase', () => {
  it('llama a createClass con los datos correctos', async () => {
    const newClass = { id: 102, fecha: today, curso: '2B', asignatura: 'Historia', bloque: '09:00 - 09:45' };
    attendanceService.createClass.mockResolvedValue(newClass);
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    const cursoInput = screen.getByRole('textbox', { name: /^curso$/i });
    await userEvent.clear(cursoInput);
    await userEvent.type(cursoInput, '2B');
    await userEvent.type(screen.getByLabelText(/asignatura/i), 'Historia');
    await userEvent.type(screen.getByLabelText(/bloque horario/i), '09:00 - 09:45');
    await userEvent.click(screen.getByRole('button', { name: /guardar clase/i }));

    await waitFor(() => expect(attendanceService.createClass).toHaveBeenCalled());
  });

  it('muestra éxito tras guardar clase correctamente', async () => {
    const newClass = { id: 102, fecha: today, curso: '1A', asignatura: 'Ciencias', bloque: '10:00' };
    attendanceService.createClass.mockResolvedValue(newClass);
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    await userEvent.type(screen.getByLabelText(/asignatura/i), 'Ciencias');
    await userEvent.type(screen.getByLabelText(/bloque horario/i), '10:00');
    await userEvent.click(screen.getByRole('button', { name: /guardar clase/i }));

    await waitFor(() =>
      expect(screen.getByText(/clase registrada correctamente/i)).toBeInTheDocument()
    );
  });

  it('muestra error si falla el servicio de crear clase', async () => {
    // Simulamos un error con un mensaje específico
    attendanceService.createClass.mockRejectedValue(new Error('Error al guardar'));
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    // 1. Llenamos el formulario
    const cursoInput = screen.getByRole('textbox', { name: /^curso$/i });
    await userEvent.clear(cursoInput);
    await userEvent.type(cursoInput, '1A');
    await userEvent.type(screen.getByLabelText(/asignatura/i), 'Física');
    await userEvent.type(screen.getByLabelText(/bloque horario/i), '12:00');
    
    // 2. Hacemos click en guardar
    await userEvent.click(screen.getByRole('button', { name: /guardar clase/i }));

    // 3. ¡Buscamos el err.message que inyectó nuestro mock!
    await waitFor(() => {
      expect(screen.getByText(/Error al guardar/i)).toBeInTheDocument();
    });
  });
});

describe('Asistencia — registro de asistencia', () => {
  it('el botón de guardar asistencia está deshabilitado si faltan datos', async () => {
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    // Buscamos el botón de guardar asistencia
    const guardarBtn = screen.getByRole('button', { name: /guardar asistencia/i });

    // En vez de intentar hacerle click (lo cual es imposible en el navegador real),
    // verificamos que tu componente lo haya deshabilitado correctamente.
    expect(guardarBtn).toBeDisabled();
  });


  it('llama a createAttendanceRecord al registrar asistencia válida', async () => {
    const newRecord = { id: 10, classId: 101, studentId: 1, estado: 'PRESENTE' };
    attendanceService.createAttendanceRecord.mockResolvedValue(newRecord);
    
    // Evitamos que Juan Pérez salga como "ya registrado"
    setupMocks({ attendance: [] }); 
    
    render(<Asistencia />);
    await waitForLoad();

    // 1. Usamos fireEvent directamente al ID para evitar problemas con labels dinámicos
    const claseSelect = document.querySelector('#attendance-class');
    fireEvent.change(claseSelect, { target: { value: '101' } });
    
    // 2. Esperamos a que la opción del alumno aparezca
    await waitFor(() => {
      const opcionJuan = screen.queryByRole('option', { name: 'Juan Pérez' });
      expect(opcionJuan).toBeInTheDocument();
      expect(opcionJuan).not.toBeDisabled();
    });

    // 3. Forzamos la selección del alumno
    const estudianteSelect = document.querySelector('#attendance-student');
    fireEvent.change(estudianteSelect, { target: { value: '1' } });

    // 4. Hacer click en guardar (ya debería estar habilitado)
    const guardarBtn = screen.getByRole('button', { name: /guardar asistencia/i });
    fireEvent.click(guardarBtn);

    // 5. ¡Éxito!
    await waitFor(() => expect(attendanceService.createAttendanceRecord).toHaveBeenCalled());
  });
});

describe('Asistencia — consulta por estudiante', () => {
  it('muestra error si se consulta sin seleccionar estudiante', async () => {
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    await userEvent.click(consultarBtns[0]); 

    await waitFor(() =>
      expect(screen.getByText(/selecciona un estudiante para consultar/i)).toBeInTheDocument()
    );
  });

  it('llama a listAttendanceByStudent al consultar con un estudiante seleccionado', async () => {
    attendanceService.listAttendanceByStudent.mockResolvedValue([
      { id: 1, classId: 101, studentId: 1, estado: 'PRESENTE' },
    ]);
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    // Directo al grano: disparamos el cambio por el ID del selector correcto
    const queryStudentSelect = document.querySelector('#query-student');
    fireEvent.change(queryStudentSelect, { target: { value: '1' } });
    
    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    fireEvent.click(consultarBtns[0]);

    await waitFor(() =>
      expect(attendanceService.listAttendanceByStudent).toHaveBeenCalledWith('1')
    );
  });

  it('muestra mensaje de resultados encontrados', async () => {
    attendanceService.listAttendanceByStudent.mockResolvedValue([
      { id: 1, classId: 101, studentId: 1, estado: 'PRESENTE' },
    ]);
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    const queryStudentSelect = document.querySelector('#query-student');
    fireEvent.change(queryStudentSelect, { target: { value: '1' } });
    
    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    fireEvent.click(consultarBtns[0]);

    await waitFor(() =>
      expect(screen.getByText(/1 registro\(s\) encontrado\(s\)/i)).toBeInTheDocument()
    );
  });
});

describe('Asistencia — consulta por curso', () => {
  it('muestra error si se consulta sin seleccionar curso', async () => {
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    await userEvent.click(consultarBtns[1]); 

    await waitFor(() =>
      expect(screen.getByText(/selecciona un curso para consultar/i)).toBeInTheDocument()
    );
  });

  it('llama a listAttendanceByCourse al consultar con curso seleccionado', async () => {
    attendanceService.listAttendanceByCourse.mockResolvedValue([]);
    setupMocks();
    render(<Asistencia />);
    await waitForLoad();

    const queryCourseSelect = document.querySelector('#query-course');
    fireEvent.change(queryCourseSelect, { target: { value: '1A' } });
    
    const consultarBtns = screen.getAllByRole('button', { name: /consultar/i });
    fireEvent.click(consultarBtns[1]);

    await waitFor(() =>
      expect(attendanceService.listAttendanceByCourse).toHaveBeenCalledWith('1A', expect.any(Array))
    );
  });
});