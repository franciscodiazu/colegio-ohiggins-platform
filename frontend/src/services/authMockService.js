import { bffClient } from './bffClient';

const TOKEN_KEY = 'coh_platform_token';
const USERS_STORAGE_KEY = 'coh_platform_users';

const PROFESOR_DOMAIN_REGEX = /^[^\s@]+@profesor\.cl$/i;
const ESTUDIANTE_DOMAIN_REGEX = /^[^\s@]+@alum\.cl$/i;
const APODERADO_DOMAIN_REGEX = /^[^\s@]+@apod\.cl$/i;

export const USER_ROLES = {
  APODERADO: 'apoderado',
  ESTUDIANTE: 'estudiante',
  PROFESOR: 'profesor',
};

const AUTH_MESSAGES = {
  REQUIRED_REGISTER: 'Completa nombre, correo y contrasena para continuar.',
  REQUIRED_LOGIN: 'Ingresa tu correo y contrasena para continuar.',
  REQUIRED_RESET: 'Ingresa tu correo y la nueva contrasena para continuar.',
  INVALID_EMAIL: 'No pudimos validar el correo ingresado. Revisa tus datos e intenta nuevamente.',
  ACCOUNT_EXISTS: 'Ya tienes una cuenta registrada. Puedes iniciar sesion o recuperar tu contrasena.',
  LOGIN_FAILED: 'Correo o contrasena incorrectos.',
  ACCOUNT_NOT_FOUND: 'No encontramos una cuenta asociada a ese correo.',
};

export const normalizeEmail = (email) => email.trim().toLowerCase();

export const isProfesorEmail = (email) => PROFESOR_DOMAIN_REGEX.test(normalizeEmail(email));
export const isEstudianteEmail = (email) => ESTUDIANTE_DOMAIN_REGEX.test(normalizeEmail(email));
export const isApoderadoEmail = (email) => APODERADO_DOMAIN_REGEX.test(normalizeEmail(email));

const inferRoleFromEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (isProfesorEmail(normalizedEmail)) return USER_ROLES.PROFESOR;
  if (isEstudianteEmail(normalizedEmail)) return USER_ROLES.ESTUDIANTE;
  if (isApoderadoEmail(normalizedEmail)) return USER_ROLES.APODERADO;
  return null;
};

const isValidEmail = (email) => inferRoleFromEmail(email) !== null;

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password?.trim()) {
    return { ok: false, error: AUTH_MESSAGES.REQUIRED_LOGIN };
  }

  try {
    const response = await bffClient.post('/api/v1/auth/login', {
      username: normalizedEmail,
      password,
    });

    const { token, username, nombre, role } = response.data;

    localStorage.setItem(TOKEN_KEY, token);

    return {
      ok: true,
      user: { email: username, name: nombre, role },
    };
  } catch (err) {
    const msg = err.response?.data?.error || AUTH_MESSAGES.LOGIN_FAILED;
    return { ok: false, error: msg };
  }
};

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!name?.trim() || !normalizedEmail || !password?.trim()) {
    return { ok: false, error: AUTH_MESSAGES.REQUIRED_REGISTER };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: AUTH_MESSAGES.INVALID_EMAIL };
  }

  try {
    const response = await bffClient.post('/api/v1/auth/register', {
      nombre: name.trim(),
      username: normalizedEmail,
      password,
    });

    const { token, username, nombre, role } = response.data;

    localStorage.setItem(TOKEN_KEY, token);

    return {
      ok: true,
      user: { email: username, name: nombre, role },
    };
  } catch (err) {
    if (err.response?.status === 400) {
      return { ok: false, error: err.response.data?.error || AUTH_MESSAGES.ACCOUNT_EXISTS };
    }
    return { ok: false, error: 'Error de conexión con el servidor.' };
  }
};

export const resetUserPassword = ({ email, newPassword }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !newPassword?.trim()) {
    return { ok: false, error: AUTH_MESSAGES.REQUIRED_RESET };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: AUTH_MESSAGES.INVALID_EMAIL };
  }

  const users = (() => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  })();

  const index = users.findIndex((user) => user.email === normalizedEmail);
  if (index === -1) {
    return { ok: false, error: AUTH_MESSAGES.ACCOUNT_NOT_FOUND };
  }

  const nextUsers = [...users];
  nextUsers[index] = { ...nextUsers[index], password: newPassword };
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));

  return { ok: true };
};
