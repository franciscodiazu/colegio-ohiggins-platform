# Radiografía Técnica — Colegio Bernardo O'Higgins Platform v2.1

> Auditoría basada ÚNICAMENTE en el código fuente, archivos de configuración y
> documentación real del repositorio. Generada el 2026-07-02.

---

## 1. Arquitectura de Microservicios y Estructura Real

### 1.1 Módulos Maven detectados en la raíz (6 + frontend)

| Módulo | Puerto | Artefacto (groupId:artifactId) | Propósito |
|--------|--------|--------------------------------|-----------|
| `discovery-server/` | 8761 | `cl.colegioohiggins:discovery-server` | Eureka Server (registro + descubrimiento) |
| `api-gateway/` | 8080 | `com.backend:api-gateway` | Spring Cloud Gateway WebMVC + JWT + enrutamiento |
| `backend-bff/` | 8083 | `com.backend:backend-bff` | Backend For Frontend (agregador + health platform) |
| `ms-students/` | 8081 | `com.backend:ms-students` | CRUD estudiantes + validación RUT chileno |
| `ms-attendance/` | 8082 | `com.backend:ms-attendance` | Asistencia, clases, evaluaciones, calificaciones |
| `admin-server/` | 8084 | `cl.colegioohiggins:admin-server` | Spring Boot Admin Server |
| `frontend/` | 5173 dev / 8080 prod | React 19 + Vite 8 | SPA con axios, vitest, playwright |

### 1.2 Configuración de ruteo del API Gateway

**Archivo:** `api-gateway/src/main/resources/application.properties` — 8 rutas definidas con `RewritePath`:

| Ruta Pública | Rewrite | Destino (Eureka) |
|---|---|---|
| `GET/POST /api/students` | → `/api/v1/estudiantes` | `lb://MS-STUDENTS` |
| `/api/students/**` | → `/api/v1/estudiantes/{segment}` | `lb://MS-STUDENTS` |
| `GET/POST /api/asistencia` | → `/api/v1/asistencia` | `lb://MS-ATTENDANCE` |
| `/api/asistencia/**` | → `/api/v1/asistencia/{segment}` | `lb://MS-ATTENDANCE` |
| `/api/clases` + `/**` | → `/api/v1/clases/{segment}` | `lb://MS-ATTENDANCE` |
| `/api/evaluaciones` + `/**` | → `/api/v1/evaluaciones/{segment}` | `lb://MS-ATTENDANCE` |

### 1.3 SecurityConfig — Autorización por rol

**Archivo:** `api-gateway/src/main/java/.../security/config/SecurityConfig.java`

- `GET /api/students`, `/api/asistencia`, `/api/clases`, `/api/evaluaciones` → `authenticated()`
- `POST/PUT` en los mismos → `hasAnyRole("ADMIN", "DOCENTE")`
- `DELETE` → `hasRole("ADMIN")`
- Auth pública: `POST /api/v1/auth/login`, `/register`, `/refresh`, `/reset-password`
- Públicos adicionales: `/actuator/**`, `/v3/api-docs/**`, `/swagger-ui/**`

### 1.4 Discovery Server

**Archivo:** `discovery-server/src/main/resources/application.yml`
```yaml
eureka:
  instance:
    hostname: discovery-server
  client:
    register-with-eureka: false
    fetch-registry: false
```
Modo servidor puro. No se auto-registra.

### 1.5 Comunicación entre microservicios

| Origen | Destino | Mecanismo | Clase exacta |
|---|---|---|---|
| `ms-attendance` | `ms-students` | `RestTemplate` + `@LoadBalanced` | `ClienteEstudiantes.java` |
| `ms-attendance` | `ms-students` | `@CircuitBreaker(name = "studentsValidation")` | Resilience4j en `ClienteEstudiantes.java` |
| `backend-bff` | `ms-students` + `ms-attendance` | `WebClient` + `@LoadBalanced` | `PlatformHealthIndicator.java` |
| `backend-bff` | externo | `RestTemplate` | `RestTemplateConfig.java` (5s/10s) |
| `api-gateway` | todos | Spring Cloud Gateway WebMVC | `application.properties` rutas 0-7 |

**No especificado en el código actual:** Uso de OpenFeign o WebClient para comunicación entre servicios internos (solo RestTemplate).

---

## 2. Stack Tecnológico de Producción y Testing

### 2.1 Backend

