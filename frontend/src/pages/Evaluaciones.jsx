import { useState } from 'react';

export default function Evaluaciones() {
  // --- ESTADOS ---
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  
  // Estados para el Formulario de Evaluación
  const [nombreEval, setNombreEval] = useState('');
  const [cursoEval, setCursoEval] = useState('');
  
  // Estados para el Formulario de Calificación
  const [evaluacionId, setEvaluacionId] = useState('');
  const [estudianteId, setEstudianteId] = useState('');
  const [nota, setNota] = useState('');
  
  const [error, setError] = useState('');

  // SIMULACIÓN: Estudiantes disponibles
  const estudiantesDisponibles = [
    { id: 1, nombre: "Juan Pérez", curso: "1A" },
    { id: 2, nombre: "María Gómez", curso: "1A" },
    { id: 3, nombre: "Carlos López", curso: "2B" }
  ];

  // --- MANEJADORES DE FORMULARIOS ---
  
  // 1. Crear una Evaluación
  const handleCrearEvaluacion = (e) => {
    e.preventDefault();
    setError('');

    if (!nombreEval.trim() || !cursoEval.trim()) {
      setError('Error: El nombre de la evaluación y el curso son obligatorios.');
      return;
    }

    const nuevaEval = {
      id: Date.now(),
      nombre: nombreEval,
      curso: cursoEval
    };

    setEvaluaciones([...evaluaciones, nuevaEval]);
    setNombreEval('');
    setCursoEval('');
    alert("Evaluación creada con éxito (Simulación)");
  };

  // 2. Registrar una Calificación
  const handleRegistrarCalificacion = (e) => {
    e.preventDefault();
    setError('');

    // REGLA DE NEGOCIO: Rango válido (1.0 a 7.0)
    const notaNum = parseFloat(nota);
    if (!evaluacionId || !estudianteId || !nota.trim()) {
      setError('Error: Seleccione una evaluación, un estudiante e ingrese una nota.');
      return;
    }
    if (isNaN(notaNum) || notaNum < 1.0 || notaNum > 7.0) {
      setError('Error: La nota debe estar en un rango válido (1.0 a 7.0).');
      return;
    }

    const evaluacionSeleccionada = evaluaciones.find(ev => ev.id === parseInt(evaluacionId));
    const estudianteSeleccionado = estudiantesDisponibles.find(est => est.id === parseInt(estudianteId));

    const nuevaCalificacion = {
      id: Date.now(),
      evaluacion: evaluacionSeleccionada.nombre,
      curso: evaluacionSeleccionada.curso,
      estudiante: estudianteSeleccionado.nombre,
      nota: notaNum.toFixed(1)
    };

    setCalificaciones([...calificaciones, nuevaCalificacion]);
    setEstudianteId('');
    setNota('');
    alert("Calificación registrada con éxito (Simulación)");
  };

  return (
    <div>
      <h2>Evaluaciones y Calificaciones</h2>
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* --- FORMULARIO 1: CREAR EVALUACIÓN --- */}
        <div style={{ border: '1px solid #ccc', padding: '20px', flex: '1', minWidth: '300px' }}>
          <h3>1. Crear Evaluación</h3>
          <form onSubmit={handleCrearEvaluacion}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Nombre de Evaluación:</label>
              <input 
                type="text" value={nombreEval} onChange={(e) => setNombreEval(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} placeholder="Ej: Prueba Coef 1"
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Curso:</label>
              <input 
                type="text" value={cursoEval} onChange={(e) => setCursoEval(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} placeholder="Ej: 1A"
              />
            </div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#6f42c1', color: 'white', border: 'none', width: '100%', cursor: 'pointer' }}>
              Crear Evaluación
            </button>
          </form>
        </div>

        {/* --- FORMULARIO 2: REGISTRAR NOTA --- */}
        <div style={{ border: '1px solid #ccc', padding: '20px', flex: '1', minWidth: '300px' }}>
          <h3>2. Registrar Calificación</h3>
          <form onSubmit={handleRegistrarCalificacion}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Seleccionar Evaluación:</label>
              <select value={evaluacionId} onChange={(e) => setEvaluacionId(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="">-- Elija una evaluación --</option>
                {evaluaciones.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre} ({ev.curso})</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Seleccionar Estudiante:</label>
              <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="">-- Elija un estudiante --</option>
                {estudiantesDisponibles.map(est => <option key={est.id} value={est.id}>{est.nombre} - {est.curso}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Nota (1.0 a 7.0):</label>
              <input 
                type="number" step="0.1" min="1.0" max="7.0" value={nota} onChange={(e) => setNota(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} placeholder="Ej: 6.5"
              />
            </div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', width: '100%', cursor: 'pointer' }}>
              Registrar Nota
            </button>
          </form>
        </div>
      </div>

      {/* --- TABLA DE CALIFICACIONES --- */}
      <h3 style={{ marginTop: '30px' }}>Libro de Calificaciones</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Evaluación</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Curso</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Estudiante</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Nota</th>
          </tr>
        </thead>
        <tbody>
          {calificaciones.length === 0 ? (
            <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>No hay calificaciones registradas.</td></tr>
          ) : (
            calificaciones.map((cal, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{cal.evaluacion}</td>
                <td style={{ padding: '12px' }}>{cal.curso}</td>
                <td style={{ padding: '12px' }}>{cal.estudiante}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: cal.nota >= 4.0 ? 'blue' : 'red' }}>{cal.nota}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}