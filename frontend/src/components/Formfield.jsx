// ─── Componente: campo de formulario con validación visual ────────────────────

/**
 * FormField — envuelve un input con label, error y estado visual.
 *
 * Props:
 *   id          {string}   — id del input (para htmlFor)
 *   label       {string}   — texto del label
 *   error       {string}   — mensaje de error (null = sin error)
 *   touched     {boolean}  — si el campo fue interactuado
 *   children    {node}     — el <input> o <select> hijo
 */
export default function FormField({ id, label, error, touched, children }) {
  const hasError = touched && error;

  return (
    <div className={`field-group ${hasError ? 'field-group--error' : ''}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <div className="field-input-wrapper">
        {children}
        {hasError ? (
          <span className="field-error-icon" aria-hidden="true">!</span>
        ) : null}
      </div>

      {hasError ? (
        <p className="field-error-message" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}