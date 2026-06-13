// ─────────────────────────────────────────────────────────────────────────────
// PRUEBAS UNITARIAS — Servicio: authMockService
// Verifica la lógica de negocio de registro, login, reset de contraseña
// y las funciones auxiliares (normalizeEmail, isProfesorEmail, etc.)
// sin depender de la UI ni del BFF real.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
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

// localStorage ya está disponible en jsdom (entorno de Vitest)
// Limpiamos el storage antes de cada prueba para aislar los casos
beforeEach(() => {
  localStorage.clear();
});

// ─── Helper: registra un usuario válido de prueba ─────────────────────────────
const registrarProfesor = (overrides = {}) =>
  registerUser({
    name: 'Ana López',
    email: 'ana@profesor.cl',
    password: 'clave123',
    ...overrides,
  });

// =============================================================================
// 1. FUNCIONES AUXILIARES
// =============================================================================

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

// =============================================================================
// 2. registerUser
// =============================================================================

describe('registerUser — casos exitosos', () => {
  it('registra un profesor con datos válidos', () => {
    const result = registrarProfesor();
    expect(result.ok).toBe(true);
    expect(result.user.role).toBe(USER_ROLES.PROFESOR);
    expect(result.user.email).toBe('ana@profesor.cl');
  });

  it('infiere el rol ESTUDIANTE para correo @alum.cl', () => {
    const result = registerUser({
      name: 'Pedro García',
      email: 'pedro@alum.cl',
      password: 'clave123',
    });
    expect(result.ok).toBe(true);
    expect(result.user.role).toBe(USER_ROLES.ESTUDIANTE);
  });

  it('infiere el rol APODERADO para correo @apod.cl', () => {
    const result = registerUser({
      name: 'María Torres',
      email: 'maria@apod.cl',
      password: 'clave123',
    });
    expect(result.ok).toBe(true);
    expect(result.user.role).toBe(USER_ROLES.APODERADO);
  });

  it('persiste el usuario en localStorage', () => {
    registrarProfesor();
    const stored = JSON.parse(localStorage.getItem('coh_platform_users'));
    expect(stored).toHaveLength(1);
    expect(stored[0].email).toBe('ana@profesor.cl');
  });
});

describe('registerUser — validaciones y errores', () => {
  it('rechaza registro con nombre vacío', () => {
    const result = registrarProfesor({ name: '' });
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rechaza registro con correo de dominio externo', () => {
    const result = registrarProfesor({ email: 'ana@gmail.com' });
    expect(result.ok).toBe(false);
  });

  it('rechaza registro con contraseña vacía', () => {
    const result = registrarProfesor({ password: '' });
    expect(result.ok).toBe(false);
  });

  it('rechaza registro si el correo ya existe', () => {
    registrarProfesor();
    const result = registrarProfesor(); // segundo intento con mismo correo
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('normaliza el correo antes de verificar duplicados', () => {
    registrarProfesor({ email: 'ana@profesor.cl' });
    const result = registrarProfesor({ email: 'ANA@PROFESOR.CL' }); // mismo correo, distinta capitalización
    expect(result.ok).toBe(false);
  });
});

// =============================================================================
// 3. loginUser
// =============================================================================

describe('loginUser — casos exitosos', () => {
  it('inicia sesión con credenciales correctas', () => {
    registrarProfesor();
    const result = loginUser({ email: 'ana@profesor.cl', password: 'clave123' });
    expect(result.ok).toBe(true);
    expect(result.user.name).toBe('Ana López');
    expect(result.user.role).toBe(USER_ROLES.PROFESOR);
  });

  it('normaliza el correo al iniciar sesión', () => {
    registrarProfesor();
    const result = loginUser({ email: '  ANA@PROFESOR.CL  ', password: 'clave123' });
    expect(result.ok).toBe(true);
  });
});

describe('loginUser — casos de error', () => {
  it('falla si el correo no existe', () => {
    const result = loginUser({ email: 'noexiste@profesor.cl', password: 'clave123' });
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('falla si la contraseña es incorrecta', () => {
    registrarProfesor();
    const result = loginUser({ email: 'ana@profesor.cl', password: 'incorrecta' });
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('falla si el correo es de dominio externo', () => {
    const result = loginUser({ email: 'ana@gmail.com', password: 'clave123' });
    expect(result.ok).toBe(false);
  });

  it('falla si la contraseña está vacía', () => {
    registrarProfesor();
    const result = loginUser({ email: 'ana@profesor.cl', password: '' });
    expect(result.ok).toBe(false);
  });

  it('no expone la contraseña en el objeto user retornado', () => {
    registrarProfesor();
    const result = loginUser({ email: 'ana@profesor.cl', password: 'clave123' });
    expect(result.user).not.toHaveProperty('password');
  });
});

// =============================================================================
// 4. resetUserPassword
// =============================================================================

describe('resetUserPassword — casos exitosos', () => {
  it('cambia la contraseña correctamente', () => {
    registrarProfesor();
    const reset = resetUserPassword({ email: 'ana@profesor.cl', newPassword: 'nuevaClave456' });
    expect(reset.ok).toBe(true);
  });

  it('permite el login con la nueva contraseña tras el reset', () => {
    registrarProfesor();
    resetUserPassword({ email: 'ana@profesor.cl', newPassword: 'nuevaClave456' });
    const login = loginUser({ email: 'ana@profesor.cl', password: 'nuevaClave456' });
    expect(login.ok).toBe(true);
  });

  it('invalida la contraseña anterior tras el reset', () => {
    registrarProfesor();
    resetUserPassword({ email: 'ana@profesor.cl', newPassword: 'nuevaClave456' });
    const login = loginUser({ email: 'ana@profesor.cl', password: 'clave123' });
    expect(login.ok).toBe(false);
  });
});

describe('resetUserPassword — errores', () => {
  it('falla si el correo no existe', () => {
    const result = resetUserPassword({ email: 'noexiste@profesor.cl', newPassword: 'nueva123' });
    expect(result.ok).toBe(false);
  });

  it('falla si la nueva contraseña está vacía', () => {
    registrarProfesor();
    const result = resetUserPassword({ email: 'ana@profesor.cl', newPassword: '' });
    expect(result.ok).toBe(false);
  });

  it('falla si el correo es de dominio externo', () => {
    const result = resetUserPassword({ email: 'ana@gmail.com', newPassword: 'nueva123' });
    expect(result.ok).toBe(false);
  });
});
