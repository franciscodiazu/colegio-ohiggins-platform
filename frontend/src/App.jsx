import { useState } from 'react';
import { SchoolHeader } from '@colegio-ohiggins/ui';
import './index.css'; // Importamos los estilos profesionales
import Navbar from './components/Navbar';
import { LayoutContainer } from './components/layout/BaseLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Estudiantes from './pages/Estudiantes';
import Asistencia from './pages/Asistencia';
import Evaluaciones from './pages/Evaluaciones';
import { USER_ROLES } from './services/authMockService';

const SESSION_STORAGE_KEY = 'coh_platform_session';

const readInitialSession = () => {
  try {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSession) {
      return null;
    }

    const parsed = JSON.parse(storedSession);
    return {
      ...parsed,
      role: parsed.role || USER_ROLES.PROFESOR,
    };
  } catch (error) {
    console.error('No se pudo leer la sesion local:', error);
    return null;
  }
};

function App() {
  const [vistaActual, setVistaActual] = useState('estudiantes');
  const [session, setSession] = useState(readInitialSession);
  const [authView, setAuthView] = useState('login');
  const navItems = [
    { key: 'estudiantes', label: 'Estudiantes' },
    { key: 'asistencia', label: 'Asistencia' },
    { key: 'evaluaciones', label: 'Evaluaciones y Notas' },
  ];

  const handleLogin = ({ email, name, role }) => {
    const nextSession = { email, name, role };
    setSession(nextSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  };

  const handleLogout = () => {
    setSession(null);
    setVistaActual('estudiantes');
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  if (!session) {
    const authScreen =
      authView === 'register' ? (
        <Register onGoToLogin={() => setAuthView('login')} />
      ) : authView === 'forgot' ? (
        <ForgotPassword onGoToLogin={() => setAuthView('login')} />
      ) : (
        <Login
          onLogin={handleLogin}
          onGoToRegister={() => setAuthView('register')}
          onGoToForgot={() => setAuthView('forgot')}
        />
      );

    return (
      <LayoutContainer>
        <SchoolHeader
          title="Colegio Bernardo O'Higgins"
          subtitle="Plataforma Integral de Gestion Academica"
        />
        {authScreen}
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      <SchoolHeader
        title="Colegio Bernardo O'Higgins"
        subtitle="Plataforma Integral de Gestión Académica"
      />

      <div className="session-bar">
        <p className="session-bar__meta">
          Sesion activa: <strong>{session.name || session.email}</strong>
        </p>
        <button type="button" className="btn btn--neutral" onClick={handleLogout}>
          Cerrar sesion
        </button>
      </div>

      {session.role !== USER_ROLES.PROFESOR ? (
        <section className="pending-access">
          <h2 className="section-title">Modulo en preparacion</h2>
          <p className="pending-access__text">
            Tu cuenta ingreso correctamente, pero esta vista aun no esta habilitada. Pronto estara disponible.
          </p>
        </section>
      ) : null}

      {session.role !== USER_ROLES.PROFESOR ? null : (
        <div className="dashboard-main">
          <Navbar items={navItems} activeKey={vistaActual} onChange={setVistaActual} />

          {/* Contenedor dinámico de las vistas */}
          <main>
            {vistaActual === 'estudiantes' && <Estudiantes />}
            {vistaActual === 'asistencia' && <Asistencia />}
            {vistaActual === 'evaluaciones' && <Evaluaciones />}
          </main>
        </div>
      )}
      
    </LayoutContainer>
  );
}

export default App;