| Aspecto | Valor | Declarado en |
|---|---|---|
| Java | **21** | `pom.xml` de cada módulo |
| Spring Boot | **3.5.13** | Parent POM |
| Spring Cloud | **2025.0.1** | `spring-cloud.version` |
| Resilience4j | **2.2.0** | Solo en `ms-attendance/pom.xml` |
| MySQL Connector | 8.0+ (implícito) | Todos los `application.properties` |
| H2 (test) | **modo MySQL** | `ms-students`, `ms-attendance` test resources |

**BD Producción por módulo:**
- `api-gateway`: MySQL `colegio_auth_db` — tablas `usuarios`, `refresh_tokens`
- `ms-students`: MySQL `db_academic` — tabla `students`
- `ms-attendance`: MySQL `db_record` — tablas `registro_asistencia`, `clase`, `evaluacion`, `calificacion`
- `backend-bff`: **Sin BD** (`spring.autoconfigure.exclude=DataSourceAutoConfiguration`)
- `discovery-server`, `admin-server`: Sin BD

**BD Test:**
- `ms-students`: `jdbc:h2:mem:ms_students_test;MODE=MySQL` + `H2Dialect`
- `ms-attendance`: `jdbc:h2:mem:ms_attendance_test;MODE=MySQL` + `H2Dialect`
- `api-gateway`: **No tiene test resource** — usa MySQL real en tests

### 2.2 Frontend

| Aspecto | Valor |
|---|---|
| Framework | **React 19.2.4** + **Vite 8.0.1** |
| API Client | **axios 1.16.0** (centralizado en `bffClient.js`) |
| State management | **Estado local** (`useState`/`useEffect`) — Sin Redux, Zustand, ni Context API global |
| Routing | **No tiene React Router** — navegación con `vistaActual` en `App.jsx` |
| Testing unitario | **Vitest 4.1.9** + `jsdom` + `@testing-library/jest-dom` |
| Testing E2E | **Playwright 1.49.0** (3 specs) |

### 2.3 Seguridad

| Componente | Detalle |
|---|---|
| Algoritmo JWT | **HMAC-SHA256** (`Keys.hmacShaKeyFor`) |
| Clase generación/validación | `JwtTokenProvider.java` (api-gateway) |
| Filtro | `JwtAuthenticationFilter.java` — `OncePerRequestFilter`, extrae `Bearer` del header |
| Refresh tokens | `RefreshTokenService.java` — UUID, expiración 7 días, tabla `refresh_tokens` |
| Password encoding | `BCryptPasswordEncoder` |
| Mapeo de roles frontend | `DOCENTE→profesor`, `ESTUDIANTE→estudiante`, `APODERADO→apoderado`, `ADMIN→admin` |
| Inferencia de rol por email | `@profesor.cl`→DOCENTE, `@alum.cl`→ESTUDIANTE, `@apod.cl`→APODERADO |
| Manejo de errores auth | `AuthController` con try-catch manual (ApiError inline) |

---

## 3. Auditoría de la Suite de Pruebas (QA)

### 3.1 Conteo exacto por módulo (desde builds reales y reportes)

| Módulo | Tests | Archivos test | Cobertura |
|---|---|---|---|
| **ms-students** | **29** | 4 Java | 80% instr., 66% ramas |
| **ms-attendance** | **106** | 12 Java | ~84% instr., ~75% ramas |
| **api-gateway** | **18** | 3 Java | No JaCoCo |
| **backend-bff** | **17** | 3 Java | 77% instr. |
| **discovery-server** | **2** | 1 Java | No JaCoCo |
| **admin-server** | **1** | 1 Java | No JaCoCo |
| **frontend (Vitest)** | **302** | 14 JSX/JS | ~28% lines, ~79% functions, ~89% branches |
| **frontend (Playwright E2E)** | **3 specs** | 3 JS | — |
| **TOTAL** | **475** | **35 archivos** | — |

### 3.2 Archivos de prueba críticos

**Frontend E2E (Playwright):**
- `frontend/e2e/business-core.spec.js` — Flujo profesor completo
- `frontend/e2e/roles.spec.js` — Control de acceso por rol
- `frontend/e2e/auth.spec.js` — Login, registro, sesión, logout

**Frontend Unit/Integration (Vitest):**
- `attendanceService.test.js` — 34 tests
- `authService.test.js` — 27 tests
- `bffClient.test.js` — 22 tests (refresh token, interceptor)
- `Dashboard.test.jsx` — ~22 tests
- `Evaluaciones.test.jsx` — ~24 tests

**Backend — DataJpaTest:**
- `RepositorioRegistroAsistenciaDataJpaTest.java` — Queries JPQL personalizadas
- `StudentRepositoryDataJpaTest.java` — CRUD repository

