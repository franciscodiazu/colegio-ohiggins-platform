import { useEffect, useMemo, useState } from 'react';
import { LayoutSection } from '../components/layout/BaseLayout';
import { studentsService } from '../services/bffClient';
import { attendanceMockService } from '../services/attendanceMockService';
import { evaluationsMockService } from '../services/evaluationsMockService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcularPorcentaje = (parcial, total) => {
  if (!total) return 0;
  return Math.round((parcial / total) * 100);
};

const calcularPromedio = (notas) => {
  if (!notas.length) return null;
  const suma = notas.reduce((acc, n) => acc + Number(n.nota), 0);
  return (suma / notas.length).toFixed(1);
};

// ─── Subcomponente: tarjeta de métrica ────────────────────────────────────────

function MetricCard({ label, value, sub, accent }) {
  return (
    <div className={`dash-metric-card dash-metric-card--${accent}`}>
      <p className="dash-metric-card__label">{label}</p>
      <p className="dash-metric-card__value">{value ?? '—'}</p>
      {sub ? <p className="dash-metric-card__sub">{sub}</p> : null}
    </div>
  );
}

// ─── Subcomponente: barra de progreso ─────────────────────────────────────────

function ProgressBar({ label, value, total, color }) {
  const pct = calcularPorcentaje(value, total);
  return (
    <div className="dash-progress-row">
      <div className="dash-progress-row__header">
        <span className="dash-progress-row__label">{label}</span>
        <span className="dash-progress-row__pct">{pct}%</span>
      </div>
      <div className="dash-progress-track">
        <div
          className="dash-progress-fill"
          style={{ width: `${pct}%`, background: color }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="dash-progress-row__detail">{value} de {total}</p>
    </div>
  );
}

// ─── Subcomponente: tabla de actividad reciente ────────────────────────────────

function RecentActivity({ rows }) {
  if (!rows.length) {
    return <p className="empty-state-cell">No hay actividad reciente registrada.</p>;
  }

  return (
    <table className="app-table">
      <thead>
        <tr>
          <th>Estudiante</th>
          <th>Evaluación</th>
          <th>Nota</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.studentNombre}</td>
            <td>{row.evaluationNombre}</td>
            <td className={Number(row.nota) >= 4 ? 'grade grade--pass' : 'grade grade--fail'}>
              {row.nota}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Subcomponente: resumen por curso ─────────────────────────────────────────

function CourseBreakdown({ courses, students }) {
  if (!courses.length) {
    return <p className="empty-state-cell">No hay cursos registrados.</p>;
  }

  return (
    <div className="dash-course-list">
      {courses.map((curso) => {
        const total = students.filter((s) => s.curso === curso).length;
        return (
          <div key={curso} className="dash-course-item">
            <span className="dash-course-item__name">{curso}</span>
            <span className="dash-course-item__count">{total} estudiante{total !== 1 ? 's' : ''}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Dashboard({ session }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [studentsList, classesList, attendanceList, evalList, gradesList] = await Promise.all([
          studentsService.listStudents(),
          attendanceMockService.listClasses(),
          attendanceMockService.listAttendanceRecords(),
          evaluationsMockService.listEvaluations(),
          evaluationsMockService.listGrades(),
        ]);
        setStudents(studentsList);
        setClasses(classesList);
        setAttendanceRecords(attendanceList);
        setEvaluaciones(evalList);
        setCalificaciones(gradesList);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  // ── Estadísticas derivadas ────────────────────────────────────────────────────

  const cursos = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.curso))).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const studentsById = useMemo(() => {
    return students.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
  }, [students]);

  const evaluationsById = useMemo(() => {
    return evaluaciones.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});
  }, [evaluaciones]);

  const today = new Date().toISOString().slice(0, 10);
  const classesToday = classes.filter((c) => c.fecha === today).length;

  const presentesHoy = attendanceRecords.filter((r) => {
    const cls = classes.find((c) => c.id === r.classId);
    return cls?.fecha === today && r.estado === 'PRESENTE';
  }).length;

  const totalAsistenciasHoy = attendanceRecords.filter((r) => {
    const cls = classes.find((c) => c.id === r.classId);
    return cls?.fecha === today;
  }).length;

  const promedio = calcularPromedio(calificaciones);

  const notasAprobadas = calificaciones.filter((g) => Number(g.nota) >= 4).length;
  const notasReprobadas = calificaciones.filter((g) => Number(g.nota) < 4).length;

  // Últimas 5 calificaciones registradas
  const actividadReciente = useMemo(() => {
    return [...calificaciones]
      .slice(-5)
      .reverse()
      .map((g) => ({
        ...g,
        studentNombre: studentsById[g.studentId]?.nombre || '-',
        evaluationNombre: evaluationsById[g.evaluationId]?.nombre || '-',
      }));
  }, [calificaciones, studentsById, evaluationsById]);

  // ── Saludo según hora ─────────────────────────────────────────────────────────

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const nombreMostrado = session?.name || session?.email || 'Profesor';

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <LayoutSection title="Resumen general">
        <p className="dash-loading">Cargando datos del panel...</p>
      </LayoutSection>
    );
  }

  return (
    <LayoutSection
      title={`${saludo}, ${nombreMostrado}`}
      subtitle="Aquí tienes un resumen del estado actual de la plataforma."
    >

      {/* ── Métricas principales ── */}
      <div className="dash-metrics-grid">
        <MetricCard
          label="Estudiantes registrados"
          value={students.length}
          sub={`${cursos.length} curso${cursos.length !== 1 ? 's' : ''} activo${cursos.length !== 1 ? 's' : ''}`}
          accent="blue"
        />
        <MetricCard
          label="Clases registradas"
          value={classes.length}
          sub={classesToday > 0 ? `${classesToday} clase${classesToday !== 1 ? 's' : ''} hoy` : 'Sin clases hoy'}
          accent="indigo"
        />
        <MetricCard
          label="Evaluaciones creadas"
          value={evaluaciones.length}
          sub={`${calificaciones.length} nota${calificaciones.length !== 1 ? 's' : ''} registrada${calificaciones.length !== 1 ? 's' : ''}`}
          accent="teal"
        />
        <MetricCard
          label="Promedio general"
          value={promedio ?? '—'}
          sub={promedio ? (Number(promedio) >= 4 ? 'Curso aprobado' : 'Requiere atención') : 'Sin notas aún'}
          accent={promedio && Number(promedio) >= 4 ? 'green' : 'amber'}
        />
      </div>

      <div className="dash-split">

        {/* ── Panel izquierdo ── */}
        <div className="dash-panel">

          {/* Asistencia de hoy */}
          <div className="dash-section-card">
            <h3 className="dash-section-card__title">Asistencia de hoy</h3>
            {totalAsistenciasHoy > 0 ? (
              <ProgressBar
                label="Presentes"
                value={presentesHoy}
                total={totalAsistenciasHoy}
                color="var(--secondary)"
              />
            ) : (
              <p className="empty-state-cell">No hay registros de asistencia para hoy.</p>
            )}
          </div>

          {/* Aprobación general */}
          <div className="dash-section-card">
            <h3 className="dash-section-card__title">Estado de calificaciones</h3>
            {calificaciones.length > 0 ? (
              <>
                <ProgressBar
                  label="Aprobados"
                  value={notasAprobadas}
                  total={calificaciones.length}
                  color="#18794e"
                />
                <ProgressBar
                  label="Reprobados"
                  value={notasReprobadas}
                  total={calificaciones.length}
                  color="#b91c1c"
                />
              </>
            ) : (
              <p className="empty-state-cell">No hay calificaciones registradas aún.</p>
            )}
          </div>

          {/* Cursos */}
          <div className="dash-section-card">
            <h3 className="dash-section-card__title">Estudiantes por curso</h3>
            <CourseBreakdown courses={cursos} students={students} />
          </div>
        </div>

        {/* ── Panel derecho: actividad reciente ── */}
        <div className="dash-panel">
          <div className="dash-section-card dash-section-card--full">
            <h3 className="dash-section-card__title">Últimas calificaciones registradas</h3>
            <RecentActivity rows={actividadReciente} />
          </div>
        </div>

      </div>
    </LayoutSection>
  );
}