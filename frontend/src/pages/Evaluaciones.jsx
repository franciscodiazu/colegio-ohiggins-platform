import { useEffect, useMemo, useState } from 'react';
import { LayoutCard, LayoutSection } from '../components/layout/BaseLayout';
import { studentsMockService } from '../services/studentsMockService';
import { evaluationsMockService } from '../services/evaluationsMockService';
import TableSkeleton from '../components/TableSkeleton';

const emptyFeedback = { error: '', success: '' };

export default function Evaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [evaluationForm, setEvaluationForm] = useState({
    nombre: '', curso: '', fecha: new Date().toISOString().slice(0, 10), ponderacion: '30', descripcion: '',
  });
  const [createEvalFeedback, setCreateEvalFeedback] = useState(emptyFeedback);

  const [selectedEvaluationId, setSelectedEvaluationId] = useState('');
  const [editEvaluationForm, setEditEvaluationForm] = useState({
    nombre: '', curso: '', fecha: new Date().toISOString().slice(0, 10), ponderacion: '30', descripcion: '',
  });
  const [editEvalFeedback, setEditEvalFeedback] = useState(emptyFeedback);

  const [gradeForm, setGradeForm] = useState({ evaluationId: '', studentId: '', nota: '', observacion: '' });
  const [gradeFeedback, setGradeFeedback] = useState(emptyFeedback);

  const [queryStudentId, setQueryStudentId] = useState('');
  const [queryCourse, setQueryCourse] = useState('');
  const [studentQueryRows, setStudentQueryRows] = useState([]);
  const [courseQueryRows, setCourseQueryRows] = useState([]);
  const [queryFeedback, setQueryFeedback] = useState(emptyFeedback);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const [studentsList, evaluationsList, gradesList] = await Promise.all([
          studentsMockService.listStudents(),
          evaluationsMockService.listEvaluations(),
          evaluationsMockService.listGrades(),
        ]);
        setStudents(studentsList);
        setEvaluaciones(evaluationsList);
        setCalificaciones(gradesList);
      } catch (err) {
        console.error('No se pudo cargar módulo de evaluaciones', err);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const evaluationsById = useMemo(() => evaluaciones.reduce((acc, ev) => { acc[ev.id] = ev; return acc; }, {}), [evaluaciones]);
  const studentsById = useMemo(() => students.reduce((acc, s) => { acc[s.id] = s; return acc; }, {}), [students]);
  const courses = useMemo(() => Array.from(new Set(students.map((s) => s.curso))).sort((a, b) => a.localeCompare(b)), [students]);

  const studentsForSelectedEvaluation = useMemo(() => {
    if (!gradeForm.evaluationId) return [];
    const selectedEval = evaluationsById[Number(gradeForm.evaluationId)];
    if (!selectedEval) return [];
    return students.filter((s) => s.curso === selectedEval.curso);
  }, [gradeForm.evaluationId, evaluationsById, students]);

  const studentsAlreadyGraded = useMemo(() => {
    if (!gradeForm.evaluationId) return new Set();
    const evalId = Number(gradeForm.evaluationId);
    return new Set(calificaciones.filter((g) => g.evaluationId === evalId).map((g) => g.studentId));
  }, [gradeForm.evaluationId, calificaciones]);

  const promedioNotas = calificaciones.length === 0
    ? 0
    : (calificaciones.reduce((acc, g) => acc + Number(g.nota), 0) / calificaciones.length).toFixed(1);

  const mapGradeRows = (grades) => grades.map((grade) => {
    const evaluation = evaluationsById[grade.evaluationId];
    const student = studentsById[grade.studentId];
    return { ...grade, evaluationNombre: evaluation?.nombre || '-', evaluationFecha: evaluation?.fecha || '-', studentNombre: student?.nombre || '-' };
  });

  const handleCrearEvaluacion = (e) => {
    e.preventDefault();
    setCreateEvalFeedback(emptyFeedback);
    evaluationsMockService.createEvaluation(evaluationForm)
      .then((created) => {
        setEvaluaciones((prev) => [...prev, created]);
        setEvaluationForm((prev) => ({ ...prev, nombre: '', curso: '', descripcion: '' }));
        setCreateEvalFeedback({ error: '', success: 'Evaluación registrada correctamente.' });
      })
      .catch((err) => setCreateEvalFeedback({ error: err.message || 'No se pudo registrar la evaluación.', success: '' }));
  };

  const handleSelectEvaluationForEdit = (evaluationId) => {
    setSelectedEvaluationId(evaluationId);
    setEditEvalFeedback(emptyFeedback);
    const selected = evaluaciones.find((item) => item.id === Number(evaluationId));
    if (!selected) return;
    setEditEvaluationForm({ nombre: selected.nombre, curso: selected.curso, fecha: selected.fecha, ponderacion: String(selected.ponderacion), descripcion: selected.descripcion || '' });
  };

  const handleActualizarEvaluacion = (e) => {
    e.preventDefault();
    setEditEvalFeedback(emptyFeedback);
    if (!selectedEvaluationId) { setEditEvalFeedback({ error: 'Selecciona una evaluación para actualizar.', success: '' }); return; }
    evaluationsMockService.updateEvaluation(selectedEvaluationId, editEvaluationForm)
      .then((updated) => {
        if (!updated) { setEditEvalFeedback({ error: 'No encontramos la evaluación seleccionada.', success: '' }); return; }
        setEvaluaciones((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setEditEvalFeedback({ error: '', success: 'Evaluación actualizada correctamente.' });
      })
      .catch((err) => setEditEvalFeedback({ error: err.message || 'No se pudo actualizar la evaluación.', success: '' }));
  };

  const handleRegistrarCalificacion = (e) => {
    e.preventDefault();
    setGradeFeedback(emptyFeedback);
    evaluationsMockService.createGrade(gradeForm)
      .then((created) => {
        setCalificaciones((prev) => [...prev, created]);
        setGradeForm((prev) => ({ ...prev, studentId: '', nota: '', observacion: '' }));
        setGradeFeedback({ error: '', success: 'Calificación registrada correctamente.' });
      })
      .catch((err) => setGradeFeedback({ error: err.message || 'No se pudo registrar la calificación.', success: '' }));
  };

  const handleQueryByStudent = (e) => {
    e.preventDefault();
    setQueryFeedback(emptyFeedback);
    if (!queryStudentId) { setQueryFeedback({ error: 'Selecciona un estudiante para consultar sus calificaciones.', success: '' }); return; }
    evaluationsMockService.listGradesByStudent(queryStudentId)
      .then((records) => {
        const mapped = mapGradeRows(records);
        setStudentQueryRows(mapped);
        setQueryFeedback({ error: '', success: `${mapped.length} registro(s) encontrado(s).` });
      })
      .catch(() => setQueryFeedback({ error: 'No se pudieron consultar las calificaciones por estudiante.', success: '' }));
  };

  const handleQueryEvaluationsByCourse = (e) => {
    e.preventDefault();
    setQueryFeedback(emptyFeedback);
    if (!queryCourse) { setQueryFeedback({ error: 'Selecciona un curso para consultar evaluaciones.', success: '' }); return; }
    evaluationsMockService.listEvaluationsByCourse(queryCourse)
      .then((records) => {
        setCourseQueryRows(records);
        setQueryFeedback({ error: '', success: `${records.length} evaluación(es) encontrada(s).` });
      })
      .catch(() => setQueryFeedback({ error: 'No se pudieron consultar evaluaciones por curso.', success: '' }));
  };

  return (
    <LayoutSection
      title="Evaluaciones y Calificaciones"
      subtitle="Configura evaluaciones por curso y consolida notas para un seguimiento académico centralizado."
    >
      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-item__label">Evaluaciones creadas</p>
          <p className="summary-item__value">{loading ? '—' : evaluaciones.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-item__label">Notas registradas</p>
          <p className="summary-item__value">{loading ? '—' : calificaciones.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-item__label">Promedio general</p>
          <p className="summary-item__value">{loading ? '—' : promedioNotas}</p>
        </div>
      </div>

      <div className="asistencia-section-label">
        <span className="asistencia-step-badge">1</span>
        <h3 className="asistencia-section-heading">Gestión de evaluaciones</h3>
      </div>

      <div className="split-layout">
        <LayoutCard className="layout-card--split module-panel">
          <h3 className="section-title">Registrar nueva evaluación</h3>
          {createEvalFeedback.error && <p className="form-error">{createEvalFeedback.error}</p>}
          {createEvalFeedback.success && <p className="form-success">{createEvalFeedback.success}</p>}
          <form className="module-form" onSubmit={handleCrearEvaluacion}>
            <div className="field-group">
              <label className="field-label" htmlFor="eval-name">Nombre de evaluación</label>
              <input id="eval-name" type="text" className="field-control" placeholder="Ej: Prueba Coef 1" value={evaluationForm.nombre}
                onChange={(e) => setEvaluationForm((prev) => ({ ...prev, nombre: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="eval-course">Curso</label>
              <select id="eval-course" className="field-control" value={evaluationForm.curso}
                onChange={(e) => setEvaluationForm((prev) => ({ ...prev, curso: e.target.value }))}>
                <option value="">-- Selecciona un curso --</option>
                {courses.map((course) => <option key={course} value={course}>{course}</option>)}
              </select>
            </div>
            <div className="form-row form-row--2">
              <div className="field-group">
                <label className="field-label" htmlFor="eval-date">Fecha</label>
                <input id="eval-date" type="date" className="field-control" value={evaluationForm.fecha}
                  onChange={(e) => setEvaluationForm((prev) => ({ ...prev, fecha: e.target.value }))} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="eval-weight">Ponderación (%)</label>
                <input id="eval-weight" type="number" min="1" max="100" className="field-control" value={evaluationForm.ponderacion}
                  onChange={(e) => setEvaluationForm((prev) => ({ ...prev, ponderacion: e.target.value }))} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="eval-description">Descripción</label>
              <input id="eval-description" type="text" className="field-control" placeholder="Opcional" value={evaluationForm.descripcion}
                onChange={(e) => setEvaluationForm((prev) => ({ ...prev, descripcion: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn--indigo btn--block">Guardar evaluación</button>
          </form>
        </LayoutCard>

        <LayoutCard className="layout-card--split module-panel">
          <h3 className="section-title">Actualizar evaluación existente</h3>
          {evaluaciones.length === 0 && !loading && (
            <p className="asistencia-hint">Primero registra una evaluación para poder editarla.</p>
          )}
          {editEvalFeedback.error && <p className="form-error">{editEvalFeedback.error}</p>}
          {editEvalFeedback.success && <p className="form-success">{editEvalFeedback.success}</p>}
          <form className="module-form" onSubmit={handleActualizarEvaluacion}>
            <div className="field-group">
              <label className="field-label" htmlFor="edit-evaluation-select">Evaluación a editar</label>
              <select id="edit-evaluation-select" className="field-control" value={selectedEvaluationId}
                onChange={(e) => handleSelectEvaluationForEdit(e.target.value)}>
                <option value="">-- Selecciona una evaluación --</option>
                {evaluaciones.map((ev) => <option key={ev.id} value={ev.id}>{ev.nombre} ({ev.curso})</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="edit-eval-name">Nombre</label>
              <input id="edit-eval-name" type="text" className="field-control" value={editEvaluationForm.nombre}
                disabled={!selectedEvaluationId} onChange={(e) => setEditEvaluationForm((prev) => ({ ...prev, nombre: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="edit-eval-course">Curso</label>
              <select id="edit-eval-course" className="field-control" value={editEvaluationForm.curso}
                disabled={!selectedEvaluationId} onChange={(e) => setEditEvaluationForm((prev) => ({ ...prev, curso: e.target.value }))}>
                <option value="">-- Selecciona un curso --</option>
                {courses.map((course) => <option key={course} value={course}>{course}</option>)}
              </select>
            </div>
            <div className="form-row form-row--2">
              <div className="field-group">
                <label className="field-label" htmlFor="edit-eval-date">Fecha</label>
                <input id="edit-eval-date" type="date" className="field-control" value={editEvaluationForm.fecha}
                  disabled={!selectedEvaluationId} onChange={(e) => setEditEvaluationForm((prev) => ({ ...prev, fecha: e.target.value }))} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="edit-eval-weight">Ponderación (%)</label>
                <input id="edit-eval-weight" type="number" min="1" max="100" className="field-control" value={editEvaluationForm.ponderacion}
                  disabled={!selectedEvaluationId} onChange={(e) => setEditEvaluationForm((prev) => ({ ...prev, ponderacion: e.target.value }))} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="edit-eval-description">Descripción</label>
              <input id="edit-eval-description" type="text" className="field-control" value={editEvaluationForm.descripcion}
                disabled={!selectedEvaluationId} onChange={(e) => setEditEvaluationForm((prev) => ({ ...prev, descripcion: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn--success btn--block" disabled={!selectedEvaluationId}>Actualizar evaluación</button>
          </form>
        </LayoutCard>
      </div>

      <div className="asistencia-section-label section-title--spaced">
        <span className="asistencia-step-badge">2</span>
        <h3 className="asistencia-section-heading">Listado de evaluaciones</h3>
      </div>

      <section className="table-panel">
        <table className="app-table">
          <thead><tr><th>Nombre</th><th>Curso</th><th>Fecha</th><th>Ponderación</th></tr></thead>
          {loading ? (
            <TableSkeleton cols={4} rows={3} />
          ) : (
            <tbody>
              {evaluaciones.length === 0 ? (
                <tr><td colSpan="4" className="empty-state-cell">No hay evaluaciones registradas aún.</td></tr>
              ) : (
                evaluaciones.map((ev) => (
                  <tr key={ev.id}><td>{ev.nombre}</td><td>{ev.curso}</td><td>{ev.fecha}</td><td>{ev.ponderacion}%</td></tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </section>

      <div className="asistencia-section-label section-title--spaced">
        <span className="asistencia-step-badge">3</span>
        <h3 className="asistencia-section-heading">Registrar calificación</h3>
      </div>

      <LayoutCard className="layout-card--split module-panel">
        {evaluaciones.length === 0 && !loading && (
          <p className="asistencia-hint">Primero registra una evaluación para poder ingresar calificaciones.</p>
        )}
        {gradeFeedback.error && <p className="form-error">{gradeFeedback.error}</p>}
        {gradeFeedback.success && <p className="form-success">{gradeFeedback.success}</p>}
        <form className="module-form" onSubmit={handleRegistrarCalificacion}>
          <div className="field-group">
            <label className="field-label" htmlFor="grade-eval">Evaluación</label>
            <select id="grade-eval" className="field-control" value={gradeForm.evaluationId}
              onChange={(e) => setGradeForm((prev) => ({ ...prev, evaluationId: e.target.value, studentId: '' }))}>
              <option value="">-- Elige una evaluación --</option>
              {evaluaciones.map((ev) => <option key={ev.id} value={ev.id}>{ev.nombre} ({ev.curso})</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="grade-student">
              Estudiante
              {gradeForm.evaluationId && (
                <span className="asistencia-hint-inline"> — solo se muestran alumnos del curso {evaluationsById[Number(gradeForm.evaluationId)]?.curso}</span>
              )}
            </label>
            <select id="grade-student" className="field-control" value={gradeForm.studentId}
              disabled={!gradeForm.evaluationId} onChange={(e) => setGradeForm((prev) => ({ ...prev, studentId: e.target.value }))}>
              <option value="">
                {gradeForm.evaluationId
                  ? studentsForSelectedEvaluation.length === 0 ? '— No hay estudiantes en este curso —' : '-- Elige un estudiante --'
                  : '— Primero selecciona una evaluación —'}
              </option>
              {studentsForSelectedEvaluation.map((est) => (
                <option key={est.id} value={est.id} disabled={studentsAlreadyGraded.has(est.id)}>
                  {est.nombre}{studentsAlreadyGraded.has(est.id) ? ' (ya calificado)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row form-row--2">
            <div className="field-group">
              <label className="field-label" htmlFor="grade-value">Nota (1.0 a 7.0)</label>
              <input id="grade-value" type="number" step="0.1" min="1.0" max="7.0" className="field-control"
                placeholder="Ej: 6.5" value={gradeForm.nota} onChange={(e) => setGradeForm((prev) => ({ ...prev, nota: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="grade-note">Observación</label>
              <input id="grade-note" type="text" className="field-control" placeholder="Opcional" value={gradeForm.observacion}
                onChange={(e) => setGradeForm((prev) => ({ ...prev, observacion: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn btn--info btn--block" disabled={!gradeForm.evaluationId || !gradeForm.studentId}>
            Guardar calificación
          </button>
        </form>
      </LayoutCard>

      <div className="asistencia-section-label section-title--spaced">
        <span className="asistencia-step-badge">4</span>
        <h3 className="asistencia-section-heading">Consultas</h3>
      </div>

      {queryFeedback.error && <p className="form-error">{queryFeedback.error}</p>}
      {queryFeedback.success && <p className="form-success">{queryFeedback.success}</p>}

      <div className="split-layout">
        <LayoutCard className="layout-card--split module-panel">
          <h3 className="section-title">Calificaciones por estudiante</h3>
          <form className="module-form" onSubmit={handleQueryByStudent}>
            <div className="field-group">
              <label className="field-label" htmlFor="query-student-grade">Estudiante</label>
              <select id="query-student-grade" className="field-control" value={queryStudentId}
                onChange={(e) => setQueryStudentId(e.target.value)}>
                <option value="">-- Elige un estudiante --</option>
                {students.map((student) => <option key={student.id} value={student.id}>{student.nombre} ({student.curso})</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn--neutral btn--block">Consultar</button>
          </form>
          <div className="query-results">
            <table className="app-table">
              <thead><tr><th>Evaluación</th><th>Fecha</th><th>Nota</th></tr></thead>
              <tbody>
                {studentQueryRows.length === 0 ? (
                  <tr><td colSpan="3" className="empty-state-cell">Sin resultados.</td></tr>
                ) : (
                  studentQueryRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.evaluationNombre}</td>
                      <td>{row.evaluationFecha}</td>
                      <td className={Number(row.nota) >= 4 ? 'grade grade--pass' : 'grade grade--fail'}>{row.nota}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </LayoutCard>

        <LayoutCard className="layout-card--split module-panel">
          <h3 className="section-title">Evaluaciones por curso</h3>
          <form className="module-form" onSubmit={handleQueryEvaluationsByCourse}>
            <div className="field-group">
              <label className="field-label" htmlFor="query-evaluations-course">Curso</label>
              <select id="query-evaluations-course" className="field-control" value={queryCourse}
                onChange={(e) => setQueryCourse(e.target.value)}>
                <option value="">-- Elige un curso --</option>
                {courses.map((course) => <option key={course} value={course}>{course}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn--indigo btn--block">Consultar</button>
          </form>
          <div className="query-results">
            <table className="app-table">
              <thead><tr><th>Evaluación</th><th>Fecha</th><th>Ponderación</th></tr></thead>
              <tbody>
                {courseQueryRows.length === 0 ? (
                  <tr><td colSpan="3" className="empty-state-cell">Sin resultados.</td></tr>
                ) : (
                  courseQueryRows.map((ev) => (
                    <tr key={ev.id}><td>{ev.nombre}</td><td>{ev.fecha}</td><td>{ev.ponderacion}%</td></tr>
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