**Backend — Controladores + Resiliencia:**
- `ControladorAsistenciaTest.java` — POST 201/404/503, GET 200
- `ControladorAsistenciaResilienceTest.java` — Circuit breaker + mensaje controlado
- `ClienteEstudiantesResilienceTest.java` — Fallbacks HTTP (ResourceAccessException)

### 3.3 Archivos sin test detectados

| Archivo | Ruta |
|---|---|
| `ControladorEvaluacion.java` | `ms-attendance/src/main/java/.../controller/` |
| `ControladorClase.java` | `ms-attendance/src/main/java/.../controller/` |
| `ServicioClase.java` | `ms-attendance/src/main/java/.../service/` |
| `ServicioEvaluacion.java` | `ms-attendance/src/main/java/.../service/` |
| `RepositorioEvaluacion.java` | `ms-attendance/src/main/java/.../repository/` |
| `RepositorioClase.java` | `ms-attendance/src/main/java/.../repository/` |
| `RepositorioCalificacion.java` | `ms-attendance/src/main/java/.../repository/` |

---

## 4. Mapeo de Flujos de Negocio y Endpoints Reales

### 4.1 Endpoints reales del backend

**`StudentController.java`** (`/api/v1/estudiantes`):
| Método | Ruta | Respuesta |
|---|---|---|
| POST | `/` | 201 CREATED |
| GET | `/` | 200 OK |
| GET | `/{id}` | 200 OK |
| PUT | `/{id}` | 200 OK |
| DELETE | `/{id}` | 204 NO CONTENT |

**`ControladorAsistencia.java`** (`/api/v1/asistencia`):
| Método | Ruta | Respuesta |
|---|---|---|
| POST | `/` | 201 CREATED |
| GET | `/` | 200 OK |
| GET | `/estudiante/{id}` | 200 OK |
| GET | `/curso/{curso}` | 200 OK |
| GET | `/estudiante/{id}/estadisticas` | 200 OK |
| GET | `/estudiante/{id}/atrasos?umbral={n}` | 200 OK |

**`ControladorClase.java`** (`/api/v1/clases`):
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/` | 200 OK |
| POST | `/` | 201 CREATED |
| GET | `/{id}` | 200 OK |

**`ControladorEvaluacion.java`** (`/api/v1/evaluaciones`):
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/` | 200 OK |
| POST | `/` | 201 CREATED |
| GET | `/{id}` | 200 OK |
| PUT | `/{id}` | 200 OK |
| DELETE | `/{id}` | 204 NO CONTENT |
| POST | `/calificaciones` | 201 CREATED |
| GET | `/calificaciones` | 200 OK |
| GET | `/calificaciones/estudiante/{id}` | 200 OK |

**`AuthController.java`** (`/api/v1/auth`):
| Método | Ruta | Respuesta |
|---|---|---|
| POST | `/login` | 200 OK |
| POST | `/register` | 201 CREATED |
| POST | `/refresh` | 200 OK |
| POST | `/reset-password` | 200 OK |

### 4.2 Dashboard frontend: endpoints consumidos vs reales

**Origen:** `frontend/src/pages/Dashboard.jsx` — `Promise.allSettled` con 5 llamadas:
```javascript
studentsService.listStudents()           // GET /api/students      → ✅ existe
attendanceService.listClasses()           // GET /api/clases         → ✅ existe
attendanceService.listAttendanceRecords() // GET /api/asistencia     → ✅ existe
evaluationsService.listEvaluations()      // GET /api/evaluaciones   → ✅ existe
evaluationsService.listGrades()           // GET /api/evaluaciones/calificaciones → ✅ existe
```
**Todas existen.**

### 4.3 Mapeo completo frontend → backend — DISCREPANCIAS

