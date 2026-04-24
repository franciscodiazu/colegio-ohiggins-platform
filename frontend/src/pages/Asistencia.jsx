import { useEffect, useMemo, useState } from 'react';
import { LayoutCard, LayoutSection } from '../components/layout/BaseLayout';
import { attendanceMockService } from '../services/attendanceMockService';
import { studentsMockService } from '../services/studentsMockService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const estadoLabel = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  JUSTIFICADO: 'Justificado',
};

const estadoClass = {
  PRESENTE: 'status-badge status-badge--present',
  AUSENTE: 'status-badge status-badge--absent',
  JUSTIFICADO: 'status-badge status-badge--justified',
};

const emptyFeedback = { error: '', success: '' };

// ─── Componente principal ────────────────────────────────────────────────────

export default function Asistencia() {
  // --- Datos base ---
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);

  // --- Formulario: Registrar clase ---
  const [classForm, setClassForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    curso: '',
    asignatura: '',
    bloque: '',
  });
  const [classFeedback, setClassFeedback] = useState(emptyFeedback);

  // --- Formulario: Registrar asistencia ---
  const [attendanceForm, setAttendanceForm] = useState({
    classId: '',
    studentId: '',
    estado: 'PRESENTE',
    observacion: '',
  });
  const [attendanceFeedback, setAttendanceFeedback] = useState(emptyFeedback);

  // --- Consultas ---
  const [queryStudentId, setQueryStudentId] = useState('');
  const [queryCourse, setQueryCourse] = useState('');
  const [studentQueryRows, setStudentQueryRows] = useState([]);
  const [courseQueryRows, setCourseQueryRows] = useState([]);
  const [queryFeedback, setQueryFeedback] = useState(emptyFeedback);

  // ── Carga inicial ──────────────────────────────────────────────────────────

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [studentsList, classesList, attendanceList] = await Promise.all([
          studentsMockService.listStudents(),
          attendanceMockService.listClasses(),
          attendanceMockService.listAttendanceRecords(),
        ]);
        setStudents(studentsList);
        setClasses(classesList);
        setAttendanceRecords(attendanceList);
      } catch (err) {
        console.error('No se pudo cargar el módulo de asistencia', err);
      }
    };
    bootstrap();
  }, []);

  // ── Mapas derivados ────────────────────────────────────────────────────────

  const classesById = useMemo(() => {
    return classes.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
  }, [classes]);

  const studentsById = useMemo(() => {
    return students.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
  }, [students]);

  const cursosDisponibles = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.curso))).sort((a, b) => a.localeCompare(b));
  }, [students]);

  // ── Filtrado dinámico: estudiantes de la clase seleccionada ────────────────
  // Cuando el usuario elige una clase, solo muestra los estudiantes del mismo curso.

  const studentsForSelectedClass = useMemo(() => {
    if (!attendanceForm.classId) return [];
    const selectedClass = classesById[Number(attendanceForm.classId)];
    if (!selectedClass) return [];
    return students.filter((s) => s.curso === selectedClass.curso);
  }, [attendanceForm.classId, classesById, students]);

  // ── IDs de estudiantes que ya tienen asistencia en la clase seleccionada ──
  // Evita mostrar duplicados en el selector.

  const studentsAlreadyRegistered = useMemo(() => {
    if (!attendanceForm.classId) return new Set();
    const classId = Number(attendanceForm.classId);
    return new Set(
      attendanceRecords
        .filter((r) => r.classId === classId)
        .map((r) => r.studentId),
    );
  }, [attendanceForm.classId, attendanceRecords]);

  // ── Helper: enriquecer registros con datos de clase y estudiante ───────────

  const mapRowsWithContext = (records) => {
    return records.map((record) => {
      const classInfo = classesById[record.classId] || null;
      const studentInfo = studentsById[record.studentId] || null;
      return {
        ...record,
        classFecha: classInfo?.fecha || '-',
        classAsignatura: classInfo?.asignatura || '-',
        classCurso: classInfo?.curso || '-',
        studentNombre: studentInfo?.nombre || '-',
      };
    });
  };

  // ── Métricas del resumen ───────────────────────────────────────────────────

  const today = new Date().toISOString().slice(0, 10);
  const classesToday = classes.filter((c) => c.fecha === today).length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRegisterClass = async (e) => {
    e.preventDefault();
    setClassFeedback(emptyFeedback);
    try {
      const created = await attendanceMockService.createClass(classForm);
      setClasses((prev) => [...prev, created]);
      setClassForm((prev) => ({ ...prev, curso: '', asignatura: '', bloque: '' }));
      setClassFeedback({ error: '', success: 'Clase registrada correctamente.' });
    } catch (err) {
      setClassFeedback({ error: err.message || 'No se pudo registrar la clase.', success: '' });
    }
  };

  const handleRegisterAttendance = async (e) => {
    e.preventDefault();
    setAttendanceFeedback(emptyFeedback);

    if (!attendanceForm.classId || !attendanceForm.studentId) {
      setAttendanceFeedback({ error: 'Debes seleccionar clase y estudiante.', success: '' });
      return;
    }

    try {
      const created = await attendanceMockService.createAttendanceRecord(attendanceForm);
      setAttendanceRecords((prev) => [...prev, created]);
      setAttendanceForm((prev) => ({ ...prev, studentId: '', estado: 'PRESENTE', observacion: '' }));
      setAttendanceFeedback({ error: '', success: 'Asistencia registrada correctamente.' });
    } catch (err) {
      setAttendanceFeedback({ error: err.message || 'No se pudo registrar la asistencia.', success: '' });
    }
  };

  const handleQueryByStudent = async (e) => {
    e.preventDefault();
    setQueryFeedback(emptyFeedback);

    if (!queryStudentId) {
      setQueryFeedback({ error: 'Selecciona un estudiante para consultar.', success: '' });
      return;
    }

    try {
      const records = await attendanceMockService.listAttendanceByStudent(queryStudentId);
      setStudentQueryRows(mapRowsWithContext(records));
      setQueryFeedback({ error: '', success: `${records.length} registro(s) encontrado(s).` });
    } catch {
      setQueryFeedback({ error: 'No se pudo consultar la asistencia por estudiante.', success: '' });
    }
  };

  const handleQueryByCourse = async (e) => {
    e.preventDefault();
    setQueryFeedback(emptyFeedback);

    if (!queryCourse) {
      setQueryFeedback({ error: 'Selecciona un curso para consultar.', success: '' });
      return;
    }

    try {
      const records = await attendanceMockService.listAttendanceByCourse(queryCourse, classes);
      setCourseQueryRows(mapRowsWithContext(records));
      setQueryFeedback({ error: '', success: `${records.length} registro(s) encontrado(s).` });
    } catch {
      setQueryFeedback({ error: 'No se pudo consultar la asistencia por curso.', success: '' });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <LayoutSection
      title="Gestión de Clases y Asistencia"
      subtitle="Registra clases realizadas, controla asistencia y consulta reportes por estudiante o curso."
    >

      {/* ── Métricas rápidas ── */}
      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-item__label">Clases registradas</p>
          <p className="summary-item__value">{classes.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-item__label">Clases de hoy</p>
          <p className="summary-item__value">{classesToday}</p>
        </div>
        <div className="summary-item">
          <p className="summary-item__label">Asistencias registradas</p>
          <p className="summary-item__value">{attendanceRecords.length}</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          SECCIÓN 1 — REGISTRO
      ════════════════════════════════════════════ */}
      <div className="asistencia-section-label">
        <span className="asistencia-step-badge">1</span>
        <h3 className="asistencia-section-heading">Registro</h3>
      </div>

      <div className="split-layout">

        {/* Registrar clase */}
        <LayoutCard className="layout-card--split module-panel">
          <h3 className="section-title">Registrar clase realizada</h3>

          {classFeedback.error && <p className="form-error">{classFeedback.error}</p>}
          {classFeedback.success && <p className="form-success">{classFeedback.success}</p>}

          <form className="module-form" onSubmit={handleRegisterClass}>
            <div className="field-group">
              <label className="field-label" htmlFor="class-fecha">Fecha</label>
              <input
                id="class-fecha"
                type="date"
                className="field-control"
                value={classForm.fecha}
                onChange={(e) => setClassForm((prev) => ({ ...prev, fecha: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="class-curso">Curso</label>
              <input
                id="class-curso"
                type="text"
                className="field-control"
                placeholder="Ej: 1A"
                value={classForm.curso}
                onChange={(e) => setClassForm((prev) => ({ ...prev, curso: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="class-asignatura">Asignatura</label>
              <input
                id="class-asignatura"
                type="text"
                className="field-control"
                placeholder="Ej: Matemáticas"
                value={classForm.asignatura}
                onChange={(e) => setClassForm((prev) => ({ ...prev, asignatura: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="class-bloque">Bloque horario</label>
              <input
                id="class-bloque"
                type="text"
                className="field-control"
                placeholder="Ej: 08:00 - 08:45"
                value={classForm.bloque}
                onChange={(e) => setClassForm((prev) => ({ ...prev, bloque: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn btn--indigo btn--block">Guardar clase</button>
          </form>
        </LayoutCard>

        {/* Registrar asistencia */}
        <LayoutCard className="layout-card--split module-panel">
          <h3 className="section-title">Registrar asistencia de estudiante</h3>

          {/* Aviso si no hay clases creadas aún */}
          {classes.length === 0 && (
            <p className="asistencia-hint">
              ⚠️ Primero registra una clase para poder ingresar asistencia.
            </p>
          )}

          {attendanceFeedback.error && <p className="form-error">{attendanceFeedback.error}</p>}
          {attendanceFeedback.success && <p className="form-success">{attendanceFeedback.success}</p>}

          <form className="module-form" onSubmit={handleRegisterAttendance}>
            <div className="field-group">
              <label className="field-label" htmlFor="attendance-class">Clase registrada</label>
              <select
                id="attendance-class"
                className="field-control"
                value={attendanceForm.classId}
                onChange={(e) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    classId: e.target.value,
                    studentId: '', // resetear estudiante al cambiar clase
                  }))
                }
              >
                <option value="">-- Selecciona una clase --</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fecha} · {item.curso} · {item.asignatura} ({item.bloque})
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="attendance-student">
                Estudiante
                {attendanceForm.classId && (
                  <span className="asistencia-hint-inline">
                    {' '}— solo se muestran alumnos del curso {classesById[Number(attendanceForm.classId)]?.curso}
                  </span>
                )}
              </label>
              <select
                id="attendance-student"
                className="field-control"
                value={attendanceForm.studentId}
                disabled={!attendanceForm.classId}
                onChange={(e) => setAttendanceForm((prev) => ({ ...prev, studentId: e.target.value }))}
              >
                <option value="">
                  {attendanceForm.classId
                    ? studentsForSelectedClass.length === 0
                      ? '— No hay estudiantes en este curso —'
                      : '-- Selecciona un estudiante --'
                    : '— Primero selecciona una clase —'}
                </option>
                {studentsForSelectedClass.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                    disabled={studentsAlreadyRegistered.has(student.id)}
                  >
                    {student.nombre}
                    {studentsAlreadyRegistered.has(student.id) ? ' (ya registrado)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row form-row--2">
              <div className="field-group">
                <label className="field-label" htmlFor="attendance-status">Estado</label>
                <select
                  id="attendance-status"
                  className="field-control"
                  value={attendanceForm.estado}
                  onChange={(e) => setAttendanceForm((prev) => ({ ...prev, estado: e.target.value }))}
                >
                  <option value="PRESENTE">Presente</option>
                  <option value="AUSENTE">Ausente</option>
                  <option value="JUSTIFICADO">Justificado</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="attendance-note">Observación</label>
                <input
                  id="attendance-note"
                  type="text"
                  className="field-control"
                  placeholder="Opcional"
                  value={attendanceForm.observacion}
                  onChange={(e) => setAttendanceForm((prev) => ({ ...prev, observacion: e.target.value }))}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--success btn--block"
              disabled={!attendanceForm.classId || !attendanceForm.studentId}
            >
              Guardar asistencia
            </button>
          </form>
        </LayoutCard>
      </div>

      {/* ════════════════════════════════════════════
          SECCIÓN 2 — HISTORIAL DE CLASES
      ════════════════════════════════════════════ */}
      <div className="asistencia-section-label section-title--spaced">
        <span className="asistencia-step-badge">2</span>
        <h3 className="asistencia-section-heading">Historial de clases</h3>
      </div>

      <section className="table-panel">
        <table className="app-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Curso</th>
              <th>Asignatura</th>
              <th>Bloque</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state-cell">No hay clases registradas aún.</td>
              </tr>
            ) : (
              classes.map((item) => (
                <tr key={item.id}>
                  <td>{item.fecha}</td>
                  <td>{item.curso}</td>
                  <td>{item.asignatura}</td>
                  <td>{item.bloque}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* ════════════════════════════════════════════
          SECCIÓN 3 — CONSULTAS
      ════════════════════════════════════════════ */}
      <div className="asistencia-section-label section-title--spaced">
        <span className="asistencia-step-badge">3</span>
        <h3 className="asistencia-section-heading">Consultas de asistencia</h3>
      </div>

      {queryFeedback.error && <p className="form-error">{queryFeedback.error}</p>}
      {queryFeedback.success && <p className="form-success">{queryFeedback.success}</p>}

      <div className="split-layout">

        {/* Consulta por estudiante */}
        <LayoutCard className="layout-card--split module-panel">
          <h3 className="section-title">Por estudiante</h3>

          <form className="module-form" onSubmit={handleQueryByStudent}>
            <div className="field-group">
              <label className="field-label" htmlFor="query-student">Estudiante</label>
              <select
                id="query-student"
                className="field-control"
                value={queryStudentId}
                onChange={(e) => setQueryStudentId(e.target.value)}
              >
                <option value="">-- Selecciona un estudiante --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nombre} ({student.curso})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn--info btn--block">Consultar</button>
          </form>

          <div className="query-results">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Asignatura</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {studentQueryRows.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-state-cell">Sin resultados.</td>
                  </tr>
                ) : (
                  studentQueryRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.classFecha}</td>
                      <td>{row.classAsignatura}</td>
                      <td>
                        <span className={estadoClass[row.estado]}>{estadoLabel[row.estado]}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </LayoutCard>

        {/* Consulta por curso */}
        <LayoutCard className="layout-card--split module-panel">
          <h3 className="section-title">Por curso</h3>

          <form className="module-form" onSubmit={handleQueryByCourse}>
            <div className="field-group">
              <label className="field-label" htmlFor="query-course">Curso</label>
              <select
                id="query-course"
                className="field-control"
                value={queryCourse}
                onChange={(e) => setQueryCourse(e.target.value)}
              >
                <option value="">-- Selecciona un curso --</option>
                {cursosDisponibles.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn--neutral btn--block">Consultar</button>
          </form>

          <div className="query-results">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estudiante</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {courseQueryRows.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-state-cell">Sin resultados.</td>
                  </tr>
                ) : (
                  courseQueryRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.classFecha}</td>
                      <td>{row.studentNombre}</td>
                      <td>
                        <span className={estadoClass[row.estado]}>{estadoLabel[row.estado]}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </LayoutCard>
      </div>

    </LayoutSection>
  );
}