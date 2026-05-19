import { useEffect, useRef } from 'react';

// ─── Constantes ───────────────────────────────────────────────────────────────

const VARIANT_CONFIG = {
  danger: {
    confirmClass: 'btn btn--danger',
    iconClass: 'confirm-modal__icon confirm-modal__icon--danger',
    symbol: '!',
  },
  warning: {
    confirmClass: 'btn btn--warning',
    iconClass: 'confirm-modal__icon confirm-modal__icon--warning',
    symbol: '?',
  },
  info: {
    confirmClass: 'btn btn--primary',
    iconClass: 'confirm-modal__icon confirm-modal__icon--info',
    symbol: 'i',
  },
};

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * ConfirmModal — modal de confirmación reutilizable.
 *
 * Props:
 *   open        {boolean}  — si el modal está visible
 *   title       {string}   — título del modal
 *   message     {string}   — descripción de la acción a confirmar
 *   confirmText {string}   — texto del botón de confirmación (default: "Confirmar")
 *   cancelText  {string}   — texto del botón de cancelación (default: "Cancelar")
 *   variant     {string}   — "danger" | "warning" | "info" (default: "danger")
 *   onConfirm   {function} — callback al confirmar
 *   onCancel    {function} — callback al cancelar o cerrar
 */
export default function ConfirmModal({
  open,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const cancelBtnRef = useRef(null);
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.danger;

  // Foco automático al botón cancelar cuando abre (accesibilidad)
  useEffect(() => {
    if (open) {
      cancelBtnRef.current?.focus();
    }
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-modal__backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="confirm-modal__panel">

        <div className={config.iconClass} aria-hidden="true">
          {config.symbol}
        </div>

        <h2 id="confirm-modal-title" className="confirm-modal__title">
          {title}
        </h2>

        {message ? (
          <p id="confirm-modal-desc" className="confirm-modal__message">
            {message}
          </p>
        ) : null}

        <div className="confirm-modal__actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={config.confirmClass}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}