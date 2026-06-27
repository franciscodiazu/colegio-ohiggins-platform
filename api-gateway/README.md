# API Gateway - Colegio O'Higgins

Punto de entrada único del sistema.

- **Tecnología:** Spring Cloud Gateway, Spring Security, JWT.
- **Responsabilidad:** Autenticación centralizada, ruteo dinámico (con Eureka) y filtrado de peticiones.
- **Rutas clave:** `/api/v1/auth/**`, `/api/students/**`, `/api/asistencia/**`.
- **Puerto:** 8080
