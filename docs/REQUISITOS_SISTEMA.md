# Requisitos del Sistema — Colegio O'Higgins Platform

## Requisitos de Hardware

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| CPU | 2 núcleos (x86_64 / ARM64) | 4 núcleos |
| RAM | 8 GB | 16 GB |
| Disco | 20 GB libres | 40 GB SSD |
| Red | Conexión a internet (descarga imágenes Docker) | Banda ancha |

## Requisitos de Software

| Herramienta | Versión Mínima | Propósito |
|-------------|---------------|-----------|
| Docker Engine | 24+ | Contenedores de servicios |
| Docker Compose | v2.20+ | Orquestación local |
| Java | 21 (JDK) | Compilación de microservicios (opcional, se usa Docker) |
| Node.js | 22+ | Build frontend (opcional, se usa Docker) |
| Git | 2.40+ | Control de versiones |
| Navegador | Chrome 120+, Firefox 120+, Edge 120+ | Acceso al frontend |

## Puertos Utilizados

| Puerto | Servicio | Propósito |
|--------|----------|-----------|
| 3306 | MySQL | Base de datos relacional |
| 5173 | Frontend (Vite dev) | Interfaz de usuario en desarrollo |
| 8080 | API Gateway | Punto de entrada API, autenticación JWT |
| 8081 | ms-students | Microservicio estudiantes |
| 8082 | ms-attendance | Microservicio asistencia |
| 8083 | backend-bff | Backend for Frontend (Docker) |
| 8761 | discovery-server | Eureka Service Discovery |
| 8084 | admin-server | Spring Boot Admin — monitoreo de servicios |
| 9090 | Prometheus | Métricas de servicios (Docker) |
| 3000 | Grafana | Dashboards de monitoreo (Docker) |

## Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/franciscodiazu/colegio-ohiggins-platform.git
cd colegio-ohiggins-platform
```

### 2. Iniciar con Docker Compose

```bash
cd Infra
docker compose up --build -d
```

### 3. Verificar estado

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Todos los contenedores deben mostrar `(healthy)`.

### 4. Acceder al sistema

| Componente | URL |
|------------|-----|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Admin Server | http://localhost:8084 |
| Eureka Dashboard | http://localhost:8761 |
| Prometheus Targets | http://localhost:9090/targets |
| Grafana Dashboards | http://localhost:3000 (admin/admin) |
| Swagger ms-students | http://localhost:8081/swagger-ui/index.html |
| Swagger ms-attendance | http://localhost:8082/swagger-ui/index.html |

### 5. Detener el sistema

```bash
docker compose down
```

Para eliminar también los volúmenes de datos:

```bash
docker compose down -v
```
