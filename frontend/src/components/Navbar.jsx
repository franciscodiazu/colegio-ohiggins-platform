// ─── Constantes ───────────────────────────────────────────────────────────────
import React from 'react';

const ROL_LABEL = {
  profesor: 'Profesor',
  estudiante: 'Estudiante',
  apoderado: 'Apoderado',
};

const ROL_BADGE_CLASS = {
  profesor: 'session-role-badge session-role-badge--profesor',
  estudiante: 'session-role-badge session-role-badge--estudiante',
  apoderado: 'session-role-badge session-role-badge--apoderado',
};

const DEFAULT_ITEMS = [
  { key: 'estudiantes', label: 'Estudiantes' },
  { key: 'asistencia', label: 'Asistencia' },
  { key: 'evaluaciones', label: 'Evaluaciones y Notas' },
];

// ─── Helper: obtener inicial del nombre ───────────────────────────────────────

const getInitial = (name, email) => {
  if (name && name.trim()) return name.trim()[0].toUpperCase();
  if (email && email.trim()) return email.trim()[0].toUpperCase();
  return '?';
};

// ─── Componente: Avatar con inicial ───────────────────────────────────────────

function UserAvatar({ name, email }) {
  return (
    <div className="session-avatar" aria-hidden="true">
      {getInitial(name, email)}
    </div>
  );
}

// ─── Componente: Badge de rol ──────────────────────────────────────────────────

function RoleBadge({ role }) {
  if (!role) return null;
  return (
    <span className={ROL_BADGE_CLASS[role] || 'session-role-badge'}>
      {ROL_LABEL[role] || role}
    </span>
  );
}

// ─── Componente principal: Navbar ─────────────────────────────────────────────

export default function Navbar({
  items = DEFAULT_ITEMS,
  activeKey,
  onChange,
  session,
  onLogout,
}) {
  return (
    <header className="app-header" role="banner">

      {/* Logo */}
      <div className="app-header__brand">
        <img
          src="/logo.svg"
          alt="Colegio Bernardo O'Higgins"
          className="app-header__logo"
        />
      </div>

      {/* Navegación */}
      <nav className="app-header__nav" aria-label="Navegación principal">
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChange(item.key)}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sesión del usuario */}
      {session ? (
        <div className="app-header__session">
          <UserAvatar name={session.name} email={session.email} />
          <div className="session-info">
            <span className="session-info__name">
              {session.name || session.email}
            </span>
            <RoleBadge role={session.role} />
          </div>
          <button
            type="button"
            className="btn btn--logout"
            onClick={onLogout}
            aria-label="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      ) : null}

    </header>
  );
}