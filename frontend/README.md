# Plataforma Integral de Gestion Academica - Frontend
## Colegio Bernardo O'Higgins

Sistema web de gestion academica desarrollado como proyecto semestral para la asignatura Desarrollo Fullstack III (DSY1106) en DUOC UC.

## Equipo de desarrollo

| Nombre | Rol |
|---|---|
| Francisco Diaz | Desarrollador Fullstack |
| Genesis Flores | Desarrolladora Fullstack |
| Emilio Hormazabal | Desarrollador Fullstack |

## Repositorio

```
https://github.com/franciscodiazu/colegio-ohiggins-platform.git
```

## Descripcion general

La plataforma permite a profesores gestionar informacion academica de forma centralizada. Incluye modulos de gestion de estudiantes, registro de asistencia y control de evaluaciones y calificaciones.

## Tecnologias utilizadas

| Tecnologia | Version | Uso |
|---|---|---|
| React | 19.2.4 | Libreria de interfaz de usuario |
| Vite | 8.x | Bundler y servidor de desarrollo |
| JavaScript (ES2022) | -- | Lenguaje principal |
| CSS3 | -- | Estilos y diseño visual |
| localStorage | -- | Persistencia de datos mock |
| Node.js | v22.20.0 | Entorno de ejecucion |
| Vitest | -- | Suite de pruebas unitarias e integracion |
| Playwright | -- | Pruebas End-to-End |

## Patrones de diseño implementados

### 1. Service Layer
Los servicios (authService, attendanceService, evaluationsService) encapsulan toda la logica de acceso a datos. Se conectan al backend real via HTTP a traves de `bffClient` (instancia Axios con interceptor JWT). El `bffClient` centraliza el manejo de tokens, refresh automatico en 401 y logging de errores.

### 2. Container / Presenter
Las paginas (Estudiantes, Asistencia, Evaluaciones) actuan como contenedores: manejan el estado y la logica de negocio. Los componentes reutilizables (TableSkeleton, ConfirmModal, FormField, Navbar) actuan como presentadores: solo reciben props y renderizan UI, sin logica propia.

### 3. Custom Hook
El hook useFieldValidation encapsula la logica de validacion de formularios en tiempo real. Gestiona el valor, el estado de error y el estado touched de cada campo de forma independiente, separando la logica de validacion de la capa de presentacion.

## Estructura del proyecto

```
frontend/
├── src/
│   ├── __tests__/           # Suite de pruebas unitarias e integracion
│   ├── components/          # Componentes reutilizables
│   ├── hooks/               # Custom hooks de logica
│   ├── pages/               # Vistas principales
│   ├── services/            # Capa de servicios y logica de datos
│   └── styles/              # Archivos CSS y diseño
├── e2e/                     # Pruebas End-to-End con Playwright
├── public/                  # Recursos estaticos
├── vitest.config.js         # Configuracion de Vitest
└── playwright.config.js     # Configuracion de Playwright
```

## Instalacion y ejecucion

### 1. Instalacion de dependencias

```bash
cd frontend
npm install
npx playwright install chromium
```

### 2. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicacion estara disponible en http://localhost:5173

### 3. Ejecucion de pruebas (Vitest)

```bash
# Ejecutar una vez
npm run test

# Reporte de cobertura
npm run test:coverage
```

### 4. Ejecucion de pruebas E2E (Playwright)

Requiere que la aplicacion este corriendo (npm run dev).

```bash
npx playwright test
```

## Calidad y Pruebas Unitarias

### Cobertura de pruebas

| Capa | Herramienta | Archivos cubiertos |
|------|------------|----------------------|
| Unitaria | Vitest | useFieldValidation.js, authService.js, bffClient.js, attendanceService.js, evaluationsService.js, ErrorBoundary.jsx, ConfirmModal.jsx, TableSkeleton.jsx, NotFound.jsx |
| Integracion | Vitest + Testing Library | Login.jsx, Register.jsx, Dashboard.jsx, Estudiantes.jsx, Asistencia.jsx, Evaluaciones.jsx, ForgotPassword.jsx, Navbar.jsx |
| E2E | Playwright | Flujo completo: registro -> login -> dashboard -> logout |

### Resultados obtenidos (Vitest)

- Tests Pasados: 302 (Vitest)
- Tests Fallidos: 0
- Cobertura de Lineas: ~28%
- Cobertura de Funciones: ~79%
- Cobertura de Ramas: ~89%

### Resultados obtenidos (Playwright)

- Tests Pasados: 3 specs
- Tests Fallidos: 0

## Credenciales de prueba

El sistema infiere el rol del usuario a partir del dominio del correo:

| Rol | Dominio | Ejemplo |
|---|---|---|
| Profesor | @profesor.cl | ana.perez@profesor.cl |
| Estudiante | @alum.cl | juan.garcia@alum.cl |
| Apoderado | @apod.cl | maria.lopez@apod.cl |

## Funcionalidades principales

- Dashboard: Resumen general con metricas en tiempo real.
- Gestion de Estudiantes: Registro y actualizacion de alumnos.
- Gestion de Asistencia: Control de asistencia por clase y curso.
- Evaluaciones y Calificaciones: Creacion de evaluaciones y registro de notas.
- Autenticacion: Registro, login y recuperacion de contraseña con roles.

## Notas para el evaluador

- La capa de servicios se conecta al backend real via HTTP (api-gateway en Docker), utilizando Axios con interceptor JWT y refresh automatico.
- Los datos persisten en MySQL 8.0 a traves de los microservicios Spring Boot.
- En desarrollo local (sin Docker), usar `VITE_API_URL=http://localhost:8080`.

## Etica y responsabilidad

La solucion fue diseñada para un contexto academico y de demostracion. Los registros se almacenan en MySQL 8.0 con usuarios de privilegio minimo (`app_colegio`). La interfaz favorece el uso responsable mediante validaciones y confirmaciones.
