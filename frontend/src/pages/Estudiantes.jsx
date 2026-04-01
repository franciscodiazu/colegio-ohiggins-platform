import { useState, useEffect } from 'react';
//import { getEstudiantes, createEstudiante } from '../services/bffClient.js';

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [curso, setCurso] = useState('');
  const [error, setError] = useState('');

  const cargarEstudiantes = async () => {
    try {
      console.log("Intentando cargar estudiantes desde el BFF...");
    } catch (err) {
      console.error("Error al cargar estudiantes", err);
    }
  };

  useEffect(() => {
    cargarEstudiantes();
  }, []); // El arreglo vacío [] asegura que se ejecute solo una vez al abrir la página

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // REGLA DE NEGOCIO (Caso Semestral): No se pueden registrar estudiantes sin nombre ni curso
    if (!nombre.trim() || !curso.trim()) {
      setError('Error: El nombre y el curso son obligatorios.');
      return;
    }

    const nuevoEstudiante = { nombre, curso };

    try {
      // Aquí enviaremos el JSON al BFF (comentado hasta que el backend esté listo)
      // await createEstudiante(nuevoEstudiante);
      
      // Simulación visual temporal para probar la interfaz:
      setEstudiantes([...estudiantes, { id: Date.now(), ...nuevoEstudiante }]);
      setNombre('');
      setCurso('');
      alert("Estudiante registrado con éxito");
    } catch (err) {
      setError('Error al registrar en el servidor.');
      console.error(err);
    }
  };

  // 5. Renderizado de la interfaz
  return (
    <div>
      <h2>Gestión de Estudiantes</h2>
      
      {/* Formulario de Registro */}
      <div style={{ border: '1px solid #ccc', padding: '30px', marginBottom: '20px', maxWidth: '500px' }}>
        <h3>Registrar Nuevo Estudiante</h3>
        
        {/* Mensaje de error visual */}
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Nombre Completo:</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Curso:</label>
            <input 
              type="text" 
              value={curso} 
              onChange={(e) => setCurso(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Ej: 1A, 2B..."
            />
          </div>
          
          <button 
            type="submit" 
            style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Guardar Estudiante
          </button>
        </form>
      </div>

      {/* Listado de Estudiantes */}
      <h3>Listado Actual</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Nombre</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Curso</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                No hay estudiantes registrados actualmente.
              </td>
            </tr>
          ) : (
            estudiantes.map((est) => (
              <tr key={est.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{est.id}</td>
                <td style={{ padding: '12px' }}>{est.nombre}</td>
                <td style={{ padding: '12px' }}>{est.curso}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}