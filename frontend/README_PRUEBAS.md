# Pruebas — Frontend Colegio Bernardo O'Higgins

Documentación de las pruebas implementadas para la **Evaluación Parcial N°3** de DSY1106.

---

## Estructura de pruebas

```
src/__tests__/
├── setup.js                          ← Configuración global (jest-dom)
├── unit/
│   ├── useFieldValidation.test.js    ← Pruebas unitarias del hook de validación
│   └── authMockService.test.js       ← Pruebas unitarias del servicio de autenticación
└── integration/
    ├── Login.test.jsx                ← Pruebas de integración del formulario Login
    └── Register.test.jsx             ← Pruebas de integración del formulario Register

e2e/
└── auth.spec.js                      ← Pruebas E2E del flujo completo de autenticación
```

---

## Instalación

### 1. Instalar dependencias de Vitest y Testing Library

```bash
npm install --save-dev \
  vitest \
  @vitest/coverage-v8 \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  jsdom
```

### 2. Instalar Playwright y sus navegadores

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

> **Nota Windows:** Si Playwright no encuentra el ejecutable, verificar que la carpeta
> `%USERPROFILE%\AppData\Local\ms-playwright\chromium-1223\chrome-win64\chrome.exe` existe.
> En caso contrario ajustar la ruta en `playwright.config.js`.

### 3. Configuración de archivos

Asegurarse de que los siguientes archivos estén en la raíz del proyecto `frontend/`:

```
frontend/
├── src/
│   └── __tests__/
│       ├── setup.js
│       ├── unit/
│       │   ├── useFieldValidation.test.js
│       │   └── authMockService.test.js
│       └── integration/
│           ├── Login.test.jsx
│           └── Register.test.jsx
├── e2e/
│   └── auth.spec.js
├── vitest.config.js
└── playwright.config.js
```

---

## Ejecución

### Pruebas unitarias e integración (Vitest)

```bash
# Ejecutar una vez y mostrar resultados
npm run test

# Modo watch (re-ejecuta al guardar cambios)
npm run test:watch

# Con reporte de cobertura (genera carpeta /coverage)
npm run test:coverage
```

### Pruebas E2E (Playwright)

Las pruebas E2E requieren que la aplicación esté corriendo. Seguir estos pasos:

**Paso 1 — Levantar la app en una terminal:**
```bash
npm run dev
# Esperar a que aparezca: Local: http://localhost:5173/
```

**Paso 2 — Ejecutar las pruebas E2E en otra terminal:**
```bash
npx playwright test
```

**Ver el reporte HTML generado:**
```bash
npx playwright show-report
```

> **Importante:** No cerrar la terminal con `npm run dev` mientras corren las pruebas E2E.

---

## Cobertura de pruebas

| Capa | Herramienta | Archivos cubiertos |
|------|------------|----------------------|
| Unitaria | Vitest | `useFieldValidation.js`, `authMockService.js` |
| Integración | Vitest + Testing Library | `Login.jsx`, `Register.jsx` |
| E2E | Playwright | Flujo completo: registro → login → dashboard → logout |

Para ver el reporte HTML de cobertura:

```bash
npm run test:coverage
# El reporte queda en: frontend/coverage/index.html
```

---

## Resultados obtenidos

### Pruebas unitarias e integración (Vitest)

```
✓ authMockService.test.js     (27 tests)
✓ useFieldValidation.test.js  (28 tests)
✓ Login.test.jsx              (19 tests)
✓ Register.test.jsx           (13 tests)
─────────────────────────────────────────
  87 tests passed
```

### Cobertura de archivos probados

| Archivo | Sentencias | Ramas | Funciones | Líneas |
|---------|-----------|-------|-----------|--------|
| `useFieldValidation.js` | 100% | 100% | 100% | 100% |
| `authMockService.js` | 97% | 92% | 100% | 97% |
| `Login.jsx` | 95% | 93% | 66% | 95% |
| `Register.jsx` | 100% | 96% | 100% | 100% |
| `FormField.jsx` | 100% | 100% | 100% | 100% |

### Pruebas E2E (Playwright)

```
✓ Login — pantalla inicial                                    (3 tests)
✓ Register — flujo de registro                                (6 tests)
✓ Login — flujo de autenticación                              (4 tests)
✓ Sesión — persistencia en localStorage                       (1 test)
✓ Logout — cierre de sesión                                   (2 tests)
──────────────────────────────────────────────────────────────
  16 tests passed
```

---

## Casos de prueba implementados

### Unitarias — `useFieldValidation`
- `rules.required`: campo vacío, espacios, con valor
- `rules.email`: formato válido e inválido
- `rules.institutionalEmail`: dominios `@profesor.cl`, `@alum.cl`, `@apod.cl`, externos
- `rules.minLength`: menor, igual y mayor al mínimo
- `rules.matchField`: coincidencia y no coincidencia
- Hook: estado inicial, `onChange`, `onBlur`, `validate`, `reset`

### Unitarias — `authMockService`
- `registerUser`: registro exitoso con inferencia de rol, persistencia en localStorage, validaciones de campos vacíos y dominio, duplicados, normalización de correo
- `loginUser`: credenciales correctas, correo inexistente, contraseña incorrecta, dominio externo, contraseña vacía, no exposición de contraseña en respuesta
- `resetUserPassword`: cambio exitoso, login con nueva contraseña, invalidación de contraseña anterior, errores

### Integración — `Login.jsx`
- Renderizado completo de la UI
- Validaciones en tiempo real (onBlur) y al enviar
- Flujo exitoso: llama a `onLogin` con datos correctos
- Errores del servicio: correo no registrado, contraseña incorrecta
- Navegación hacia registro y recuperación de contraseña

### Integración — `Register.jsx`
- Renderizado completo de la UI
- Validaciones: campos obligatorios, dominio institucional, longitud mínima, coincidencia de contraseñas
- Flujo exitoso: mensaje de confirmación, reset de campos, persistencia en localStorage
- Error de correo duplicado
- Navegación de vuelta al login

### E2E — `auth.spec.js`
- Pantalla inicial: formulario visible, campos y botones
- Registro: formulario correcto, errores de validación, correo inválido, contraseñas distintas
- Login: campos vacíos, credenciales incorrectas, correo no registrado, acceso exitoso al dashboard
- Sesión persistente: la sesión se mantiene tras recargar la página
- Logout: redirección al login, eliminación de localStorage

---

## Procesos de negocio críticos cubiertos

| Proceso | Unitaria | Integración | E2E |
|---------|----------|-------------|-----|
| Validación de campos de formulario | ✓ | ✓ | ✓ |
| Registro de cuenta institucional | ✓ | ✓ | ✓ |
| Inicio de sesión con autenticación | ✓ | ✓ | ✓ |
| Persistencia de sesión en localStorage | ✓ | ✓ | ✓ |
| Cierre de sesión y limpieza de estado | — | — | ✓ |