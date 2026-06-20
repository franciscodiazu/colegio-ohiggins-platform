import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import NotFound from '../../pages/NotFound';

describe('NotFound — renderizado inicial', () => {
  it('muestra el código 404', () => {
    render(<NotFound onGoHome={vi.fn()} />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('muestra el título de página no encontrada', () => {
    render(<NotFound onGoHome={vi.fn()} />);
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('muestra el mensaje descriptivo', () => {
    render(<NotFound onGoHome={vi.fn()} />);
    expect(
      screen.getByText(/La sección que buscas no existe/i)
    ).toBeInTheDocument();
  });

  it('muestra el botón "Volver al inicio"', () => {
    render(<NotFound onGoHome={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /volver al inicio/i })
    ).toBeInTheDocument();
  });

  it('el código 404 tiene aria-hidden="true"', () => {
    render(<NotFound onGoHome={vi.fn()} />);
    const code = screen.getByText('404');
    expect(code).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('NotFound — navegación', () => {
  it('llama a onGoHome al hacer clic en el botón', async () => {
    const mockOnGoHome = vi.fn();
    render(<NotFound onGoHome={mockOnGoHome} />);

    await userEvent.click(screen.getByRole('button', { name: /volver al inicio/i }));

    expect(mockOnGoHome).toHaveBeenCalledTimes(1);
  });

  it('no llama a onGoHome si no se hace clic', () => {
    const mockOnGoHome = vi.fn();
    render(<NotFound onGoHome={mockOnGoHome} />);

    expect(mockOnGoHome).not.toHaveBeenCalled();
  });
});