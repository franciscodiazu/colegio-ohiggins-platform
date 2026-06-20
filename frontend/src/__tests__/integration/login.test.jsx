// ─────────────────────────────────────────────────────────────────────────────
// PRUEBAS DE INTEGRACIÓN — Componente: Login
// Verifica que el formulario de Login interactúa correctamente con
// useFieldValidation y authMockService: renderizado, validaciones en UI,
// flujo exitoso y manejo de errores reales del servicio.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../pages/Login';
import { registerUser } from '../../services/authMockService';

// Mocks de props requeridos por el componente
const mockOnLogin = vi.fn();
const mockOnGoToRegister = vi.fn();
const mockOnGoToForgot = vi.fn();

const renderLogin = () =>
  render(
    <Login
      onLogin={mockOnLogin}
      onGoToRegister={mockOnGoToRegister}
      onGoToForgot={mockOnGoToForgot}
    />
  );

// Limpiar entre pruebas
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ─── Helper: registrar un usuario de prueba en el mock storage ────────────────
const crearUsuarioPrueba = () =>
  registerUser({
    name: 'Ana López',
    email: 'ana@profesor.cl',
    password: 'clave123',
  });

// =============================================================================
// 1. RENDERIZADO
// =============================================================================

describe('Login — renderizado inicial', () => {
  it('muestra el campo de correo institucional', () => {
    renderLogin();
    expect(screen.getByLabelText(/correo institucional/i)).toBeInTheDocument();
  });

  it('muestra el campo de contraseña', () => {
    renderLogin();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('muestra el botón de inicio de sesión habilitado', () => {
    renderLogin();
    const btn = screen.getByRole('button', { name: /ingresar/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it('muestra el checkbox "Recordar sesión" marcado por defecto', () => {
    renderLogin();
    const checkbox = screen.getByRole('checkbox', { name: /recordar sesión/i });
    expect(checkbox).toBeChecked();
  });

  it('muestra el enlace para crear cuenta', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('muestra el enlace para recuperar contraseña', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /olvidé mi contraseña/i })).toBeInTheDocument();
  });
});

// =============================================================================
// 2. VALIDACIONES EN UI (integración hook + formulario)
// =============================================================================

describe('Login — validación de campos al enviar', () => {
  it('muestra error de correo obligatorio si se envía vacío', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    await waitFor(() => {
      expect(screen.getByText(/correo.*obligatorio/i)).toBeInTheDocument();
    });
  });

  it('muestra error de contraseña obligatoria si se envía vacía', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    await waitFor(() => {
      expect(screen.getByText(/contraseña.*obligatorio/i)).toBeInTheDocument();
    });
  });

  it('muestra error de formato de correo inválido', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/correo institucional/i);
    await userEvent.type(emailInput, 'correo-invalido');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
    });
  });

  it('limpia el error de correo al ingresar un valor válido', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/correo institucional/i);
    // Activar error
    fireEvent.blur(emailInput);
    await waitFor(() => expect(screen.getByText(/correo.*obligatorio/i)).toBeInTheDocument());
    // Corregir
    await userEvent.type(emailInput, 'ana@profesor.cl');
    await waitFor(() => expect(screen.queryByText(/correo.*obligatorio/i)).not.toBeInTheDocument());
  });
});

describe('Login — validación al perder foco (onBlur)', () => {
  it('muestra error de correo al hacer blur sin valor', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/correo institucional/i);
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText(/correo.*obligatorio/i)).toBeInTheDocument();
    });
  });

  it('muestra error de contraseña al hacer blur sin valor', async () => {
    renderLogin();
    const passInput = screen.getByLabelText(/contraseña/i);
    fireEvent.blur(passInput);
    await waitFor(() => {
      expect(screen.getByText(/contraseña.*obligatorio/i)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// 3. FLUJO DE LOGIN EXITOSO
// =============================================================================

describe('Login — flujo exitoso', () => {
  it('llama a onLogin con los datos del usuario al autenticar correctamente', async () => {
    crearUsuarioPrueba();
    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo institucional/i), 'ana@profesor.cl');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'clave123');
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledOnce();
      expect(mockOnLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'ana@profesor.cl' })
      );
    });
  });

  it('no llama a onLogin si el formulario tiene errores de validación', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    await waitFor(() => {
      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });
});

// =============================================================================
// 4. FLUJO DE LOGIN FALLIDO (errores del servicio)
// =============================================================================

describe('Login — errores del servicio', () => {
  it('muestra error cuando el correo no está registrado', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo institucional/i), 'noexiste@profesor.cl');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'clave123');
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/no encontramos una cuenta/i)).toBeInTheDocument();
    });
  });

  it('muestra error cuando la contraseña es incorrecta', async () => {
    crearUsuarioPrueba();
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo institucional/i), 'ana@profesor.cl');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'incorrecta');
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/correo o contrasena incorrectos/i)).toBeInTheDocument();
    });
  });

  it('no muestra error de servicio si el formulario ya lo rechaza por formato', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo institucional/i), 'correo-malo');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'clave123');
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      // El error de formato de UI debe estar presente
      expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
      // El servicio NO debería haber sido invocado, así que no hay error de "no encontramos cuenta"
      expect(screen.queryByText(/no encontramos una cuenta/i)).not.toBeInTheDocument();
    });
  });
});

// =============================================================================
// 5. NAVEGACIÓN DESDE LOGIN
// =============================================================================

describe('Login — navegación', () => {
  it('llama a onGoToRegister al hacer clic en "Crear cuenta"', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(mockOnGoToRegister).toHaveBeenCalledOnce();
  });

  it('llama a onGoToForgot al hacer clic en "Olvidé mi contraseña"', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /olvidé mi contraseña/i }));
    expect(mockOnGoToForgot).toHaveBeenCalledOnce();
  });
});
