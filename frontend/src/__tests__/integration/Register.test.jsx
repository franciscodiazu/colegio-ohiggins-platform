import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../../pages/Register';

const { mockRegisterUser } = vi.hoisted(() => ({
  mockRegisterUser: vi.fn(),
}));

vi.mock('../../services/authService', () => ({
  registerUser: mockRegisterUser,
  loginUser: vi.fn(),
  resetUserPassword: vi.fn(),
  normalizeEmail: (e) => e.trim().toLowerCase(),
  isProfesorEmail: (e) => /@profesor\.cl$/i.test(e),
  isEstudianteEmail: (e) => /@alum\.cl$/i.test(e),
  isApoderadoEmail: (e) => /@apod\.cl$/i.test(e),
  USER_ROLES: { APODERADO: 'apoderado', ESTUDIANTE: 'estudiante', PROFESOR: 'profesor' },
}));

const mockOnGoToLogin = vi.fn();

const renderRegister = () =>
  render(<Register onGoToLogin={mockOnGoToLogin} />);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  cleanup();
  mockRegisterUser.mockResolvedValue({ ok: true, user: { email: 'ana@profesor.cl', name: 'Ana López', role: 'profesor' } });
});

afterEach(() => {
  cleanup();
});

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
});

describe('Register — errores del servicio', () => {
  it('muestra error si el correo ya está registrado', async () => {
    mockRegisterUser.mockResolvedValueOnce({ ok: false, error: 'Ya tienes una cuenta registrada. Puedes iniciar sesion o recuperar tu contrasena.' });

    renderRegister();
    await completarFormulario();
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/ya tienes una cuenta registrada/i)).toBeInTheDocument();
    });
  });
});

describe('Register — navegación', () => {
  it('llama a onGoToLogin al hacer clic en "Volver a iniciar sesión"', () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /volver a iniciar sesión/i }));
    expect(mockOnGoToLogin).toHaveBeenCalledOnce();
  });
});
