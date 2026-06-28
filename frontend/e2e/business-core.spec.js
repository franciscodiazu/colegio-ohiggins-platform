import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

const limpiarStorage = async (page) => {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
};

const USUARIO = {
  email: 'ana.perez@profesor.cl',
  password: '123456',
  nombre: 'Ana Perez',
};

const loginProfesor = async (page) => {
  await page.getByLabel(/correo institucional/i).fill(USUARIO.email);
  await page.getByLabel(/contraseña/i).fill(USUARIO.password);
  await page.getByRole('button', { name: /ingresar/i }).click();
  await page.getByRole('navigation').waitFor({ timeout: 15000 });
};

test.describe('Business Core — flujo completo profesor', () => {
  test.beforeEach(async ({ page }) => {
    await limpiarStorage(page);
    await page.goto(BASE_URL);
    await loginProfesor(page);
  });

  test('login como profesor muestra el dashboard', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText(/estudiantes registrados/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/clases registradas/i)).toBeVisible();
  });

  test('navegacion a Estudiantes y creacion de alumno', async ({ page }) => {
    await page.getByRole('button', { name: /estudiantes/i }).click();
    await expect(page.getByText(/Gestión de Estudiantes/i)).toBeVisible();
    await expect(page.getByText(/registrar nuevo estudiante/i)).toBeVisible();

    const nombreAlumno = `E2E Test ${Date.now()}`;
    await page.getByPlaceholder('Ej: Juan Pérez').fill(nombreAlumno);
    await page.getByPlaceholder('correo@alum.cl').fill(`e2e.test.${Date.now()}@alum.cl`);
    await page.getByPlaceholder('Ej: 1A').first().fill('1A');

    await page.getByRole('button', { name: /registrar estudiante/i }).click();

    await expect(page.getByText(/estudiante registrado correctamente/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(nombreAlumno).first()).toBeVisible();
  });

  test('navegacion a Dashboard muestra metricas actualizadas', async ({ page }) => {
    await page.getByRole('button', { name: /inicio/i }).click();
    await expect(page.getByText(/estudiantes registrados/i)).toBeVisible();
    await expect(page.locator('.dash-metric-card__value').first()).not.toHaveText('—', { timeout: 10000 });
    const valorMetrica = await page.locator('.dash-metric-card__value').first().textContent();
    expect(Number(valorMetrica)).toBeGreaterThanOrEqual(6);
  });

  test('logout y retorno al login', async ({ page }) => {
    await page.getByRole('button', { name: /cerrar sesión|salir|logout/i }).click();
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    const session = await page.evaluate(() => localStorage.getItem('coh_platform_session'));
    expect(session).toBeNull();
  });
});
