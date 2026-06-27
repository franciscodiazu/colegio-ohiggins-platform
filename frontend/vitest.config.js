// ─────────────────────────────────────────────────────────────────────────────
// Configuración de Vitest para pruebas unitarias e integración.
// Usa jsdom como entorno del navegador y carga el setup de Testing Library.
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Entorno que simula el DOM del navegador
    environment: 'jsdom',

    // Archivo de setup que carga los matchers de @testing-library/jest-dom
    setupFiles: ['./src/__tests__/setup.js'],

    // Incluir todos los archivos de prueba unitaria e integración
    include: ['src/__tests__/**/*.{test,spec}.{js,jsx}'],

    // Reporte de cobertura con v8
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // Archivos a medir (excluir config, estilos y assets)
      include: [
        'src/hooks/**',
        'src/services/**',
        'src/pages/**',
        'src/components/**',
      ],
      exclude: [
        'src/main.jsx',
        'src/**/*.css',
        'src/**/*.svg',
      ],

    },

    globals: true,
  },
});