| Frontend (axios) | Gateway Rewrite | Backend real | Match |
|---|---|---|---|
| `GET/POST /api/students` | → `/api/v1/estudiantes` | `StudentController` | ✅ |
| `GET/PUT /api/students/{id}` | → `/api/v1/estudiantes/{id}` | `StudentController` | ✅ |
| `DELETE /api/students/{id}` | → `/api/v1/estudiantes/{id}` | `StudentController` | ✅ |
| `GET /api/students/{id}/courses` | → `/api/v1/estudiantes/{id}/courses` | **No existe** | ❌ |
| `GET/POST /api/asistencia` | → `/api/v1/asistencia` | `ControladorAsistencia` | ✅ |
| `GET /api/asistencia/estudiante/{id}` | → `/api/v1/asistencia/estudiante/{id}` | `ControladorAsistencia` | ✅ |
| `GET /api/asistencia/curso/{curso}` | → `/api/v1/asistencia/curso/{curso}` | `ControladorAsistencia` | ✅ |
| `GET /api/asistencia/estadisticas/{id}` | → `/api/v1/asistencia/estadisticas/{id}` | **Ruta real: `/estudiante/{id}/estadisticas`** | ❌ |
| `GET /api/asistencia/estudiante/{id}/atrasos` | → `/api/v1/asistencia/estudiante/{id}/atrasos` | `ControladorAsistencia` | ✅ |
| `GET/POST /api/clases` | → `/api/v1/clases` | `ControladorClase` | ✅ |
| `GET /api/clases/{id}` | → `/api/v1/clases/{id}` | `ControladorClase` | ✅ |
| `GET/POST /api/evaluaciones` | → `/api/v1/evaluaciones` | `ControladorEvaluacion` | ✅ |
| `PUT /api/evaluaciones/{id}` | → `/api/v1/evaluaciones/{id}` | `ControladorEvaluacion` | ✅ |
| `GET /api/evaluaciones/curso/{curso}` | → `/api/v1/evaluaciones/curso/{curso}` | **No existe** | ❌ |
| `GET/POST /api/evaluaciones/calificaciones` | → `/api/v1/evaluaciones/calificaciones` | `ControladorEvaluacion` | ✅ |
| `GET /api/evaluaciones/calificaciones/estudiante/{id}` | → `/api/v1/evaluaciones/calificaciones/estudiante/{id}` | `ControladorEvaluacion` | ✅ |

**3 endpoints solicitados por frontend que NO existen en backend:**
1. `GET /api/students/{id}/courses` — sin ruta en `StudentController`
2. `GET /api/evaluaciones/curso/{curso}` — sin ruta en `ControladorEvaluacion`
3. `GET /api/asistencia/estadisticas/{id}` — la ruta real es `/estudiante/{id}/estadisticas` (el rewrite del gateway genera 404)

---

## 5. Estado de Deuda Técnica

### 5.1 Deuda técnica real verificada en código

| Item | Archivo/Línea | Evidencia |
|---|---|---|
| `GlobalExceptionHandler` — handler `RuntimeException` es **dead code** | `ms-attendance/.../exception/GlobalExceptionHandler.java:147-165` | `Exception` (línea 128) captura RuntimeException primero |
| `ControladorEvaluacion` sin test | No existe `*ControladorEvaluacion*Test.java` | CRUD completo sin cobertura |
| `ControladorClase` sin test | No existe `*ControladorClase*Test.java` | CRUD completo sin cobertura |
| `ServicioClase` sin test | No existe `*ServicioClase*Test.java` | Lógica de negocio sin cobertura |
| `ServicioEvaluacion` sin test | No existe `*ServicioEvaluacion*Test.java` | Lógica de negocio sin cobertura |
| 3 endpoints frontend sin backend real | `bffClient.js`, `Evaluaciones.jsx`, `Asistencia.jsx` | Ver sección 4.3 |
| `AuthController.java` usa try-catch manual | `api-gateway/.../security/controller/AuthController.java` | 4 catch blocks inline, no usa `GlobalExceptionHandler` |
| `frontend/Dockerfile` y `backend-bff/Dockerfile` redundantes | Raíz del proyecto | El compose usa `Infra/docker/*.Dockerfile` |
| CI/CD pipeline — 7 jobs paralelos (8 en GitHub) | `.github/workflows/ci.yml` | Build + test en frontend y 6 módulos Java |
| Sin React Router | `frontend/src/App.jsx` | Navegación con estado local |
| Sin pruebas E2E en backend (Testcontainers) | No hay | Solo unitarias y de integración con H2 |
| `api-gateway` tests usan MySQL real | No tiene `src/test/resources/application.properties` | Dependencia externa en tests |

### 5.2 Deuda de información

| Item | Detalle |
|---|---|
| Despliegue cloud (AWS/GCP/Azure) | No especificado en el código actual |
| Terraform / IaC | No especificado en el código actual |
| Kubernetes / orquestación | No especificado en el código actual |
| Social Login / OAuth2 | No implementado |
| WebSockets / tiempo real | No implementado |
| Internacionalización (i18n) | No implementado |

### 5.3 Roadmap decidido (documentado en `docs/PLAN_EVOLUCION_TECNICA.md`)

**Próximos pasos planificados (V4):**
- Migración a TypeScript (frontend)
- Implementación de React Router
- Refactor de pruebas legacy (`auth.spec.js`)
- Dashboard en tiempo real (WebSocket/Socket.IO)
- Notificaciones push
- Internacionalización (i18n)
- Sistema de reportes PDF

---

*Documento generado el 2026-07-02. Auditoría basada exclusivamente en código fuente real.*
