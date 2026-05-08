import { useState, useEffect } from 'react';
import { LayoutCard, LayoutSection } from '../components/layout/BaseLayout';
import { studentsService } from '../services/bffClient';
import ConfirmModal from '../components/ConfirmModal';
import TableSkeleton from '../components/TableSkeleton';

const emptyFeedback = { error: '', success: '' };

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [cursosDetalle, setCursosDetalle] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createFeedback, setCreateFeedback] = useState(emptyFeedback);
  const [editFeedback, setEditFeedback] = useState(emptyFeedback);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    nombre: '', correo: '', curso: '', telefono: '', cursosAsociados: '',
  });

  const [editForm, setEditForm] = useState({
    nombre: '', correo: '', curso: '', telefono: '', cursosAsociados: '',
  });

  const totalCursos = new Set(estudiantes.map((item) => item.curso)).size;

  // ── Carga inicial ──────────────────────────────────────────────────────────

  const cargarEstudiantes = async (keepSelection = true) => {
    try {
      const list = await studentsService.listStudents();
      setEstudiantes(list);

      if (!keepSelection) return;

      const targetId = selectedStudentId || list[0]?.id;
      if (targetId) {
        await handleSelectStudent(targetId, list);
      } else {
        setSelectedStudent(null);
        setCursosDetalle([]);
      }
    } catch (err) {
      console.error('Error al cargar estudiantes', err);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await cargarEstudiantes();
      setLoading(false);
    };
    bootstrap();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const validateForm = (formData) => {
    if (!formData.nombre.trim() || !formData.correo.trim() || !formData.curso.trim()) {
      return 'Nombre, correo y curso son obligatorios.';
    }
    return '';
  };

  const handleSelectStudent = async (studentId, studentsCache) => {
    try {
      const source = Array.isArray(studentsCache) ? studentsCache : estudiantes;
      const local = source.find((item) => item.id === Number(studentId));
      const detail = local || (await studentsService.getStudentById(studentId));

      if (!detail) {
        setSelectedStudent(null);
        setCursosDetalle([]);
        return;
      }

      setSelectedStudentId(detail.id);
      setSelectedStudent(detail);
      setCursosDetalle(detail.cursosAsociados || []);
      setEditFeedback(emptyFeedback);
      setEditForm({
        nombre: detail.nombre || '',
        correo: detail.correo || '',
        curso: detail.curso || '',
        telefono: detail.telefono || '',
        cursosAsociados: (detail.cursosAsociados || []).join(', '),
      });
    } catch (err) {
      console.error('Error al consultar detalle', err);
      setEditFeedback({ error: 'No se pudo consultar el detalle del estudiante.', success: '' });
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    setCreateFeedback(emptyFeedback);

    const validationError = validateForm(createForm);
    if (validationError) {
      setCreateFeedback({ error: validationError, success: '' });
      return;
    }

    try {
      const created = await studentsService.createStudent(createForm);
      setCreateForm({ nombre: '', correo: '', curso: '', telefono: '', cursosAsociados: '' });
      await cargarEstudiantes(false);
      await handleSelectStudent(created.id);
      setCreateFeedback({ error: '', success: 'Estudiante registrado correctamente.' });
    } catch (err) {
      console.error(err);
      setCreateFeedback({ error: 'Error al registrar el estudiante.', success: '' });
    }
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    setEditFeedback(emptyFeedback);

    if (!selectedStudentId) {
      setEditFeedback({ error: 'Selecciona un estudiante para actualizar.', success: '' });
      return;
    }

    const validationError = validateForm(editForm);
    if (validationError) {
      setEditFeedback({ error: validationError, success: '' });
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setConfirmOpen(false);
    setEditFeedback(emptyFeedback);

    try {
      const updated = await studentsService.updateStudent(selectedStudentId, editForm);
      if (!updated) {
        setEditFeedback({ error: 'No encontramos el estudiante seleccionado.', success: '' });
        return;
      }
      await cargarEstudiantes(false);
      await handleSelectStudent(updated.id);
      setEditFeedback({ error: '', success: 'Información del estudiante actualizada.' });
    } catch (err) {
      console.error('Error al actualizar estudiante', err);
      setEditFeedback({ error: 'No se pudo actualizar la información del estudiante.', success: '' });
    }
  };

  const handleLoadCourses = async () => {
    if (!selectedStudentId) {
      setEditFeedback({ error: 'Selecciona un estudiante para consultar sus cursos.', success: '' });
      return;
    }
    try {
      const courses = await studentsService.listStudentCourses(selectedStudentId);
      setCursosDetalle(courses);
    } catch (err) {
      console.error('Error al consultar cursos', err);
      setEditFeedback({ error: 'No se pudieron consultar los cursos asociados.', success: '' });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <LayoutSection
      title="Gestión de Estudiantes"
      subtitle="Registra, consulta y actualiza la información de los estudiantes del establecimiento."
    >
      <ConfirmModal
        open={confirmOpen}
        title="¿Actualizar información?"
        message={`Estás a punto de modificar los datos de ${selectedStudent?.nombre || 'este estudiante'}. Esta acción sobreescribirá la información actual.`}
        confirmText="Sí, actualizar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={handleConfirmUpdate}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-item__label">Estudiantes registrados</p>
          <p className="summary-item__value">{loading ? '—' : estudiantes.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-item__label">Cursos activos</p>
          <p className="summary-item__value">{loading ? '—' : totalCursos}</p>
        </div>
        <div className="summary-item">
          <p className="summary-item__label">Estado del módulo</p>
          <p className="summary-item__value">Operativo</p>
        </div>
      </div>

      {/* ① Registrar */}
      <div className="asistencia-section-label">
        <span className="asistencia-step-badge">1</span>
        <h3 className="asistencia-section-heading">Registrar nuevo estudiante</h3>
      </div>

      <LayoutCard className="layout-card--split students-panel">
        {createFeedback.error && <p className="form-error">{createFeedback.error}</p>}
        {createFeedback.success && <p className="form-success">{createFeedback.success}</p>}

        <form className="students-form" onSubmit={handleRegisterStudent}>
          <div className="field-group">
            <label className="field-label" htmlFor="create-est-nombre">Nombre completo</label>
            <input id="create-est-nombre" type="text" className="field-control" value={createForm.nombre}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, nombre: e.target.value }))} placeholder="Ej: Juan Pérez" />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="create-est-correo">Correo</label>
            <input id="create-est-correo" type="email" className="field-control" value={createForm.correo}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, correo: e.target.value }))} placeholder="correo@alum.cl" />
          </div>
          <div className="form-row form-row--2">
            <div className="field-group">
              <label className="field-label" htmlFor="create-est-curso">Curso base</label>
              <input id="create-est-curso" type="text" className="field-control" value={createForm.curso}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, curso: e.target.value }))} placeholder="Ej: 1A" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="create-est-telefono">Teléfono</label>
              <input id="create-est-telefono" type="text" className="field-control" value={createForm.telefono}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, telefono: e.target.value }))} placeholder="+56 9 ..." />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="create-est-cursos">Cursos asociados (separados por coma)</label>
            <input id="create-est-cursos" type="text" className="field-control" value={createForm.cursosAsociados}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, cursosAsociados: e.target.value }))} placeholder="Matemáticas, Lenguaje, Historia" />
          </div>
          <button type="submit" className="btn btn--primary btn--block">Registrar estudiante</button>
        </form>
      </LayoutCard>

      {/* ② Listado */}
      <div className="asistencia-section-label section-title--spaced">
        <span className="asistencia-step-badge">2</span>
        <h3 className="asistencia-section-heading">Listado de estudiantes</h3>
      </div>

      <section className="table-panel">
        <table className="app-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Curso base</th>
              <th>Acción</th>
            </tr>
          </thead>
          {loading ? (
            <TableSkeleton cols={5} rows={4} />
          ) : (
            <tbody>
              {estudiantes.length === 0 ? (
                <tr><td colSpan="5" className="empty-state-cell">No hay estudiantes registrados actualmente.</td></tr>
              ) : (
                estudiantes.map((est) => (
                  <tr key={est.id} className={selectedStudentId === est.id ? 'app-table__row--selected' : ''}>
                    <td>{est.id}</td>
                    <td>{est.nombre}</td>
                    <td>{est.correo}</td>
                    <td>{est.curso}</td>
                    <td>
                      <button type="button" className="btn btn--neutral students-row-btn" onClick={() => handleSelectStudent(est.id)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </section>

      {/* ③ Detalle y edición */}
      <div className="asistencia-section-label section-title--spaced">
        <span className="asistencia-step-badge">3</span>
        <h3 className="asistencia-section-heading">Detalle y actualización</h3>
      </div>

      <LayoutCard className="students-panel students-panel--detail">
        {!selectedStudent ? (
          <p className="asistencia-hint">Selecciona un estudiante del listado para ver y editar su información.</p>
        ) : (
          <div className="students-detail">
            {editFeedback.error && <p className="form-error">{editFeedback.error}</p>}
            {editFeedback.success && <p className="form-success">{editFeedback.success}</p>}

            <div className="students-detail-grid">
              <p><strong>ID:</strong> {selectedStudent.id}</p>
              <p><strong>Nombre:</strong> {selectedStudent.nombre}</p>
              <p><strong>Correo:</strong> {selectedStudent.correo}</p>
              <p><strong>Curso base:</strong> {selectedStudent.curso}</p>
            </div>

            <div className="students-actions">
              <button type="button" className="btn btn--info" onClick={handleLoadCourses}>Consultar cursos asociados</button>
            </div>

            <div className="students-courses">
              <h4 className="section-title">Cursos del estudiante</h4>
              {cursosDetalle.length === 0 ? (
                <p className="empty-state-cell">No hay cursos asociados para este estudiante.</p>
              ) : (
                <div className="course-chip-list">
                  {cursosDetalle.map((course) => (
                    <span key={course} className="course-chip">{course}</span>
                  ))}
                </div>
              )}
            </div>

            <form className="students-form" onSubmit={handleUpdateClick}>
              <div className="field-group">
                <label className="field-label" htmlFor="edit-est-nombre">Nombre completo</label>
                <input id="edit-est-nombre" type="text" className="field-control" value={editForm.nombre}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, nombre: e.target.value }))} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="edit-est-correo">Correo</label>
                <input id="edit-est-correo" type="email" className="field-control" value={editForm.correo}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, correo: e.target.value }))} />
              </div>
              <div className="form-row form-row--2">
                <div className="field-group">
                  <label className="field-label" htmlFor="edit-est-curso">Curso base</label>
                  <input id="edit-est-curso" type="text" className="field-control" value={editForm.curso}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, curso: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="edit-est-telefono">Teléfono</label>
                  <input id="edit-est-telefono" type="text" className="field-control" value={editForm.telefono}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, telefono: e.target.value }))} />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="edit-est-cursos">Cursos asociados (separados por coma)</label>
                <input id="edit-est-cursos" type="text" className="field-control" value={editForm.cursosAsociados}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, cursosAsociados: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn--success btn--block">Actualizar información</button>
            </form>
          </div>
        )}
      </LayoutCard>
    </LayoutSection>
  );
}