# Guion Video de Arquitectura — Colegio O'Higgins Platform
**Duración estimada:** 12–15 min | **Checklist EV3:** Items 1–52 (Video Arquitectura)
**Equipo:** Francisco Diaz, Genesis Flores, Emilio Hormazabal
**Preparación:** Docker Compose corriendo (9/9 healthy), pantalla partida: editor + navegador

---

## Bloque 1: Visión Global — README + Diagrama (ítems 1–4)
**Duración:** ~2:00 min | **Pantalla:** GitHub README.md

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 0:00 | Abrir `README.md` en GitHub. Mostrar título, badges CI | "Hola, somos el equipo de desarrollo de la Plataforma Colegio O'Higgins. Este es un sistema de gestión académica basado en microservicios, desarrollado para el ramo Fullstack III." |
| 0:20 | Scrollear a sección "Arquitectura", mostrar diagrama Mermaid | "La problemática: un colegio necesita gestionar estudiantes, asistencia, y entregar información a profesores, estudiantes y apoderados. Descomponemos el dominio en subdominios: estudiantes y asistencia, cada uno como microservicio independiente." |
| 0:40 | Mouse sobre cada subgraph del diagrama: Cliente → FE → GW → MS | "Aquí están todos los componentes: un frontend React servido por nginx, un API Gateway con Spring Cloud Gateway que centraliza autenticación JWT y ruteo, dos microservicios —ms-students y ms-attendance—, un BFF que agrega health checks, un discovery-server Eureka, MySQL como base de datos, Prometheus + Grafana para monitoreo, y CI/CD con GitHub Actions." |
| 1:20 | Scrollear a "Estructura del Proyecto", mostrar el árbol de directorios | "El proyecto es un monorepo. Cada módulo tiene su propio README, pruebas unitarias, y Dockerfile. La comunicación entre servicios usa Docker DNS con nombres lógicos." |
| 1:50 | Transición | "Ahora veamos Service Discovery en acción." |

---

## Bloque 2: Service Discovery — Eureka (ítems 5–11)
**Duración:** ~1:30 min | **Pantalla:** http://localhost:8761

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 2:00 | Abrir `http://localhost:8761` — mostrar Dashboard de Eureka | "Service Discovery actúa como una base de datos dinámica de ubicaciones de red. Cada microservicio, al iniciar, se registra automáticamente con su IP y puerto en Eureka usando self-registration." |
| 2:15 | Señalar las 4 instancias registradas: API-GATEWAY, BACKEND-BFF, MS-STUDENTS, MS-ATTENDANCE | "Aquí vemos las 4 instancias registradas: api-gateway, backend-bff, ms-students y ms-attendance. Cada una aparece con su estado UP, su IP dentro de la red Docker y su puerto." |
| 2:35 | Mostrar Status, IP, Port columns | "La tabla muestra el estado de salud, la IP y el puerto. Si una instancia falla, Eureka la marca DOWN después de 3 heartbeats perdidos." |
| 2:55 | Mostrar `discovery-server/pom.xml` con dependencia `spring-cloud-starter-netflix-eureka-server` | "Para levantar el discovery-server, ejecutamos `docker compose up discovery-server`. El JAR no se descarga externamente; se construye desde el Dockerfile multi-stage en el CI. Cada cliente agrega la dependencia `eureka-client` en su pom.xml." |
| 3:20 | Mostrar `application.yml` de un cliente (ej: ms-students) con `eureka.client.serviceUrl.defaultZone` | "La configuración del cliente apunta a `http://discovery-server:8761/eureka/`. Si se requiere modificar, se cambia esta URL en `application.yml` y se re-despliega." |
| 3:30 | Transición | "Pasemos a los microservicios — el corazón del dominio." |

---

## Bloque 3: Microservicios — ms-students + ms-attendance (ítems 12–30)
**Duración:** ~4:00 min | **Pantalla:** Código + Swagger + Consola

### 3a. ms-students (~1:30 min)

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 3:35 | Abrir `ms-students/` estructura de carpetas | "ms-students cubre el dominio de gestión de estudiantes: CRUD completo con validación de RUT chileno." |
| 3:50 | Abrir `EstudianteController.java` — mostrar endpoints | "El controlador expone endpoints REST: GET, POST, PUT, DELETE sobre `/api/estudiantes`. Retorna HttpStatus 201 al crear, 200 en consultas, 204 al eliminar, 400 si los datos son inválidos, 404 si no existe." |
| 4:10 | Abrir `RutValidator.java` — mostrar lógica de validación | "La regla de negocio principal es la validación de RUT con dígito verificador. Implementamos el algoritmo oficial chileno en un validador reutilizable." |
| 4:25 | Abrir Swagger: `http://localhost:8081/swagger-ui.html` | "La especificación OpenAPI documenta cada endpoint, sus parámetros y códigos de respuesta. Aquí se puede probar cada operación." |
| 4:40 | Mostrar `pom.xml` de ms-students — dependencias clave | "Las dependencias: spring-boot-starter-data-jpa, spring-boot-starter-web, mysql-connector-j, eureka-client, actuator, prometheus." |

