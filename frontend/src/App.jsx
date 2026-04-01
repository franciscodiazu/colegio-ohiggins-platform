import { useState } from 'react';
import './index.css'; // Importamos los estilos profesionales
import Estudiantes from './pages/Estudiantes';
import Asistencia from './pages/Asistencia';
import Evaluaciones from './pages/Evaluaciones';

function App() {
  const [vistaActual, setVistaActual] = useState('estudiantes');

  return (
    <div className="app-container">
      {/* Cabecera Profesional */}
      <header className="header">
        <h1>Colegio Bernardo O'Higgins</h1>
        <p>Plataforma Integral de Gestión Académica</p>
      </header>
      
      {/* Menú de navegación moderno sin emojis */}
      <nav className="nav-bar">
        <button 
          className={`nav-btn ${vistaActual === 'estudiantes' ? 'active' : ''}`}
          onClick={() => setVistaActual('estudiantes')}
        >
          Estudiantes
        </button>
        
        <button 
          className={`nav-btn ${vistaActual === 'asistencia' ? 'active' : ''}`}
          onClick={() => setVistaActual('asistencia')}
        >
          Asistencia
        </button>

        <button 
          className={`nav-btn ${vistaActual === 'evaluaciones' ? 'active' : ''}`}
          onClick={() => setVistaActual('evaluaciones')}
        >
          Evaluaciones y Notas
        </button>
      </nav>

      {/* Contenedor dinámico de las vistas */}
      <main>
        {vistaActual === 'estudiantes' && <Estudiantes />}
        {vistaActual === 'asistencia' && <Asistencia />}
        {vistaActual === 'evaluaciones' && <Evaluaciones />}
      </main>
      
    </div>
  );
}

export default App;