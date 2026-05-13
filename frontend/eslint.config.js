import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
  // ─── NAMING CONVENTIONS ──────────────────────────────────────────────
  {
    files: ['src/hooks/**/*.{js,jsx}'],
    rules: {
      'no-restricted-exports': [
        'error',
        {
          restrictedNamedExports: ['default'],
          message: 'Hooks must export named exports with camelCase naming (e.g., export function useFieldValidation)',
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.jsx'],
    rules: {
      'no-restricted-exports': [
        'error',
        {
          restrictedNamedExports: ['default'],
          message: 'React components must use named exports with PascalCase naming (e.g., export function FormField)',
        },
      ],
    },
  },
])


