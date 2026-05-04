# Plataforma Integral de Gestión Académica
## Colegio Bernardo O'Higgins

Sistema web de gestión académica desarrollado como proyecto semestral para la asignatura **Desarrollo Fullstack III (DSY1106)** en DUOC UC.

---

## Equipo de desarrollo

| Nombre | Rol |
|---|---|
| Francisco Díaz | Desarrollador Fullstack |
| Genesis Flores | Desarrolladora Fullstack |
| Emilio Hormazabal | Desarrollador Fullstack |

---

## Repositorio

```
https://github.com/franciscodiazu/colegio-ohiggins-platform.git
```

---

## Descripción general

La plataforma permite a profesores gestionar información académica de forma centralizada. Incluye módulos de gestión de estudiantes, registro de asistencia y control de evaluaciones y calificaciones.

---

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.4 | Librería de interfaz de usuario |
| Vite | 5+ | Bundler y servidor de desarrollo |
| JavaScript (ES2022) | — | Lenguaje principal |
| CSS3 | — | Estilos y diseño visual |
| localStorage | — | Persistencia de datos mock |
| Node.js | v22.20.0 | Entorno de ejecución |

---

## Patrones de diseño implementados

### 1. Service Layer
Los servicios mock (`attendanceMockService`, `studentsMockService`, `evaluationsMockService`, `authMockService`) encapsulan toda la lógica de acceso a datos. Los componentes nunca acceden directamente al localStorage, siempre lo hacen a través del servicio correspondiente. Esto facilita la sustitución por llamadas HTTP reales sin modificar los componentes.

### 2. Container / Presenter
Las páginas (`Estudiantes`, `Asistencia`, `Evaluaciones`) actúan como contenedores: manejan el estado y la lógica de negocio. Los componentes reutilizables (`TableSkeleton`, `ConfirmModal`, `FormField`, `Navbar`) actúan como presentadores: solo reciben props y renderizan UI, sin lógica propia.

### 3. Custom Hook
El hook `useFieldValidation` encapsula la lógica de validación de formularios en tiempo real. Gestiona el valor, el estado de error y el estado `touched` de cada campo de forma independiente, separando la lógica de validación de la capa de presentación.

---

## Estructura del proyecto

```
frontend/
├── public/
│   ├── favicon.svg          # Ícono de la pestaña del navegador
│   ├── logo.svg             # Logo institucional (versión color)
│   └── logo-white.svg       # Logo institucional (versión blanca)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── BaseLayout.jsx    # Componentes base de layout
│   │   ├── ConfirmModal.jsx      # Modal de confirmación reutilizable
│   │   ├── FormField.jsx         # Campo de formulario con validación visual
│   │   ├── Navbar.jsx            # Barra de navegación con sesión
│   │   └── TableSkeleton.jsx     # Skeleton de carga para tablas
│   ├── hooks/
│   │   └── useFieldValidation.js # Hook de validación en tiempo real
│   ├── pages/
│   │   ├── Asistencia.jsx        # Módulo de asistencia
│   │   ├── Dashboard.jsx         # Panel principal con estadísticas
│   │   ├── Estudiantes.jsx       # Módulo de estudiantes
│   │   ├── Evaluaciones.jsx      # Módulo de evaluaciones y notas
│   │   ├── ForgotPassword.jsx    # Recuperación de contraseña
│   │   ├── Login.jsx             # Inicio de sesión
│   │   ├── NotFound.jsx          # Página 404
│   │   └── Register.jsx          # Registro de usuario
│   ├── services/
│   │   ├── attendanceMockService.js    # Servicio mock de asistencia
│   │   ├── authMockService.js          # Servicio mock de autenticación
│   │   ├── evaluationsMockService.js   # Servicio mock de evaluaciones
│   │   └── studentsMockService.js      # Servicio mock de estudiantes
│   ├── styles/
│   │   ├── asistencia.css   # Estilos de módulos y componentes
│   │   ├── auth.css         # Estilos de autenticación
│   │   ├── base.css         # Estilos base globales
│   │   ├── dashboard.css    # Estilos del dashboard
│   │   ├── forms.css        # Estilos de formularios
│   │   ├── layout.css       # Estilos de layout
│   │   ├── responsive.css   # Reglas responsive
│   │   └── tokens.css       # Variables CSS (design tokens)
│   ├── App.jsx              # Componente raíz y manejo de sesión
│   ├── index.css            # Punto de entrada de estilos
│   └── main.jsx             # Punto de entrada de la aplicación
├── index.html
├── package.json
└── vite.config.js
```

---

## Requisitos previos

- **Vite** 8.0.1 
- **npm** v9 o superior

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/franciscodiazu/colegio-ohiggins-platform.git
cd colegio-ohiggins-platform
```

### 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Construir para producción

```bash
npm run build
```

### 5. Previsualizar la build de producción

```bash
npm run preview
```

---

## Credenciales de prueba

El sistema infiere el rol del usuario a partir del dominio del correo:

| Rol | Dominio | Ejemplo |
|---|---|---|
| Profesor | `@profesor.cl` | `ana.perez@profesor.cl` |
| Estudiante | `@alum.cl` | `juan.garcia@alum.cl` |
| Apoderado | `@apod.cl` | `maria.lopez@apod.cl` |

> Solo los usuarios con rol **Profesor** tienen acceso completo a los módulos de la plataforma.

Para crear una cuenta de prueba, usar el formulario de **Registro** con cualquier correo del dominio `@profesor.cl`.

---

## Funcionalidades principales

### Dashboard
- Resumen general con métricas en tiempo real
- Barras de progreso de asistencia y calificaciones
- Desglose de estudiantes por curso
- Últimas calificaciones registradas
- Saludo dinámico según hora del día

### Gestión de Estudiantes
- Registro y actualización de estudiantes
- Modal de confirmación antes de guardar cambios
- Tabla con fila seleccionada resaltada
- Consulta de cursos asociados por estudiante

### Gestión de Asistencia
- Registro de clases realizadas
- Control de asistencia por clase con filtrado dinámico de estudiantes
- Consulta de asistencia por estudiante o por curso
- Detección de registros duplicados

### Evaluaciones y Calificaciones
- Creación y edición de evaluaciones por curso
- Registro de notas con filtrado dinámico de estudiantes
- Consulta de calificaciones por estudiante o por curso
- Cálculo automático de promedio general

### Autenticación
- Registro, inicio de sesión y recuperación de contraseña
- Validación visual en tiempo real campo por campo
- Persistencia de sesión con localStorage
- Roles diferenciados por dominio de correo

---

## Componentes reutilizables

| Componente | Descripción |
|---|---|
| `ConfirmModal` | Modal de confirmación con variantes (danger, warning, info), accesible con teclado |
| `TableSkeleton` | Skeleton animado para tablas durante la carga de datos |
| `FormField` | Campo de formulario con validación visual y mensaje de error |
| `Navbar` | Barra de navegación con logo, menú y datos de sesión del usuario |
| `useFieldValidation` | Hook de validación en tiempo real con soporte para múltiples reglas |

---

## Notas para el evaluador

- La capa de servicios mock simula tiempos de respuesta reales mediante `setTimeout` de 120ms, lo que permite apreciar los estados de carga (skeleton).
- Los datos persisten entre sesiones gracias a localStorage. Para reiniciar el estado, abrir DevTools → Application → Local Storage → limpiar las claves con prefijo `coh_`.
- El sistema está preparado para conectarse a un backend real: reemplazar el cuerpo de cada función en los archivos `*MockService.js` por llamadas HTTP sin modificar los componentes.