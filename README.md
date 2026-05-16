# Colegio O'Higgins Platform

Repositorio monorepo del proyecto de gestión académica para el Colegio Bernardo O'Higgins.

## Estructura general

- `frontend/`: aplicación web desarrollada con React y Vite.
- `backend-bff/`: capa BFF para centralizar la comunicación con servicios internos.
- `ms-attendance/`: microservicio de asistencia.
- `ms-students/`: microservicio de estudiantes.
- `Infra/`: archivos de infraestructura y despliegue local con Docker.
- `packages/ui/`: paquete compartido de interfaz.

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