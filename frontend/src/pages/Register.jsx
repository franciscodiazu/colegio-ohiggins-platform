import { useState } from 'react';
import { LayoutCard, LayoutSection } from '../components/layout/BaseLayout';
import { registerUser } from '../services/authMockService';

export default function Register({ onGoToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsSubmitting(false);
      return;
    }

    const result = registerUser({ name, email, password });

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsSubmitting(false);
  };

  return (
    <div className="auth-shell">
      <LayoutSection
        title="Crear Cuenta"
        subtitle="Registra una cuenta temporal local. Mas adelante la conectaremos a base de datos."
      >
        <div className="auth-stage">
          <LayoutCard className="layout-card--md auth-card auth-form-panel">
            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="form-success">{success}</p> : null}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="nombre-profesor">
                  Nombre completo
                </label>
                <input
                  id="nombre-profesor"
                  type="text"
                  className="field-control"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Ana Perez"
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="correo-registro">
                  Correo
                </label>
                <input
                  id="correo-registro"
                  type="email"
                  className="field-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.cl"
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="clave-registro">
                  Contraseña
                </label>
                <input
                  id="clave-registro"
                  type="password"
                  className="field-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Crea una contraseña"
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="clave-registro-confirmar">
                  Confirmar contraseña
                </label>
                <input
                  id="clave-registro-confirmar"
                  type="password"
                  className="field-control"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <div className="auth-links auth-links--single">
              <button type="button" className="auth-link" onClick={onGoToLogin}>
                Volver a iniciar sesión
              </button>
            </div>
          </LayoutCard>
        </div>
      </LayoutSection>
    </div>
  );
}
