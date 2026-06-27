import { LayoutCard, LayoutSection } from '../components/layout/BaseLayout';
import { registerUser } from '../services/authMockService';
import { useFieldValidation, rules } from '../hooks/useFieldValidation';
import FormField from '../components/FormField';
import { useState } from 'react';
import React from 'react';

export default function Register({ onGoToLogin }) {
  const [submitFeedback, setSubmitFeedback] = useState({ error: '', success: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Campos con validación individual ──────────────────────────────────────────

  const nombre = useFieldValidation([
    rules.required('El nombre'),
  ]);

  const email = useFieldValidation([
    rules.required('El correo'),
    rules.institutionalEmail(),
  ]);

  const password = useFieldValidation([
    rules.required('La contraseña'),
    rules.minLength(6),
  ]);

  const confirmPassword = useFieldValidation([
    rules.required('La confirmación'),
    rules.matchField(password.value, 'contraseña'),
  ]);

  // ── Handler de envío ───────────────────────────────────────────────────────────

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitFeedback({ error: '', success: '' });

    const isValid = [
      nombre.validate(),
      email.validate(),
      password.validate(),
      confirmPassword.validate(),
    ].every(Boolean);

    if (!isValid) return;

    setIsSubmitting(true);

    const result = await registerUser({
      name: nombre.value,
      email: email.value,
      password: password.value,
    });

    if (!result.ok) {
      setSubmitFeedback({ error: result.error, success: '' });
      setIsSubmitting(false);
      return;
    }

    setSubmitFeedback({ error: '', success: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.' });
    nombre.reset();
    email.reset();
    password.reset();
    confirmPassword.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="auth-shell">
      <LayoutSection className="login-section" title="Crear cuenta">
        <div className="auth-stage">
          <LayoutCard className="layout-card--md auth-card auth-form-panel">

            <div className="auth-logo-header">
              <img src="/logo.svg" alt="Colegio Bernardo O'Higgins" className="auth-form-logo" />
            </div>

            <h3 className="auth-form-title">Crear cuenta</h3>

            {submitFeedback.error && <p className="form-error">{submitFeedback.error}</p>}
            {submitFeedback.success && <p className="form-success">{submitFeedback.success}</p>}

            <form onSubmit={handleSubmit} noValidate>

              <FormField id="nombre-profesor" label="Nombre completo" error={nombre.error} touched={nombre.touched}>
                <input
                  id="nombre-profesor"
                  type="text"
                  className={`field-control ${nombre.touched && nombre.error ? 'field-control--error' : ''}`}
                  value={nombre.value}
                  onChange={nombre.onChange}
                  onBlur={nombre.onBlur}
                  placeholder="Ej: Ana Pérez"
                  autoComplete="name"
                />
              </FormField>

              <FormField id="correo-registro" label="Correo institucional" error={email.error} touched={email.touched}>
                <input
                  id="correo-registro"
                  type="email"
                  className={`field-control ${email.touched && email.error ? 'field-control--error' : ''}`}
                  value={email.value}
                  onChange={email.onChange}
                  onBlur={email.onBlur}
                  placeholder="correo@profesor.cl"
                  autoComplete="email"
                />
              </FormField>

              <FormField id="clave-registro" label="Contraseña" error={password.error} touched={password.touched}>
                <input
                  id="clave-registro"
                  type="password"
                  className={`field-control ${password.touched && password.error ? 'field-control--error' : ''}`}
                  value={password.value}
                  onChange={password.onChange}
                  onBlur={password.onBlur}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </FormField>

              <FormField id="clave-registro-confirmar" label="Confirmar contraseña" error={confirmPassword.error} touched={confirmPassword.touched}>
                <input
                  id="clave-registro-confirmar"
                  type="password"
                  className={`field-control ${confirmPassword.touched && confirmPassword.error ? 'field-control--error' : ''}`}
                  value={confirmPassword.value}
                  onChange={confirmPassword.onChange}
                  onBlur={confirmPassword.onBlur}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />
              </FormField>

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