import { useState } from 'react';

export default function Asistencia() {
  // 1. Estados para el formulario
  const [fecha, setFecha] = useState('');
  const [clase, setClase] = useState('');
  const [estudianteId, setEstudianteId] = useState('');
  const [estado, setEstado] = useState('PRESENT'); // Por defecto "Presente"
  const [error, setError] = useState('');

  // Estado para guardar la lista de asistencias registradas
  const [listaAsistencia, setListaAsistencia] = useState([]);

  // SIMULACIÓN: Estudiantes que vendrían del microservicio de Estudiantes
  // Cuando el backend esté listo, esto se llenará con un fetch/axios
  const estudiantesDisponibles = [
    { id: 1, nombre: "Juan Pérez", curso: "1A" },
    { id: 2, nombre: "María Gómez", curso: "1A" },
    { id: 3, nombre: "Carlos López", curso: "2B" }
  ];

  // 2. Manejo del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // REGLA DE NEGOCIO: Validar campos obligatorios
    if (!fecha || !clase.trim() || !estudianteId) {
      setError('Error: La fecha, la clase y el estudiante son obligatorios.');
      return;
    }

    // Buscamos el nombre del estudiante para mostrarlo en la tabla
    const estudianteSeleccionado = estudiantesDisponibles.find(
      (est) => est.id === parseInt(estudianteId)
    );

    const nuevoRegistro = {
      id: Date.now(), // ID temporal simulado
      fecha,
      clase,
      estudianteNombre: estudianteSeleccionado.nombre,
      estado
    };

    // Actualizamos la tabla visual
    setListaAsistencia([...listaAsistencia, nuevoRegistro]);
    
    // Limpiamos solo el estudiante y estado, dejamos fecha y clase por si el profe quiere seguir pasando lista rápido
    setEstudianteId('');
    setEstado('PRESENT');
    alert("Asistencia registrada con éxito (Simulación)");
  };

  // 3. Renderizado de la interfaz
  return (
    <div>
      <h2>Gestión de Clases y Asistencia</h2>
      
      {/* Formulario de Registro */}
      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', maxWidth: '600px' }}>
        <h3>Registrar Asistencia</h3>
        
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {/* Fila para Fecha y Clase */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Fecha de la Clase:</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Nombre de la Clase/Materia:</label>
              <input 
                type="text" 
                value={clase} 
                onChange={(e) => setClase(e.target.value)} 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="Ej: Matemáticas, Historia..."
              />
            </div>
          </div>
          
          {/* Fila para Estudiante y Estado */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Seleccionar Estudiante:</label>
              <select 
                value={estudianteId} 
                onChange={(e) => setEstudianteId(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">-- Seleccione un estudiante --</option>
                {estudiantesDisponibles.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.nombre} ({est.curso})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Estado:</label>
              <select 
                value={estado} 
                onChange={(e) => setEstado(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="PRESENT">Presente</option>
                <option value="ABSENT">Ausente</option>
                <option value="JUSTIFIED">Justificado</option>
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', width: '100%' }}
          >
            Guardar Asistencia
          </button>
        </form>
      </div>

      {/* Listado de Asistencias */}
      <h3>Registro Histórico</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Fecha</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Clase</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Estudiante</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {listaAsistencia.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                No hay registros de asistencia aún.
              </td>
            </tr>
          ) : (
            listaAsistencia.map((registro) => (
              <tr key={registro.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{registro.fecha}</td>
                <td style={{ padding: '12px' }}>{registro.clase}</td>
                <td style={{ padding: '12px' }}>{registro.estudianteNombre}</td>
                <td style={{ padding: '12px' }}>
                  {/* Pequeño truco visual para los estados */}
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: registro.estado === 'PRESENT' ? '#d4edda' : registro.estado === 'ABSENT' ? '#f8d7da' : '#fff3cd',
                    color: registro.estado === 'PRESENT' ? '#155724' : registro.estado === 'ABSENT' ? '#721c24' : '#856404'
                  }}>
                    {registro.estado === 'PRESENT' ? 'Presente' : registro.estado === 'ABSENT' ? 'Ausente' : 'Justificado'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}