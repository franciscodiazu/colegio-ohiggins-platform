// ─────────────────────────────────────────────────────────────────────────────
// PRUEBAS END-TO-END — Flujo de autenticación
// Simula el recorrido completo de un usuario real en el navegador:
// registro de cuenta → login → acceso al dashboard → logout.
// Requiere que la app esté corriendo (npm run dev o npm run preview).
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

// URL base de la aplicación (configurable desde playwright.config.js)
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

// ─── Helper: datos de usuario de prueba ──────────────────────────────────────
const USUARIO = {
  nombre: 'Ana López',
  email: `ana.test.${Date.now()}@profesor.cl`, // único por ejecución
  password: 'clave123',
};

// ─── Helper: limpiar localStorage entre pruebas ──────────────────────────────
const limpiarStorage = async (page) => {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
};

// =============================================================================
// 1. PANTALLA DE LOGIN — elementos visibles
// =============================================================================

test.describe('Login — pantalla inicial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('muestra el formulario de login al cargar la app sin sesión', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('muestra los campos de correo y contraseña', async ({ page }) => {
    await expect(page.getByLabel(/correo institucional/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  });

  test('muestra el botón "Ingresar" habilitado', async ({ page }) => {
    await expect(page.getByRole('button', { name: /ingresar/i })).toBeEnabled();
  });
});

// =============================================================================
// 2. REGISTRO DE CUENTA — flujo completo
// =============================================================================

test.describe('Register — flujo de registro', () => {
  test.beforeEach(async ({ page }) => {
    await limpiarStorage(page);
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
  });

  test('muestra el formulario de registro al navegar desde login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
  });

  test('muestra errores si se intenta registrar con campos vacíos', async ({ page }) => {
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await expect(page.getByText(/nombre.*obligatorio/i)).toBeVisible();
  });

  test('registra exitosamente un nuevo profesor', async ({ page }) => {
    await page.getByLabel(/nombre completo/i).fill(USUARIO.nombre);
    await page.getByLabel(/correo institucional/i).fill(USUARIO.email);

    const passFields = page.getByLabel(/contraseña/i);
    await passFields.nth(0).fill(USUARIO.password);
    await passFields.nth(1).fill(USUARIO.password);

    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page.getByText(/cuenta creada correctamente/i)).toBeVisible();
  });

  test('rechaza correo de dominio externo con mensaje apropiado', async ({ page }) => {
    await page.getByLabel(/correo institucional/i).fill('usuario@gmail.com');
    await page.getByLabel(/correo institucional/i).blur();
    await expect(page.getByText(/@profesor\.cl/i)).toBeVisible();
  });

  test('rechaza contraseñas que no coinciden', async ({ page }) => {
    const passFields = page.getByLabel(/contraseña/i);
    await passFields.nth(0).fill('clave123');
    await passFields.nth(1).fill('diferente');
    await passFields.nth(1).blur();
    await expect(page.getByText(/no coincide/i)).toBeVisible();
  });

  test('vuelve al login al hacer clic en "Volver a iniciar sesión"', async ({ page }) => {
    await page.getByRole('button', { name: /volver a iniciar sesión/i }).click();
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });
});

// =============================================================================
// 3. LOGIN — flujo completo
// =============================================================================

