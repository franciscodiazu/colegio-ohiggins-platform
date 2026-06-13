// src/__tests__/integration/Register.test.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PRUEBAS DE INTEGRACIÓN — Componente: Register
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../../pages/Register';
import { registerUser } from '../../services/authMockService';

const mockOnGoToLogin = vi.fn();

const renderRegister = () =>
  render(<Register onGoToLogin={mockOnGoToLogin} />);

// Limpiar DOM y storage antes Y después de cada test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  cleanup();
});

afterEach(() => {
  cleanup();
});

// ─── Helper: rellenar el formulario ──────────────────────────────────────────
const completarFormulario = async ({
  nombre = 'Ana López',
  email = 'ana@profesor.cl',
  password = 'clave123',
  confirmacion = 'clave123',
} = {}) => {
  if (nombre) await userEvent.type(screen.getByLabelText(/nombre completo/i), nombre);
  if (email) await userEvent.type(screen.getByLabelText(/correo institucional/i), email);

  const passInputs = screen.getAllByLabelText(/contraseña/i);
  if (password) await userEvent.type(passInputs[0], password);
  if (confirmacion) await userEvent.type(passInputs[1], confirmacion);
};

// =============================================================================
// 1. RENDERIZADO
// =============================================================================

describe('Register — renderizado inicial', () => {
  it('muestra el campo de nombre completo', () => {
    renderRegister();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  it('muestra el campo de correo institucional', () => {
    renderRegister();
    expect(screen.getByLabelText(/correo institucional/i)).toBeInTheDocument();
  });

  it('muestra dos campos de contraseña', () => {
    renderRegister();
    const passFields = screen.getAllByLabelText(/contraseña/i);
    expect(passFields).toHaveLength(2);
  });

  it('muestra el botón de crear cuenta habilitado', () => {
    renderRegister();
    const btn = screen.getByRole('button', { name: /crear cuenta/i });
    expect(btn).not.toBeDisabled();
  });
});

// =============================================================================
// 2. VALIDACIONES EN UI
// =============================================================================

describe('Register — validaciones al enviar', () => {
  it('muestra errores cuando todos los campos están vacíos', async () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/nombre.*obligatorio/i)).toBeInTheDocument();
    });
  });

  it('rechaza correo de dominio externo con mensaje institucional', async () => {
    renderRegister();
    const emailInput = screen.getByLabelText(/correo institucional/i);
    await userEvent.type(emailInput, 'ana@gmail.com');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText(/@profesor\.cl/i)).toBeInTheDocument();
    });
  });

  it('muestra error cuando la contraseña es menor a 6 caracteres', async () => {
    renderRegister();
    const passInputs = screen.getAllByLabelText(/contraseña/i);
    await userEvent.type(passInputs[0], 'abc');
    fireEvent.blur(passInputs[0]);
    await waitFor(() => {
      expect(screen.getByText(/al menos 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it('muestra error cuando las contraseñas no coinciden', async () => {
    renderRegister();
    const passInputs = screen.getAllByLabelText(/contraseña/i);
    await userEvent.type(passInputs[0], 'clave123');
    await userEvent.type(passInputs[1], 'diferente');
    fireEvent.blur(passInputs[1]);
    await waitFor(() => {
      expect(screen.getByText(/no coincide/i)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// 3. FLUJO EXITOSO
// =============================================================================

describe('Register — flujo exitoso', () => {
  it('muestra mensaje de éxito al registrarse correctamente', async () => {
    renderRegister();
    await completarFormulario();
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/cuenta creada correctamente/i)).toBeInTheDocument();
    });
  });

  it('limpia todos los campos tras un registro exitoso', async () => {
    renderRegister();
    await completarFormulario();
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => screen.getByText(/cuenta creada correctamente/i));

    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('');
    expect(screen.getByLabelText(/correo institucional/i)).toHaveValue('');
  });

  it('guarda el usuario en localStorage tras el registro', async () => {
    renderRegister();
    await completarFormulario();
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => screen.getByText(/cuenta creada correctamente/i));

    const stored = JSON.parse(localStorage.getItem('coh_platform_users'));
    expect(stored).toHaveLength(1);
    expect(stored[0].email).toBe('ana@profesor.cl');
  });
});

// =============================================================================
// 4. ERRORES DEL SERVICIO
// =============================================================================

describe('Register — errores del servicio', () => {
  it('muestra error si el correo ya está registrado', async () => {
    // Registrar directamente en el servicio (sin UI previa)
    registerUser({
      name: 'Ana López',
      email: 'ana@profesor.cl',
      password: 'clave123',
    });

    // Renderizar formulario limpio e intentar registrar el mismo correo
    renderRegister();
    await completarFormulario();
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/ya tienes una cuenta registrada/i)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// 5. NAVEGACIÓN
// =============================================================================

describe('Register — navegación', () => {
  it('llama a onGoToLogin al hacer clic en "Volver a iniciar sesión"', () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /volver a iniciar sesión/i }));
    expect(mockOnGoToLogin).toHaveBeenCalledOnce();
  });
});