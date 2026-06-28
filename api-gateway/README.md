# API Gateway

## Descripción
Punto de entrada único implementado con **Spring Cloud Gateway MVC**. Centraliza autenticación JWT, ruteo dinámico a microservicios (con Eureka Service Discovery) y configuración CORS.

## Tecnologías
- **Spring Cloud Gateway MVC** — Enrutamiento dinámico
- **Spring Security + JJWT 0.12.6** — Validación de tokens JWT (HMAC-SHA384)
- **Eureka Client** — Service Discovery
- **MySQL 8.0** — Persistencia de usuarios y roles (colegio_auth_db)
- **Micrometer + Prometheus** — Métricas vía /actuator/prometheus

## Rutas
| Ruta | Destino | Autenticación |
|------|---------|-------------|
| `/api/v1/auth/register` | Gateway (propio) | Pública |
| `/api/v1/auth/login` | Gateway (propio) | Pública |
| `/api/v1/auth/refresh` | Gateway (propio) | JWT |
| `/api/students/**` | ms-students:8081 | JWT |
| `/api/asistencia/**` | ms-attendance:8082 | JWT |

## Seguridad JWT
- **JwtUtil**: genera token de acceso (30 min) + refresh token (7 días) firmados con HMAC-SHA384
- **JwtAuthenticationFilter**: intercepta cada request, extrae token del header `Authorization`, valida firma y expiración, inyecta `UsernamePasswordAuthenticationToken` en el contexto de seguridad
- **SecurityConfig**: `SecurityFilterChain` con rutas públicas (`/api/v1/auth/register`, `/api/v1/auth/login`) y protegidas (todo lo demás)
- **GatewayConfig**: `RouteLocator` declarativo — cada ruta tiene un filtro `JwtAuthGatewayFilterFactory` que valida el token antes de reenviar al microservicio destino

## Pruebas
```bash
./mvnw clean test    # 9 tests: CorsConfig (7) + ApplicationContext (2)
```

## Dependencias clave (pom.xml)
- `spring-cloud-starter-gateway-mvc`, `spring-cloud-starter-netflix-eureka-client`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (0.12.6)
- `spring-boot-starter-security`, `spring-boot-starter-data-jpa`
- `mysql-connector-j`, `spring-boot-starter-actuator`
- `micrometer-registry-prometheus`

## Variables de Entorno
| Variable | Default | Descripción |
|----------|---------|-------------|
| `SERVER_PORT` | 8080 | Puerto del gateway |
| `EUREKA_URL` | http://discovery-server:8761/eureka/ | URL de Eureka |
| `JWT_SECRET` | (valor fijo) | Secreto HMAC-SHA384 para firmar tokens |
| `JWT_EXPIRATION` | 1800000 | TTL del token de acceso (30 min) |
| `DB_HOST` | mysql | Host MySQL |
| `DB_PORT` | 3306 | Puerto MySQL |
| `DB_NAME_AUTH` | colegio_auth_db | Base de datos de autenticación |
| `CORS_ALLOWED_ORIGINS` | http://localhost:5173 | Orígenes permitidos |
