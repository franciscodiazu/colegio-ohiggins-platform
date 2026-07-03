import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '../../components/ErrorBoundary';

function Bomb({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Explosion controlada');
  }
  return <p>Todo bien</p>;
}

describe('ErrorBoundary', () => {
  it('renderiza los hijos cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <p>Hijo sano</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hijo sano')).toBeInTheDocument();
  });

  it('captura el error y muestra fallback UI', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salio mal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volver al inicio/i })).toBeInTheDocument();

    console.error.mockRestore();
  });

  it('el boton reintentar existe en la UI de fallback', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    expect(retryBtn).toBeInTheDocument();

    console.error.mockRestore();
  });

  it('el boton volver al inicio existe en la UI de fallback', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    const homeBtn = screen.getByRole('button', { name: /volver al inicio/i });
    expect(homeBtn).toBeInTheDocument();

    console.error.mockRestore();
  });

  it('muestra detalle del error en desarrollo', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Explosion controlada/)).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
    console.error.mockRestore();
  });

  it('oculta detalle del error en produccion', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Explosion controlada/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
    console.error.mockRestore();
  });
});
