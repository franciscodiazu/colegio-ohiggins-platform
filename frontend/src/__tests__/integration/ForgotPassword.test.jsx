import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ForgotPassword from '../../pages/ForgotPassword';

// Mock del servicio y del layout para aislar el componente
vi.mock('../../services/authService', () => ({
  resetUserPassword: vi.fn(),
}));

vi.mock('../../components/layout/BaseLayout', () => ({
  LayoutCard: ({ children }) => <div>{children}</div>,
  LayoutSection: ({ children }) => <div>{children}</div>,
}));

import { resetUserPassword } from '../../services/authService';

const mockOnGoToLogin = vi.fn();

const renderForgotPassword = () =>
  render(<ForgotPassword onGoToLogin={mockOnGoToLogin} />);

const fillForm = async ({ email = '', newPassword = '', confirmPassword = '' } = {}) => {
  if (email) await userEvent.type(screen.getByLabelText(/correo institucional/i), email);
  if (newPassword) await userEvent.type(screen.getByLabelText(/^nueva contraseña/i), newPassword);
  if (confirmPassword) await userEvent.type(screen.getByLabelText(/confirmar nueva contraseña/i), confirmPassword);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ForgotPassword — renderizado inicial', () => {
  it('muestra el campo de correo institucional', () => {
    renderForgotPassword();
    expect(screen.getByLabelText(/correo institucional/i)).toBeInTheDocument();
  });

  it('muestra el campo de nueva contraseña', () => {
    renderForgotPassword();
    expect(screen.getByLabelText(/^nueva contraseña/i)).toBeInTheDocument();
  });

  it('muestra el campo de confirmar nueva contraseña', () => {
    renderForgotPassword();
    expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toBeInTheDocument();
  });

  it('muestra el botón de guardar habilitado', () => {
    renderForgotPassword();
    const btn = screen.getByRole('button', { name: /guardar nueva contraseña/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it('muestra el enlace para volver al login', () => {
    renderForgotPassword();
    expect(
      screen.getByRole('button', { name: /volver a iniciar sesión/i })
    ).toBeInTheDocument();
  });

  it('no muestra error ni éxito al cargar', () => {
    renderForgotPassword();
    expect(screen.queryByRole('paragraph', { class: 'form-error' })).not.toBeInTheDocument();
    expect(screen.queryByRole('paragraph', { class: 'form-success' })).not.toBeInTheDocument();
  });
});

describe('ForgotPassword — validación de contraseñas', () => {
  it('muestra error cuando las contraseñas no coinciden', async () => {
    renderForgotPassword();

    await fillForm({
      email: 'test@colegio.cl',
      newPassword: 'abc123',
      confirmPassword: 'xyz999',
    });

    await userEvent.click(screen.getByRole('button', { name: /guardar nueva contraseña/i }));

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  it('no llama al servicio si las contraseñas no coinciden', async () => {
    renderForgotPassword();

    await fillForm({
      email: 'test@colegio.cl',
      newPassword: 'abc123',
      confirmPassword: 'diferente',
    });

    await userEvent.click(screen.getByRole('button', { name: /guardar nueva contraseña/i }));

    expect(resetUserPassword).not.toHaveBeenCalled();
  });
});

describe('ForgotPassword — flujo exitoso', () => {
  it('muestra mensaje de éxito cuando el servicio responde ok', async () => {
    resetUserPassword.mockReturnValue({ ok: true });
    renderForgotPassword();

    await fillForm({
      email: 'test@colegio.cl',
      newPassword: 'nueva123',
      confirmPassword: 'nueva123',
    });

    await userEvent.click(screen.getByRole('button', { name: /guardar nueva contraseña/i }));

    expect(
      screen.getByText(/contraseña actualizada/i)
    ).toBeInTheDocument();
  });

  it('limpia los campos tras un reset exitoso', async () => {
    resetUserPassword.mockReturnValue({ ok: true });
    renderForgotPassword();

    await fillForm({
      email: 'test@colegio.cl',
      newPassword: 'nueva123',
      confirmPassword: 'nueva123',
    });

    await userEvent.click(screen.getByRole('button', { name: /guardar nueva contraseña/i }));

    expect(screen.getByLabelText(/correo institucional/i)).toHaveValue('');
    expect(screen.getByLabelText(/^nueva contraseña/i)).toHaveValue('');
    expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toHaveValue('');
  });

  it('llama al servicio con email y nueva contraseña correctos', async () => {
    resetUserPassword.mockReturnValue({ ok: true });
    renderForgotPassword();

    await fillForm({
      email: 'genesis@colegio.cl',
      newPassword: 'clave456',
      confirmPassword: 'clave456',
    });

    await userEvent.click(screen.getByRole('button', { name: /guardar nueva contraseña/i }));

    expect(resetUserPassword).toHaveBeenCalledWith({
      email: 'genesis@colegio.cl',
      newPassword: 'clave456',
    });
  });
});

describe('ForgotPassword — errores del servicio', () => {
  it('muestra el error cuando el servicio responde con error', async () => {
    resetUserPassword.mockReturnValue({ ok: false, error: 'Correo no registrado.' });
    renderForgotPassword();

    await fillForm({
      email: 'noexiste@colegio.cl',
      newPassword: 'clave123',
      confirmPassword: 'clave123',
    });

    await userEvent.click(screen.getByRole('button', { name: /guardar nueva contraseña/i }));

    expect(screen.getByText('Correo no registrado.')).toBeInTheDocument();
  });

  it('no muestra mensaje de éxito cuando hay error del servicio', async () => {
    resetUserPassword.mockReturnValue({ ok: false, error: 'Correo no registrado.' });
    renderForgotPassword();

    await fillForm({
      email: 'noexiste@colegio.cl',
      newPassword: 'clave123',
      confirmPassword: 'clave123',
    });

    await userEvent.click(screen.getByRole('button', { name: /guardar nueva contraseña/i }));

    expect(screen.queryByText(/contraseña actualizada/i)).not.toBeInTheDocument();
  });
});

describe('ForgotPassword — navegación', () => {
  it('llama a onGoToLogin al hacer clic en "Volver a iniciar sesión"', async () => {
    renderForgotPassword();

    await userEvent.click(
      screen.getByRole('button', { name: /volver a iniciar sesión/i })
    );

    expect(mockOnGoToLogin).toHaveBeenCalledTimes(1);
  });
});