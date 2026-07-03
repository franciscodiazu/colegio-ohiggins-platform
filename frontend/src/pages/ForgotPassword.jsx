import { useState } from 'react';
import React from 'react';
import { LayoutCard, LayoutSection } from '../components/layout/BaseLayout';
import { resetUserPassword } from '../services/authService';

export default function ForgotPassword({ onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsSubmitting(false);
      return;
    }

    const result = await resetUserPassword({ email, newPassword });

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSuccess('Contraseña actualizada. Ya puedes iniciar sesión con la nueva clave.');
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSubmitting(false);
  };

  return (
    <div className="auth-shell">
      <LayoutSection className="login-section" title="Recuperar contraseña">
        <div className="auth-stage">
          <LayoutCard className="layout-card--md auth-card auth-form-panel">

            <div className="auth-logo-header">
              <img src="/logo.svg" alt="Colegio Bernardo O'Higgins" className="auth-form-logo" />
            </div>

            <h3 className="auth-form-title">Recuperar contraseña</h3>

            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="form-success">{success}</p> : null}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="correo-recuperacion">Correo institucional</label>
                <input
                  id="correo-recuperacion"
                  type="email"
                  className="field-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.cl"
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="nueva-clave">Nueva contraseña</label>
                <input
                  id="nueva-clave"
                  type="password"
                  className="field-control"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Ingresa la nueva contraseña"
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="confirmar-nueva-clave">Confirmar nueva contraseña</label>
                <input
                  id="confirmar-nueva-clave"
                  type="password"
                  className="field-control"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repite la nueva contraseña"
                />
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
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