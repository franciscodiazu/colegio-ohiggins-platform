import { useState } from 'react';
import { LayoutCard, LayoutSection } from '../components/layout/BaseLayout';
import { loginUser } from '../services/authMockService';

export default function Login({ onLogin, onGoToRegister, onGoToForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = loginUser({ email, password });

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onLogin(result.user);
  };

  return (
    <div className="auth-shell">
      <LayoutSection
        className="login-section"
        title="Ingreso a la Plataforma"
        subtitle="Accede con tu cuenta institucional para continuar"
      >
        <div className="auth-stage auth-stage--hero">
          <article className="auth-hero" aria-hidden="true">
            <p className="auth-hero__eyebrow">Colegio Bernardo O'Higgins</p>
            <h3 className="auth-hero__title">Bienvenido de vuelta</h3>
            <p className="auth-hero__text">
              Gestion academica en un entorno claro, confiable y pensado para la comunidad escolar.
            </p>
          </article>

          <LayoutCard className="auth-card auth-card--hero auth-form-panel">
            <h3 className="auth-form-title">Iniciar sesion</h3>
            {error ? <p className="form-error">{error}</p> : null}

            <form className="auth-login-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="correo-profesor">
                  Correo
                </label>
                <input
                  id="correo-profesor"
                  type="email"
                  className="field-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.cl"
                  autoComplete="email"
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="clave-profesor">
                  Contraseña
                </label>
                <input
                  id="clave-profesor"
                  type="password"
                  className="field-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
              </div>

              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Recordar sesion</span>
              </label>

              <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <div className="auth-links">
              <button type="button" className="auth-link" onClick={onGoToRegister}>
                Crear cuenta
              </button>
              <button type="button" className="auth-link" onClick={onGoToForgot}>
                Olvide mi contraseña
              </button>
            </div>
          </LayoutCard>
        </div>
      </LayoutSection>
    </div>
  );
}
