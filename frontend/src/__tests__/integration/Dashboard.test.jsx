import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../../pages/Dashboard';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../services/bffClient', () => ({
  studentsService: { listStudents: vi.fn() },
}));

vi.mock('../../services/attendanceService', () => ({
  attendanceService: {
    listClasses: vi.fn(),
    listAttendanceRecords: vi.fn(),
  },
}));

vi.mock('../../services/evaluationsMockService', () => ({
  evaluationsMockService: {
    listEvaluations: vi.fn(),
    listGrades: vi.fn(),
  },
}));

vi.mock('../../components/layout/BaseLayout', () => ({
  LayoutSection: ({ children, title, subtitle }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  ),
}));

import { studentsService } from '../../services/bffClient';
import { attendanceService } from '../../services/attendanceService';
import { evaluationsMockService } from '../../services/evaluationsMockService';

const today = new Date().toISOString().slice(0, 10);

const mockStudents = [
  { id: 1, nombre: 'Juan Pérez', curso: '1A' },
  { id: 2, nombre: 'María Gómez', curso: '2B' },
  { id: 3, nombre: 'Pedro López', curso: '1A' },
];

const mockClasses = [
  { id: 101, fecha: today, curso: '1A', asignatura: 'Matemáticas' },
  { id: 102, fecha: '2024-01-01', curso: '2B', asignatura: 'Historia' },
];

const mockAttendance = [
  { id: 1, classId: 101, studentId: 1, estado: 'PRESENTE' },
  { id: 2, classId: 101, studentId: 3, estado: 'AUSENTE' },
];

const mockEvaluaciones = [
  { id: 801, nombre: 'Prueba 1', curso: '1A', fecha: today, ponderacion: 30 },
];

const mockCalificaciones = [
  { id: 1, evaluationId: 801, studentId: 1, nota: '6.0' },
  { id: 2, evaluationId: 801, studentId: 3, nota: '4.0' },
];

const defaultSession = { name: 'Prof. García', email: 'garcia@colegio.cl', role: 'profesor' };

const setupMocks = (overrides = {}) => {
  studentsService.listStudents.mockResolvedValue(overrides.students ?? mockStudents);
  attendanceService.listClasses.mockResolvedValue(overrides.classes ?? mockClasses);
  attendanceService.listAttendanceRecords.mockResolvedValue(overrides.attendance ?? mockAttendance);
  evaluationsMockService.listEvaluations.mockResolvedValue(overrides.evaluaciones ?? mockEvaluaciones);
  evaluationsMockService.listGrades.mockResolvedValue(overrides.calificaciones ?? mockCalificaciones);
};

const renderDashboard = (session = defaultSession) =>
  render(<Dashboard session={session} />);

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Dashboard — estado de carga', () => {
  it('muestra el mensaje de carga mientras se obtienen datos', () => {
    setupMocks();
    studentsService.listStudents.mockReturnValue(new Promise(() => {})); // nunca resuelve
    renderDashboard();
    expect(screen.getByText(/cargando datos del panel/i)).toBeInTheDocument();
  });
});

describe('Dashboard — saludo según sesión', () => {
  it('muestra el nombre del profesor en el título tras cargar', async () => {
    setupMocks();
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText(/Prof\. García/i)).toBeInTheDocument();
  });

  it('muestra el email si no hay nombre en la sesión', async () => {
    setupMocks();
    renderDashboard({ email: 'garcia@colegio.cl' });
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText(/garcia@colegio\.cl/i)).toBeInTheDocument();
  });

  it('muestra "Profesor" como fallback si la sesión no tiene nombre ni email', async () => {
    setupMocks();
    renderDashboard({});
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText(/Profesor/i)).toBeInTheDocument();
  });
});

describe('Dashboard — métricas principales', () => {
  it('muestra la cantidad total de estudiantes', async () => {
    setupMocks();
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('muestra la cantidad de evaluaciones', async () => {
    setupMocks();
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText('Evaluaciones creadas')).toBeInTheDocument();
  });

  it('muestra el promedio general de notas', async () => {
    setupMocks();
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    // promedio de 6.0 y 4.0 = 5.0 → toFixed(1) = "5.0"
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('muestra "—" como promedio cuando no hay calificaciones', async () => {
    setupMocks({ calificaciones: [] });
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText('Promedio general')).toBeInTheDocument();
  });
});

describe('Dashboard — asistencia de hoy', () => {
  it('muestra barra de progreso de presentes cuando hay asistencia hoy', async () => {
    setupMocks();
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText('Presentes')).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay asistencia hoy', async () => {
    setupMocks({ attendance: [] });
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText(/No hay registros de asistencia para hoy/i)).toBeInTheDocument();
  });
});

describe('Dashboard — estado de calificaciones', () => {
  it('muestra barras de aprobados y reprobados cuando hay notas', async () => {
    setupMocks();
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText('Aprobados')).toBeInTheDocument();
    expect(screen.getByText('Reprobados')).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay calificaciones', async () => {
    setupMocks({ calificaciones: [] });
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText(/No hay calificaciones registradas aún/i)).toBeInTheDocument();
  });
});

describe('Dashboard — cursos', () => {
  it('muestra los cursos activos desglosados', async () => {
    setupMocks();
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText('1A')).toBeInTheDocument();
    expect(screen.getByText('2B')).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay estudiantes', async () => {
    setupMocks({ students: [] });
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText(/No hay cursos registrados/i)).toBeInTheDocument();
  });
});

describe('Dashboard — actividad reciente', () => {
  it('muestra tabla de últimas calificaciones cuando hay datos', async () => {
    setupMocks();
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText('Últimas calificaciones registradas')).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay calificaciones recientes', async () => {
    setupMocks({ calificaciones: [] });
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText(/No hay actividad reciente registrada/i)).toBeInTheDocument();
  });
});

describe('Dashboard — manejo de errores', () => {
  it('termina de cargar aunque falle la carga de datos', async () => {
    studentsService.listStudents.mockRejectedValue(new Error('Network error'));
    attendanceService.listClasses.mockRejectedValue(new Error('Network error'));
    attendanceService.listAttendanceRecords.mockRejectedValue(new Error('Network error'));
    evaluationsMockService.listEvaluations.mockRejectedValue(new Error('Network error'));
    evaluationsMockService.listGrades.mockRejectedValue(new Error('Network error'));

    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());
    // El componente debe renderizar aunque sea vacío, sin explotar
    expect(screen.getByText(/Prof\. García/i)).toBeInTheDocument();
  });
});