### 3b. ms-attendance (~1:30 min)

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 4:55 | Abrir `ms-attendance/` estructura, mostrar `AttendanceController.java` | "ms-attendance gestiona la asistencia: registro por curso y fecha, con regla de negocio de un solo registro por estudiante por día." |
| 5:10 | Abrir paquete `strategy/` — mostrar `ValidationStrategy`, `AsistenciaStrategy` | "Aplicamos el patrón Strategy: cada estado de asistencia —Presente, Atraso, Inasistencia— es una estrategia de validación con su propia lógica. Se selecciona en tiempo de ejecución según el valor recibido." |
| 5:30 | Abrir `ClienteEstudiantesResilienceTest.java` o `AttendanceService.java` con `@CircuitBreaker` | "El Circuit Breaker con Resilience4j protege la llamada a ms-students. Si el servicio remoto falla, se abre el circuito y retorna una respuesta por defecto en lugar de propagar el error." |
| 5:50 | Abrir paquete `factory/` — mostrar `StudentFactory` | "También aplicamos Factory Pattern para la creación de objetos complejos, centralizando la lógica de construcción." |
| 6:05 | Mostrar `GlobalExceptionHandler.java` — tabla de excepciones | "El manejo de excepciones está centralizado en un GlobalExceptionHandler que captura errores de validación, recursos no encontrados, excepciones de JPA, y retorna códigos HTTP semánticos con mensajes descriptivos." |

### 3c. Cross-cutting (~1:00 min)

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 6:30 | Mostrar `application.properties` en cada MS | "Cada microservicio tiene su archivo de configuración con datasource, eureka, server port, logging, y métricas. Se levantan individualmente con `docker compose up ms-students` o todos juntos." |
| 6:45 | Mostrar logs en consola: `docker compose logs ms-students --tail 20` | "El logging interno con SLF4J permite rastrear peticiones, errores y tiempos de respuesta. Además, cada servicio expone métricas via Actuator y Prometheus." |
| 7:05 | Mostrar `docs/INFORME_AUDITORIA_EV3.md` sección 4 — cobertura JaCoCo | "Las pruebas unitarias y de integración están documentadas. 104 tests Java pasan correctamente. La cobertura JaCoCo se exporta como reporte HTML en `docs/coverage-report/`." |
| 7:25 | Transición | "Ahora veamos cómo protegemos el acceso." |

---

## Bloque 4: Seguridad — JWT + Refresh Token (ítems 31–35)
**Duración:** ~1:15 min | **Pantalla:** Código api-gateway

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 7:30 | Abrir `api-gateway/src/main/java/.../jwt/JwtUtil.java` | "La seguridad se justifica porque manejamos datos sensibles de estudiantes y apoderados. Implementamos autenticación JWT con tokens de acceso de 30 minutos y refresh tokens de 7 días revocables." |
| 7:45 | Señalar `generateToken()`, `validateToken()` | "El JWT se genera con el email y rol del usuario, firmado con HMAC-SHA256. En cada petición, el Gateway valida la firma, fecha de expiración, y extrae el subject para los controladores." |
| 8:00 | Mostrar `SecurityConfig.java` con cadena de filtros | "Spring Security configura una cadena de filtros: el `JwtAuthenticationFilter` intercepta cada request antes del ruteo, extrae el token del header Authorization, lo valida y lo inyecta en el contexto de seguridad." |
| 8:20 | Mostrar `GatewayConfig.java` con rutas protegidas | "El Gateway enruta las peticiones según el path: `/api/students/**` a ms-students, `/api/asistencia/**` a ms-attendance, y `/api/v1/auth/**` se maneja internamente. Solo el login y register son públicos; el resto requiere token." |
| 8:40 | Transición | "Y el API Gateway orquesta todo." |

---

## Bloque 5: API Gateway (ítems 36–38)
**Duración:** ~1:00 min | **Pantalla:** Código Gateway

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 8:45 | Abrir `api-gateway/src/main/java/.../config/GatewayConfig.java` | "El API Gateway es el punto único de entrada. Implementa Spring Cloud Gateway MVC con routing dinámico y balanceo de carga." |
| 9:00 | Mostrar rutas: `/api/students/**` → `lb://ms-students`, `/api/asistencia/**` → `lb://ms-attendance` | "Las rutas se definen declarativamente. Cada ruta tiene un filtro JWT que valida el token antes de reenviar la petición al microservicio destino." |
| 9:15 | Mostrar filtros: `JwtAuthGatewayFilterFactory.java` | "Los componentes clave son: el RouteLocator con las rutas, los filtros de autenticación, y los predicates que deciden qué rutas aplicar. Cada petición pasa por el filtro JWT, se valida, y se reenvía al destino o se rechaza con 401." |
| 9:35 | Transición | "Pasemos al monitoreo." |

