import { useState } from 'react';
import React from 'react';
import { LayoutCard, LayoutSection } from '../components/layout/BaseLayout';
import { loginUser } from '../services/authMockService';
import { useFieldValidation, rules } from '../hooks/useFieldValidation';
import FormField from '../components/FormField';

export default function Login({ onLogin, onGoToRegister, onGoToForgot }) {
  const [rememberMe, setRememberMe] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Campos con validación individual ──────────────────────────────────────────

  const email = useFieldValidation([
    rules.required('El correo'),
    rules.email(),
  ]);

  const password = useFieldValidation([
    rules.required('La contraseña'),
  ]);

  // ── Handler de envío ───────────────────────────────────────────────────────────

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError('');

    const isValid = [
      email.validate(),
      password.validate(),
    ].every(Boolean);

    if (!isValid) return;

    setIsSubmitting(true);

    const result = loginUser({ email: email.value, password: password.value });

    if (!result.ok) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onLogin(result.user);
  };

  return (
    <div className="auth-shell">
      <LayoutSection className="login-section" title="Ingreso">
        <div className="auth-stage auth-stage--hero">

          {/* Panel izquierdo: identidad institucional */}
          <article className="auth-hero" aria-hidden="true">
            <img
              src="/logo-white.svg"
              alt="Colegio Bernardo O'Higgins"
              className="auth-hero__logo"
            />
            <h3 className="auth-hero__title">Bienvenido de vuelta</h3>
            <p className="auth-hero__text">
              Gestión académica en un entorno claro, confiable y pensado para la comunidad escolar.
            </p>
          </article>

          {/* Panel derecho: formulario */}
          <LayoutCard className="auth-card auth-card--hero auth-form-panel">
            <h3 className="auth-form-title">Iniciar sesión</h3>

            {submitError && <p className="form-error">{submitError}</p>}

            <form className="auth-login-form" onSubmit={handleSubmit} noValidate>

              <FormField id="correo-profesor" label="Correo institucional" error={email.error} touched={email.touched}>
                <input
                  id="correo-profesor"
                  type="email"
                  className={`field-control ${email.touched && email.error ? 'field-control--error' : ''}`}
                  value={email.value}
                  onChange={email.onChange}
                  onBlur={email.onBlur}
                  placeholder="correo@ejemplo.cl"
                  autoComplete="email"
                />
              </FormField>

              <FormField id="clave-profesor" label="Contraseña" error={password.error} touched={password.touched}>
                <input
                  id="clave-profesor"
                  type="password"
                  className={`field-control ${password.touched && password.error ? 'field-control--error' : ''}`}
                  value={password.value}
                  onChange={password.onChange}
                  onBlur={password.onBlur}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
              </FormField>

              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Recordar sesión</span>
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
                Olvidé mi contraseña
              </button>
            </div>
          </LayoutCard>

        </div>
      </LayoutSection>
    </div>
  );
}