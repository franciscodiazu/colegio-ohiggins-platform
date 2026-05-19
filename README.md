# Colegio O'Higgins Platform

Repositorio monorepo del proyecto de gestión académica para el Colegio Bernardo O'Higgins.

## Estructura general

- `frontend/`: aplicación web desarrollada con React y Vite.
- `backend-bff/`: capa BFF para centralizar la comunicación con servicios internos.
- `ms-attendance/`: microservicio de asistencia.
- `ms-students/`: microservicio de estudiantes.
- `Infra/`: archivos de infraestructura y despliegue local con Docker.
- `packages/ui/`: paquete compartido de interfaz.

## Prerrequisitos

- Node.js (v18+ recomendado) y npm (o pnpm/yarn) para frontend/packages
- Java 21 y Maven (o usar `mvnw` incluido) para backend y microservicios
- Docker y Docker Compose para ejecución en contenedores

## Ejecución rápida (setup)

1. Instalar dependencias del frontend y del paquete UI:

```bash
npm run install:frontend
npm run install:ui
```

2. Levantar frontend en desarrollo:

```bash
npm run dev:frontend
```

3. Ejecutar backend y microservicios (desde sus carpetas) con wrapper Maven:

Linux/macOS:
```bash
./mvnw spring-boot:run
```

Windows (PowerShell/CMD):
```powershell
.\mvnw.cmd spring-boot:run
```

También hay scripts de test para los microservicios: ejecutar `./mvnw test` o `./run-tests.ps1` en Windows.

## Comandos útiles

- Ejecutar la UI compartida (packages/ui): `npm --prefix packages/ui run build`
- Construir frontend para producción: `npm run build:frontend`
- Tests backend: `./mvnw test` o `.\run-tests.ps1` (según plataforma)

## Docker / Infra

Hay una carpeta `Infra/` con `docker-compose.yml` y Dockerfiles para los servicios locales. Ejemplo para levantar todo (desde la raíz):

```bash
docker compose -f Infra/docker-compose.yml up --build
```

Si usas los Dockerfiles individuales, en `Infra/docker/` están `attendance.Dockerfile`, `students.Dockerfile`, `bff.Dockerfile` y `frontend.Dockerfile`.

## Endpoints y puertos (por defecto)

- Frontend: `http://localhost:5173`
- Backend BFF: `http://localhost:8080` (configurable)
- ms-attendance: `http://localhost:8081`
- ms-students: `http://localhost:8082`

Las rutas exactas y health endpoints dependen de la configuración en `src/main/resources` de cada servicio.

## Enlaces y documentación adicional

- Lista de repositorios/componentes: `repositorios.txt` (en la raíz).
- README individuales: `frontend/README.md`, `backend-bff/README.md`, `ms-attendance/README.md`, `ms-students/README.md`, `packages/maven-archetype-basic/README.md`.

## Contribuir

- Fork → branch feature → PR. Añade instrucciones de pruebas y cualquier migración necesaria.

## Licencia

Indica aquí la licencia del proyecto si aplica (p.ej. MIT). Actualmente no hay archivo `LICENSE` en el repo.

## Ejecución rápida

Los comandos principales se exponen desde `package.json` en la raíz:

- `npm run dev:frontend`
- `npm run build:frontend`
- `npm run build:ui`

Para instalar dependencias por subproyecto:

- `npm run install:frontend`
- `npm run install:ui`

## Propósito

El proyecto centraliza la gestión académica en módulos de estudiantes, asistencia, evaluaciones y autenticación, con una arquitectura pensada para evolucionar desde servicios mock hacia integración con backend real.