import { useState } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import { LayoutContainer } from './components/layout/BaseLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Estudiantes from './pages/Estudiantes';
import Asistencia from './pages/Asistencia';
import Evaluaciones from './pages/Evaluaciones';
import { USER_ROLES } from './services/authMockService';

// ─── Constantes ───────────────────────────────────────────────────────────────

const SESSION_STORAGE_KEY = 'coh_platform_session';

const NAV_ITEMS = [
  { key: 'estudiantes', label: 'Estudiantes' },
  { key: 'asistencia', label: 'Asistencia' },
  { key: 'evaluaciones', label: 'Evaluaciones y Notas' },
];

// ─── Helper: leer sesión guardada ─────────────────────────────────────────────

const readInitialSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, role: parsed.role || USER_ROLES.PROFESOR };
  } catch (error) {
    console.error('No se pudo leer la sesión local:', error);
    return null;
  }
};

// ─── Componente: vista de módulo en preparación ───────────────────────────────

function PendingAccessView() {
  return (
    <section className="pending-access">
      <h2 className="section-title">Módulo en preparación</h2>
      <p className="pending-access__text">
        Tu cuenta ingresó correctamente, pero esta vista aún no está habilitada. Pronto estará disponible.
      </p>
    </section>
  );
}

// ─── Componente: vistas del dashboard según navegación ────────────────────────

function DashboardView({ vistaActual }) {
  if (vistaActual === 'estudiantes') return <Estudiantes />;
  if (vistaActual === 'asistencia') return <Asistencia />;
  if (vistaActual === 'evaluaciones') return <Evaluaciones />;
  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────

function App() {
  const [vistaActual, setVistaActual] = useState('estudiantes');
  const [session, setSession] = useState(readInitialSession);
  const [authView, setAuthView] = useState('login');

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

  // ── Vista sin sesión: autenticación ──────────────────────────────────────────

  if (!session) {
    return (
      <LayoutContainer>
        {authView === 'register' && (
          <Register onGoToLogin={() => setAuthView('login')} />
        )}
        {authView === 'forgot' && (
          <ForgotPassword onGoToLogin={() => setAuthView('login')} />
        )}
        {authView === 'login' && (
          <Login
            onLogin={handleLogin}
            onGoToRegister={() => setAuthView('register')}
            onGoToForgot={() => setAuthView('forgot')}
          />
        )}
      </LayoutContainer>
    );
  }

  // ── Vista con sesión: dashboard ───────────────────────────────────────────────

  const isProfesor = session.role === USER_ROLES.PROFESOR;

  return (
    <LayoutContainer>
      <Navbar
        items={NAV_ITEMS}
        activeKey={vistaActual}
        onChange={setVistaActual}
        session={session}
        onLogout={handleLogout}
      />

      <main>
        {isProfesor ? (
          <DashboardView vistaActual={vistaActual} />
        ) : (
          <PendingAccessView />
        )}
      </main>
    </LayoutContainer>
  );
}

export default App;