---

## Bloque 6: Monitoreo — Prometheus + Grafana (ítems 39–42)
**Duración:** ~1:30 min | **Pantalla:** localhost:9090 + localhost:3000

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 9:40 | Abrir `http://localhost:9090/targets` — mostrar 4/4 UP | "Justificamos el monitoreo porque en una arquitectura de microservicios, es crítico detectar fallas temprano. Prometheus scrapea cada 5 segundos los endpoints `/actuator/prometheus` de los 4 servicios Java." |
| 10:00 | Abrir `http://localhost:3000` — login admin/admin, mostrar dashboard JVM Micrometer | "Grafana se aprovisiona automáticamente sin configuración manual. Importa el dashboard JVM Micrometer con 27 paneles que muestran: memoria heap, uso de CPU, tasas de solicitudes HTTP, tiempos de respuesta, y estado de los threads." |
| 10:20 | Señalar los 4 servicios en las series del dashboard | "Si un microservicio falla, sus series de métricas JVM desaparecen del dashboard. Además, Prometheus marca el target como DOWN en `/targets`, y Eureka cambia su estado a DOWN. Entre los 3 sistemas —Prometheus, Grafana, Eureka— la detección de fallas es inmediata." |
| 10:40 | Mostrar `Infra/monitoring/prometheus.yml` | "La configuración está en `Infra/monitoring/`. Para mejoras futuras, tenemos planificado integrar Loki para logs centralizados y alertas vía Alertmanager." |
| 10:55 | Transición | "Finalmente, el frontend." |

---

## Bloque 7: Frontend (ítems 43–52)
**Duración:** ~1:30 min | **Pantalla:** localhost:5173 + código

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 11:00 | Abrir `http://localhost:5173` en navegador, mostrar login | "El frontend es una SPA con React 19 + Vite 8. Elegimos React por su ecosistema maduro, componentes reutilizables y testing con Vitest." |
| 11:15 | Mostrar página de Dashboard (login con `ana.perez@profesor.cl`, pass `123456`) | "Las reglas de negocio en frontend incluyen 3 principales: validación de RUT en formularios, roles inferidos por dominio de correo (.profesor.cl, .alum.cl), y bloqueo de asistencia duplicada por estudiante/día." |
| 11:30 | Abrir DevTools Network, mostrar interceptor axios con Bearer token | "La seguridad se implementa con un interceptor de Axios que agrega el token JWT a cada petición. Si recibe 401, intenta refresh automático antes de redirigir a login." |
| 11:45 | Mostrar `src/components/ConfirmModal.jsx`, `TableSkeleton.jsx` | "Aplicamos patrón Container/Presenter: las páginas manejan estado y lógica, los componentes reutilizables reciben props y renderizan UI. El hook personalizado `useFieldValidation` centraliza la validación en tiempo real." |
| 12:00 | Mostrar tabla de errores en `frontend/README.md` sección de manejo de errores | "Para manejo de excepciones, tenemos 5 escenarios documentados: error de red muestra mensaje de conexión, 401 redirige a login, 400 muestra errores de validación, 500 muestra fallback, y timeout muestra botón de reintento." |
| 12:15 | Mostrar test runner: `npm test` en frontend (349 pass) | "Las pruebas unitarias corren con Vitest: 349 tests en 18 suites. Playwright E2E cubre el flujo completo registro → login → dashboard → logout con 16 tests." |
| 12:30 | Cierre | "El estándar de rendimiento definido: latencia p99 menor a 2s, uptime 99.5%, tiempo de carga de página <3s. La plataforma está preparada para escalar horizontalmente agregando instancias detrás del Gateway." |

---

## Resumen Checklist por Bloque

| Bloque | Ítems Cubiertos | Duración |
|--------|-----------------|----------|
| 1. Visión Global | 1, 2, 3, 4 | 2:00 |
| 2. Service Discovery | 5, 6, 7, 8, 9, 10, 11 | 1:30 |
| 3. Microservicios | 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30 | 4:00 |
| 4. Seguridad | 31, 32, 33, 34, 35 | 1:15 |
| 5. API Gateway | 36, 37, 38 | 1:00 |
| 6. Monitoreo | 39, 40, 41, 42 | 1:30 |
| 7. Frontend | 43, 44, 45, 46, 47, 48, 49, 50, 51, 52 | 1:30 |
| **Total** | **52/52 (100%)** | **~13:00** |

---

## Notas de Producción
- **Resolución:** 1920x1080, captura full screen
- **Editor:** Split screen: 70% código/navegador, 30% cámara (opcional)
- **Auto-captions:** Recomendado
- **Transiciones:** Cortes directos entre bloques
- **Repaso antes de grabar:** Ejecutar `docker compose ps` para confirmar 9/9 healthy, abrir todas las URLs de antemano
- **Posibles contratiempos:** Si algún contenedor no responde, reiniciar con `docker compose restart <servicio>`