test.describe('Login — flujo de autenticación', () => {
  // Registrar usuario antes de las pruebas de login
  test.beforeEach(async ({ page }) => {
    await limpiarStorage(page);
    await page.goto(BASE_URL);

    // Registrar usuario via UI
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await page.getByLabel(/nombre completo/i).fill(USUARIO.nombre);
    await page.getByLabel(/correo institucional/i).fill(USUARIO.email);
    const passFields = page.getByLabel(/contraseña/i);
    await passFields.nth(0).fill(USUARIO.password);
    await passFields.nth(1).fill(USUARIO.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await page.getByText(/cuenta creada correctamente/i).waitFor();

    // Volver al login
    await page.getByRole('button', { name: /volver a iniciar sesión/i }).click();
  });

  test('muestra errores al intentar ingresar con campos vacíos', async ({ page }) => {
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page.getByText(/correo.*obligatorio/i)).toBeVisible();
    await expect(page.getByText(/contraseña.*obligatorio/i)).toBeVisible();
  });

  test('muestra error para credenciales incorrectas', async ({ page }) => {
    await page.getByLabel(/correo institucional/i).fill(USUARIO.email);
    await page.getByLabel(/contraseña/i).fill('claveincorrecta');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page.getByText(/correo o contrasena incorrectos/i)).toBeVisible();
  });

  test('muestra error para correo no registrado', async ({ page }) => {
    await page.getByLabel(/correo institucional/i).fill('noexiste@profesor.cl');
    await page.getByLabel(/contraseña/i).fill('clave123');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page.getByText(/no encontramos una cuenta/i)).toBeVisible();
  });

  test('accede al dashboard con credenciales correctas', async ({ page }) => {
    await page.getByLabel(/correo institucional/i).fill(USUARIO.email);
    await page.getByLabel(/contraseña/i).fill(USUARIO.password);
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Verificar que el dashboard está visible (navbar + contenido principal)
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });
});

// =============================================================================
// 4. SESIÓN PERSISTENTE — recarga de página
// =============================================================================

test.describe('Sesión — persistencia en localStorage', () => {
  test('mantiene la sesión activa tras recargar la página', async ({ page }) => {
    await limpiarStorage(page);
    await page.goto(BASE_URL);

    // Registrar e iniciar sesión
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await page.getByLabel(/nombre completo/i).fill(USUARIO.nombre);
    await page.getByLabel(/correo institucional/i).fill(USUARIO.email);
    const passFields = page.getByLabel(/contraseña/i);
    await passFields.nth(0).fill(USUARIO.password);
    await passFields.nth(1).fill(USUARIO.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await page.getByText(/cuenta creada correctamente/i).waitFor();
    await page.getByRole('button', { name: /volver a iniciar sesión/i }).click();

    await page.getByLabel(/correo institucional/i).fill(USUARIO.email);
    await page.getByLabel(/contraseña/i).fill(USUARIO.password);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await page.getByRole('navigation').waitFor();

    // Recargar
    await page.reload();

    // La sesión debe mantenerse (dashboard visible, no el login)
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).not.toBeVisible();
  });
});

// =============================================================================
// 5. LOGOUT — cierre de sesión
// =============================================================================

test.describe('Logout — cierre de sesión', () => {
  test.beforeEach(async ({ page }) => {
    await limpiarStorage(page);
    await page.goto(BASE_URL);

    // Registrar e iniciar sesión
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await page.getByLabel(/nombre completo/i).fill(USUARIO.nombre);
    await page.getByLabel(/correo institucional/i).fill(USUARIO.email);
    const passFields = page.getByLabel(/contraseña/i);
    await passFields.nth(0).fill(USUARIO.password);
    await passFields.nth(1).fill(USUARIO.password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await page.getByText(/cuenta creada correctamente/i).waitFor();
    await page.getByRole('button', { name: /volver a iniciar sesión/i }).click();
    await page.getByLabel(/correo institucional/i).fill(USUARIO.email);
    await page.getByLabel(/contraseña/i).fill(USUARIO.password);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await page.getByRole('navigation').waitFor();
  });

  test('vuelve al login después de cerrar sesión', async ({ page }) => {
    // Buscar el botón de logout en el navbar
    await page.getByRole('button', { name: /cerrar sesión|salir|logout/i }).click();
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('elimina la sesión de localStorage al cerrar sesión', async ({ page }) => {
    await page.getByRole('button', { name: /cerrar sesión|salir|logout/i }).click();
    const session = await page.evaluate(() =>
      localStorage.getItem('coh_platform_session')
    );
    expect(session).toBeNull();
  });
});
