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

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('No se pudo leer usuarios mock:', error);
    return [];
  }
};

const writeUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const normalizeEmail = (email) => email.trim().toLowerCase();

export const isProfesorEmail = (email) => PROFESOR_DOMAIN_REGEX.test(normalizeEmail(email));
export const isEstudianteEmail = (email) => ESTUDIANTE_DOMAIN_REGEX.test(normalizeEmail(email));
export const isApoderadoEmail = (email) => APODERADO_DOMAIN_REGEX.test(normalizeEmail(email));

const inferRoleFromEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (isProfesorEmail(normalizedEmail)) {
    return USER_ROLES.PROFESOR;
  }

  if (isEstudianteEmail(normalizedEmail)) {
    return USER_ROLES.ESTUDIANTE;
  }

  if (isApoderadoEmail(normalizedEmail)) {
    return USER_ROLES.APODERADO;
  }

  return null;
};

const isValidEmail = (email) => {
  return inferRoleFromEmail(email) !== null;
};

export const registerUser = ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const inferredRole = inferRoleFromEmail(normalizedEmail);
  const users = readUsers();

  if (!name.trim() || !normalizedEmail || !password.trim()) {
    return { ok: false, error: AUTH_MESSAGES.REQUIRED_REGISTER };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: AUTH_MESSAGES.INVALID_EMAIL };
  }

  const exists = users.some((user) => user.email === normalizedEmail);
  if (exists) {
    return { ok: false, error: AUTH_MESSAGES.ACCOUNT_EXISTS };
  }

  const nextUser = {
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: inferredRole,
  };

  writeUsers([...users, nextUser]);
  return {
    ok: true,
    user: { name: nextUser.name, email: nextUser.email, role: nextUser.role },
  };
};

export const loginUser = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const inferredRole = inferRoleFromEmail(normalizedEmail);

  if (!normalizedEmail || !password.trim()) {
    return { ok: false, error: AUTH_MESSAGES.REQUIRED_LOGIN };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: AUTH_MESSAGES.LOGIN_FAILED };
  }

  const users = readUsers();
  const found = users.find((user) => user.email === normalizedEmail);

  if (!found) {
    return { ok: false, error: AUTH_MESSAGES.ACCOUNT_NOT_FOUND };
  }

  if (found.password !== password) {
    return { ok: false, error: AUTH_MESSAGES.LOGIN_FAILED };
  }

  return {
    ok: true,
    user: { name: found.name, email: found.email, role: found.role || inferredRole || USER_ROLES.PROFESOR },
  };
};

export const resetUserPassword = ({ email, newPassword }) => {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();

  if (!normalizedEmail || !newPassword.trim()) {
    return { ok: false, error: AUTH_MESSAGES.REQUIRED_RESET };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: AUTH_MESSAGES.INVALID_EMAIL };
  }

  const index = users.findIndex((user) => user.email === normalizedEmail);
  if (index === -1) {
    return { ok: false, error: AUTH_MESSAGES.ACCOUNT_NOT_FOUND };
  }

  const nextUsers = [...users];
  nextUsers[index] = {
    ...nextUsers[index],
    password: newPassword,
  };

  writeUsers(nextUsers);
  return { ok: true };
};
