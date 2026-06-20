import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../services/bffClient', () => ({
  bffClient: {
    post: vi.fn(),
  },
}));

import {
  loginUser,
  registerUser,
  resetUserPassword,
  normalizeEmail,
  isProfesorEmail,
  isEstudianteEmail,
  isApoderadoEmail,
  USER_ROLES,
} from '../../services/authMockService';

import { bffClient } from '../../services/bffClient';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

const registrarProfesor = (overrides = {}) =>
  registerUser({
    name: 'Ana López',
    email: 'ana@profesor.cl',
    password: 'clave123',
    ...overrides,
  });

const mockLoginSuccess = () => {
  bffClient.post.mockResolvedValue({
    data: {
      token: 'eyJhbGciOiJIUzI1NiJ9.test',
      username: 'ana@profesor.cl',
      nombre: 'Ana López',
      role: 'profesor',
    },
  });
};

const mockRegisterSuccess = () => {
  bffClient.post.mockResolvedValue({
    data: {
      token: 'eyJhbGciOiJIUzI1NiJ9.test',
      username: 'ana@profesor.cl',
      nombre: 'Ana López',
      role: 'profesor',
    },
  });
};

describe('normalizeEmail', () => {
  it('convierte a minúsculas y elimina espacios', () => {
    expect(normalizeEmail('  ANA@Profesor.CL  ')).toBe('ana@profesor.cl');
  });
});

describe('isProfesorEmail / isEstudianteEmail / isApoderadoEmail', () => {
  it('reconoce correo @profesor.cl como profesor', () => {
    expect(isProfesorEmail('ana@profesor.cl')).toBe(true);
  });

  it('reconoce correo @alum.cl como estudiante', () => {
    expect(isEstudianteEmail('pedro@alum.cl')).toBe(true);
  });

  it('reconoce correo @apod.cl como apoderado', () => {
    expect(isApoderadoEmail('maria@apod.cl')).toBe(true);
  });

  it('rechaza dominio externo en todas las funciones', () => {
    expect(isProfesorEmail('x@gmail.com')).toBe(false);
    expect(isEstudianteEmail('x@gmail.com')).toBe(false);
    expect(isApoderadoEmail('x@gmail.com')).toBe(false);
  });
});

describe('registerUser — casos exitosos', () => {
  it('registra un profesor con datos válidos', async () => {
    mockRegisterSuccess();
    const result = await registrarProfesor();
    expect(result.ok).toBe(true);
    expect(result.user.role).toBe(USER_ROLES.PROFESOR);
    expect(result.user.email).toBe('ana@profesor.cl');
  });

  it('almacena el token JWT en localStorage', async () => {
    mockRegisterSuccess();
    await registrarProfesor();
    expect(localStorage.getItem('coh_platform_token')).toBe('eyJhbGciOiJIUzI1NiJ9.test');
  });
});

describe('registerUser — validaciones y errores', () => {
  it('rechaza registro con nombre vacío', async () => {
    const result = await registrarProfesor({ name: '' });
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rechaza registro con correo de dominio externo', async () => {
    const result = await registrarProfesor({ email: 'ana@gmail.com' });
    expect(result.ok).toBe(false);
  });

  it('rechaza registro con contraseña vacía', async () => {
    const result = await registrarProfesor({ password: '' });
    expect(result.ok).toBe(false);
  });

  it('rechaza registro si el backend responde con error', async () => {
    bffClient.post.mockRejectedValue({
      response: { status: 400, data: { error: 'El usuario ya existe' } },
    });
    const result = await registrarProfesor();
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('loginUser — casos exitosos', () => {
  it('inicia sesión con credenciales correctas', async () => {
    mockLoginSuccess();
    const result = await loginUser({ email: 'ana@profesor.cl', password: 'clave123' });
    expect(result.ok).toBe(true);
    expect(result.user.name).toBe('Ana López');
    expect(result.user.role).toBe(USER_ROLES.PROFESOR);
  });

  it('almacena el token JWT en localStorage', async () => {
    mockLoginSuccess();
    await loginUser({ email: 'ana@profesor.cl', password: 'clave123' });
    expect(localStorage.getItem('coh_platform_token')).toBe('eyJhbGciOiJIUzI1NiJ9.test');
  });
});

describe('loginUser — casos de error', () => {
  it('falla si el backend rechaza las credenciales', async () => {
    bffClient.post.mockRejectedValue({
      response: { status: 401, data: { error: 'Credenciales inválidas' } },
    });
    const result = await loginUser({ email: 'ana@profesor.cl', password: 'incorrecta' });
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('falla si el correo es de dominio externo', async () => {
    const result = await loginUser({ email: 'ana@gmail.com', password: 'clave123' });
    expect(result.ok).toBe(false);
  });

  it('falla si la contraseña está vacía', async () => {
    const result = await loginUser({ email: 'ana@profesor.cl', password: '' });
    expect(result.ok).toBe(false);
  });
});

describe('resetUserPassword', () => {
  it('cambia la contraseña correctamente (mock local)', () => {
    const users = [{
      name: 'Ana López',
      email: 'ana@profesor.cl',
      password: 'clave123',
      role: 'profesor',
    }];
    localStorage.setItem('coh_platform_users', JSON.stringify(users));

    const reset = resetUserPassword({ email: 'ana@profesor.cl', newPassword: 'nuevaClave456' });
    expect(reset.ok).toBe(true);
  });

  it('falla si el correo no existe', () => {
    const result = resetUserPassword({ email: 'noexiste@profesor.cl', newPassword: 'nueva123' });
    expect(result.ok).toBe(false);
  });

  it('falla si la nueva contraseña está vacía', () => {
    const users = [{
      name: 'Ana López',
      email: 'ana@profesor.cl',
      password: 'clave123',
      role: 'profesor',
    }];
    localStorage.setItem('coh_platform_users', JSON.stringify(users));

    const result = resetUserPassword({ email: 'ana@profesor.cl', newPassword: '' });
    expect(result.ok).toBe(false);
  });

  it('falla si el correo es de dominio externo', () => {
    const result = resetUserPassword({ email: 'ana@gmail.com', newPassword: 'nueva123' });
    expect(result.ok).toBe(false);
  });
});
