# Descripción de la Capa de Persistencia - Colegio O'Higgins

## 1. Arquitectura de Datos

El sistema implementa una estrategia de **Database per Service**, garantizando el desacoplamiento y la independencia de escalabilidad entre microservicios.

## 2. Componentes

| Componente | Tecnología | Propósito |
|-----------|-----------|-----------|
| Motor BD | MySQL 8.0 | Base de datos relacional |
| ORM | Spring Data JPA / Hibernate | Mapeo objeto-relacional |
| Inicialización | `Infra/mysql/init.sql` | Creación de esquemas y usuarios con least privilege |

## 3. Esquemas

| Base de Datos | Puerto | Propósito | Acceso |
|--------------|--------|-----------|--------|
| `colegio_auth_db` | 3306 | Gestión de usuarios, roles y autenticación JWT | API Gateway |
| `db_academic` | 3306 | Datos maestros de alumnos (matrícula, RUT, curso) | ms-students |
| `db_record` | 3306 | Registro histórico de asistencia (presente, atraso, inasistencia) | ms-attendance |

## 4. Estrategia de Persistencia

- **DDL automático:** Hibernate con `ddl-auto=update` crea y actualiza las tablas según las entidades JPA.
- **Migraciones:** No se utiliza Flyway/Liquibase; el esquema se inicializa desde `init.sql` y Hibernate sincroniza las entidades.
- **Conexiones:** Cada microservicio configura su propio `DataSource` apuntando a su base de datos correspondiente mediante variables de entorno.
- **Transacciones:** `@Transactional` con aislamiento READ_COMMITTED. Se evitan transacciones distribuidas (2PC) para mantener la independencia de servicios.

## 5. Seguridad

- Usuario de aplicación `app_colegio` con permisos mínimos (`SELECT, INSERT, UPDATE, DELETE`).
- Contraseñas gestionadas mediante Secrets de Docker/K8s.
- Las credenciales no se versionan en el repositorio (`.env` en `.gitignore`).

## 6. Manejo de Excepciones y Códigos HTTP

Cada microservicio implementa un `GlobalExceptionHandler` con `@ControllerAdvice` que centraliza la respuesta ante errores, garantizando un formato JSON consistente en toda la API.

### 6.1 Códigos HTTP utilizados

| Código | Uso | Escenario |
|--------|-----|-----------|
| **200 OK** | Respuesta exitosa en GET, PUT, DELETE | Consulta de estudiante, actualización exitosa |
| **201 Created** | Recurso creado exitosamente | POST para nuevo estudiante o registro de asistencia |
| **400 Bad Request** | Datos inválidos en la solicitud | RUT mal formado, campos obligatorios faltantes |
| **401 Unauthorized** | Autenticación requerida o token inválido | JWT expirado o no enviado |
| **403 Forbidden** | Sin permisos para el recurso | Rol sin autorización para la operación |
| **404 Not Found** | Recurso no encontrado | Estudiante ID inexistente |
| **500 Internal Server Error** | Error interno del servidor | Fallo en base de datos o excepción no controlada |
| **503 Service Unavailable** | Servicio dependiente caído | Circuit Breaker abierto en ms-attendance |

### 6.2 Estructura de respuesta de error

```json
{
  "error": "Nombre del error",
  "message": "Descripción legible del problema",
  "status": 404,
  "timestamp": "2026-06-23T12:00:00Z",
  "path": "/api/v1/estudiantes/999"
}
```

### 6.3 Excepciones manejadas

| Excepción | HTTP Status |
|-----------|-------------|
| `EntidadNoEncontradaException` | 404 |
| `ServicioNoDisponibleException` | 503 |
| `MethodArgumentNotValidException` | 400 |
| `AccessDeniedException` | 403 |
| `AuthenticationException` | 401 |
| `DataIntegrityViolationException` | 400 |
| Cualquier otra | 500 |

### 6.4 Buenas prácticas aplicadas

- **DTOs**: Separación estricta entre entidad JPA y request/response DTO.
- **Validación de entrada**: `@Valid` + anotaciones Jakarta Validation + `RutValidator` personalizado.
- **Factory Pattern**: Creación de entidades encapsulada en factorías (StudentFactory, AsistenciaFactory, PresenteFactory, AtrasoFactory, InasistenciaFactory).
- **Logging**: SLF4J con niveles diferenciados (INFO para operaciones, ERROR para fallos, DEBUG para trazabilidad).
