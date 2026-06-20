// ─── Componente: página no encontrada ────────────────────────────────────────
import React from 'react';

/**
 * NotFound — se muestra cuando la vista solicitada no existe.
 *
 * Props:
 *   onGoHome {function} — callback para volver al inicio
 */
export default function NotFound({ onGoHome }) {
  return (
    <div className="not-found">

      {/* Código de error */}
      <p className="not-found__code" aria-hidden="true">404</p>

      {/* Mensaje principal */}
      <h2 className="not-found__title">Página no encontrada</h2>
      <p className="not-found__message">
        La sección que buscas no existe o no está disponible en este momento.
        Verifica la dirección o regresa al inicio de la plataforma.
      </p>

      {/* Acción */}
      <button
        type="button"
        className="btn btn--primary not-found__btn"
        onClick={onGoHome}
      >
        Volver al inicio
      </button>

    </div>
  );
}