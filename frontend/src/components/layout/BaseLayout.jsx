import React from 'react';

const joinClassNames = (...values) => values.filter(Boolean).join(' ');

export function LayoutContainer({ children }) {
  return <div className="layout-container">{children}</div>;
}

export function LayoutSection({ title, subtitle, children, className }) {
  return (
    <section className={joinClassNames('layout-section', className)}>
      <header className="layout-section__header">
        <h2 className="layout-section__title">{title}</h2>
        {subtitle ? <p className="layout-section__subtitle">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function LayoutCard({ children, className }) {
  return <article className={joinClassNames('layout-card', className)}>{children}</article>;
}
