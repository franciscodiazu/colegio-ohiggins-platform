# Colegio O'Higgins Platform

Repositorio monorepo del proyecto de gestión académica para el Colegio Bernardo O'Higgins. Este sistema centraliza la gestión de estudiantes, asistencia y comunicación entre componentes mediante una arquitectura de microservicios.

## Estructura del Proyecto

- frontend/: Aplicación web desarrollada con React, Vite y Vitest para pruebas.
- backend-bff/: Capa Backend for Frontend que centraliza la comunicación.
- ms-attendance/: Microservicio encargado de la gestión de asistencia (Spring Boot).
- ms-students/: Microservicio encargado de la gestión de estudiantes (Spring Boot).
- Infra/: Archivos de configuración de Docker y despliegue.
- packages/ui/: Librería de componentes compartidos.

## Prerrequisitos

- Node.js (v18+) y npm.
- Java 21 y Maven.
- Docker y Docker Compose.

## Instalación y Ejecución

### Configuración Local

1. Instalar dependencias:
```bash
npm run install:frontend
npm run install:ui
```

2. Ejecutar frontend:
```bash
npm run dev:frontend
```

3. Ejecutar servicios backend (desde cada carpeta):
```bash
./mvnw spring-boot:run
```

### Ejecución con Docker

Para levantar toda la infraestructura (Base de datos, Microservicios, BFF y Frontend):

```bash
docker-compose -f Infra/docker-compose.yml up --build
```

Nota: Si el build del frontend falla por archivos temporales de cobertura, ejecute `Remove-Item -Recurse -Force frontend/coverage` (PowerShell) o `rm -rf frontend/coverage` (Linux/Bash) antes de levantar Docker.

## Puertos y Endpoints

- Frontend: http://localhost:5173
- Backend BFF: http://localhost:8080
- ms-students: http://localhost:8081
- ms-attendance: http://localhost:8082

## Documentación de API (Swagger)

Una vez levantados los servicios, la documentación OpenAPI está disponible en:
- ms-students: http://localhost:8081/swagger-ui/index.html
- ms-attendance: http://localhost:8082/swagger-ui/index.html

## Calidad y Pruebas Unitarias

El proyecto cuenta con una suite de pruebas automatizadas utilizando JaCoCo para Java y Vitest para React.

### Métricas de Cobertura Actuales
- Total Tests Ejecutados: 287
- Estado General: Exitoso (Pass)
- Cobertura Global: ~68%
- ms-attendance: 84.86%
- ms-students: >60%
- backend-bff: >60%
- frontend: 28.04% (en proceso de mejora)

### Ejecución de Pruebas
- Backend: `./mvnw clean test`
- Frontend: `npm run test:coverage` (dentro de la carpeta frontend)

## Documentación del Proyecto

Los siguientes documentos se encuentran disponibles en la raíz o en la carpeta docs/:
- ARQUITECTURA_MICROSERVICIOS.png: Diagrama de la arquitectura del sistema.
- DIAGRAMA_ER.png: Modelo de entidad-relación de la base de datos.
- PERSISTENCIA_DATOS.pdf: Detalle técnico sobre la implementación de JPA y Hibernate.
- INFORME_PRUEBAS_UNITARIAS.pdf: Reporte detallado de cobertura y calidad de código.
- repositorios.txt: Listado de accesos a los repositorios de los componentes.

## Licencia

Este proyecto es de uso académico para la asignatura DSY1106.
