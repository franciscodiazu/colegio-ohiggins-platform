# backend-bff

Backend For Frontend (BFF) que centraliza la comunicacion entre el frontend y los microservicios core del sistema. Actua como una capa de orquestacion y agregacion de datos.

## Prerrequisitos

- Java 21
- Maven (incluido mediante mvnw)

## Instalacion y Ejecucion

### Ejecucion local

Para Linux/macOS:
```bash
./mvnw spring-boot:run
```

Para Windows:
```powershell
.\mvnw.cmd spring-boot:run
```

### Ejecucion con Docker

Para construir la imagen desde la raiz del repositorio:
```bash
docker build -f Infra/docker/bff.Dockerfile -t backend-bff:local .
```

## Configuracion y Endpoints

- Puerto por defecto: 8080
- Path base: /

El BFF redirige las peticiones a los siguientes servicios:
- ms-students: Puerto 8081
- ms-attendance: Puerto 8082

## Calidad y Pruebas Unitarias

El proyecto utiliza Spring Boot Test para validar la configuracion y el enrutamiento.

- Total Tests: 8
- Cobertura de codigo: >60%
- Clases testeadas: WebConfigTest

Ejecutar pruebas:
```bash
./mvnw clean test
```

## Variables de Entorno

- MS_STUDENTS_URL: URL del microservicio de estudiantes.
- MS_ATTENDANCE_URL: URL del microservicio de asistencia.
- SERVER_PORT: Puerto de escucha del BFF (por defecto 8080).

## Notas

Este componente es critico para la seguridad y la simplificacion de la API expuesta al cliente React.
