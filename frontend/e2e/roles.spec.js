import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

const limpiarStorage = async (page) => {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
};

const loginComo = async (page, email, password) => {
  await page.getByLabel(/correo institucional/i).fill(email);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /ingresar/i }).click();
};

test.describe('Multi-rol — control de acceso por perfil', () => {
  test.beforeEach(async ({ page }) => {
    await limpiarStorage(page);
    await page.goto(BASE_URL);
  });

  test('estudiante (@alum.cl) ve modulo en preparacion en lugar del dashboard', async ({ page }) => {
    await loginComo(page, 'juan.garcia@alum.cl', '123456');
    await expect(page.getByText(/módulo en preparación/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/tu cuenta ingresó correctamente/i)).toBeVisible();
    await expect(page.getByText(/resumen general/i)).not.toBeVisible();
  });

  test('apoderado (@apod.cl) ve modulo en preparacion en lugar del dashboard', async ({ page }) => {
    await loginComo(page, 'maria@apod.cl', '123456');
    await expect(page.getByText(/módulo en preparación/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/tu cuenta ingresó correctamente/i)).toBeVisible();
    await expect(page.getByText(/resumen general/i)).not.toBeVisible();
  });

  test('profesor (@profesor.cl) ve dashboard completo con navegacion', async ({ page }) => {
    await loginComo(page, 'ana.perez@profesor.cl', '123456');
    await page.getByRole('navigation').waitFor({ timeout: 15000 });
    await expect(page.getByText(/resumen general/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /estudiantes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /asistencia/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /evaluaciones/i })).toBeVisible();
  });

  test('transiciones entre roles funcionan (estudiante -> profesor)', async ({ page }) => {
    await loginComo(page, 'juan.garcia@alum.cl', '123456');
    await expect(page.getByText(/módulo en preparación/i)).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /cerrar sesión|salir|logout/i }).click();
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

    await loginComo(page, 'ana.perez@profesor.cl', '123456');
    await page.getByRole('navigation').waitFor({ timeout: 15000 });
    await expect(page.getByText(/resumen general/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /estudiantes/i })).toBeVisible();
  });
});
