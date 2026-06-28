# Plan de Evolución Técnica — Colegio O'Higgins Platform

## Versión: 1.0 — MV3 (Minimum Viable Product)
## Fecha: 23/06/2026

---

## 1. Visión de Arquitectura

El presente documento describe las brechas técnicas identificadas durante la auditoría EV3 que, por alcance del MV3, no fueron implementadas en esta iteración. Se detalla la estrategia de implementación planificada para la iteración V4, demostrando que el diseño de arquitectura contempla estos aspectos desde su concepción.

---

## 2. Brechas Técnicas y Roadmap V4

### 2.0 Backend for Frontend (v1.19 Post-Cirugía)

| Aspecto | Detalle |
|---------|---------|
| **Estado actual (v1.19)** | ✅ **Resuelto en sesión post-EV3.** Backend-bff contiene 6 clases vivas (CorsConfig, OpenApiConfig, PlatformHealthIndicator, RestTemplateConfig, SecurityConfig, BackendBffApplication) tras eliminación de auth controllers. Los 17 tests (CorsConfigTest 7 + WebConfigTest 8 + ApplicationTest 2) verifican configuración CORS y health aggregation, NO lógica de autenticación. |
| **Rol real (NO auth proxy)** | El BFF es un **CORS proxy + health aggregator**. NO maneja autenticación JWT — esa es responsabilidad exclusiva del api-gateway. BFF solo: (a) Configura CORS permitiendo cross-origin desde frontend (localhost:5173), (b) Expone /actuator/health y /actuator/prometheus, (c) Verifica estado de ms-students y ms-attendance via PlatformHealthIndicator. |
| **Cobertura JaCoCo real** | 77% instrucciones (195 total, 43 missed), branches n/a (CORS sin decisiones condicionales), 100% métodos (0 missed), 6 clases. Métrica real post-cirugía (anterior 83% era pre-cirugía sobre 16 clases inexistentes). |
| **Arquitectura** | BFF en puerto 8083 (segregado de gateway:8080). Spring Security configurado solo para permitir /actuator/health y /actuator/prometheus públicamente; todo lo demás deniega. |
| **Próximos pasos V4** | Evaluar si BFF requiere lógica de agregación más compleja (ej. composición de respuestas de múltiples MS) o si su rol se reduce únicamente a healthcheck. Actualmente es "too thin" pero funcional. |
| **Patrón** | API Composition Pattern (actual: mínimo), Evolution: agregación de datos si la lógica de frontend lo requiere. |
| **Prioridad** | Baja (resuelto funcional, mejora opcional) |

### 2.1 Sistema de Métricas y Monitoreo (Prometheus + Grafana)

| Aspecto | Detalle |
|---------|---------|
| **Estado actual (MV3+)** | ✅ **Cerrada en sesión post-EV3.** Prometheus scrapea cada 5s los 4 servicios Java con targets en `http://localhost:9090/targets` (4/4 UP). Grafana con datasource Prometheus conectada y dashboard JVM Micrometer importado (32 series JVM: memoria, threads, GC, HTTP). Micrometer configurado en api-gateway, backend-bff y ms-students (`management.metrics.tags.application`). |
| **Implementación** | `Infra/monitoring/prometheus.yml` + servicios en `docker-compose.yml`. Dashboard: https://grafana.com/grafana/dashboards/4701 (JVM Micrometer) |
| **Próximos pasos V4** | Alerting con Alertmanager, métricas de negocio personalizadas, dashboard de latencia p99 por endpoint |
| **Patrón** | Observability sidecar + metrics exporter |
| **Prioridad** | Cerrada (V4: media) |

### 2.2 Logging Centralizado (ELK / Loki)

| Aspecto | Detalle |
|---------|---------|
| **Estado actual** | Logs locales SLF4J por servicio, visibles solo via `docker logs` |
| **Brecha** | Sin agregación ni búsqueda centralizada de logs |
| **Estrategia V4** | Integrar logback con appender HTTP hacia Loki (Grafana) o Filebeat hacia Elasticsearch. Unificar formato JSON estructurado para todos los servicios (traceId, spanId, userId). Implementar correlation ID entre servicios |
| **Patrón** | Centralized logging pipeline (Loki + Grafana) o ELK Stack |
| **Prioridad** | Alta |

### 2.3 Manejo de Excepciones — Global Exception Handler

| Aspecto | Detalle |
|---------|---------|
| **Estado actual** | Manejo de excepciones básico en cada microservicio con `@ExceptionHandler` parcial |
| **Brecha** | No hay un handler global estandarizado que unifique formato de respuesta HTTP para todo tipo de errores |
| **Estrategia V4** | Implementar `@ControllerAdvice` global en cada servicio con formato estandarizado: `{ "timestamp", "status", "error", "message", "path", "traceId" }`. Mapear todas las excepciones HTTP estándar (400, 401, 403, 404, 500, 503) |
| **Patrón** | `@ControllerAdvice` + `ResponseEntityExceptionHandler` |
| **Prioridad** | Media |

### 2.4 Circuit Breaker — Dashboard Hystrix / Resilience4j

| Aspecto | Detalle |
|---------|---------|
| **Estado actual** | Circuit Breaker implementado en ms-attendance (Resilience4j), pero sin dashboard ni métricas visibles |
| **Brecha** | No hay visibilidad del estado del circuit breaker |
| **Estrategia V4** | Exponer métricas de Resilience4j via `/actuator/health` + Micrometer. Integrar con dashboard Prometheus. Agregar health indicator personalizado que refleje estado del CB |
| **Patrón** | Resilience4j + Micrometer + Prometheus |
| **Prioridad** | Media |

### 2.5 Monitoreo Actual (MV3+)

El MV3+ implementa un esquema de monitoreo en dos capas —healthchecks básicos + observabilidad con Prometheus/Grafana— que cubre tanto detección como visualización:

| Mecanismo | Cobertura | Propósito |
|-----------|-----------|-----------|
| **Prometheus scrape** | 4 servicios Java (api-gateway, backend-bff, ms-students, ms-attendance) | Métricas cada 5s via `/actuator/prometheus` |
| **Grafana dashboard** | Dashboard JVM Micrometer (4701) — 32 series | Visualización de memoria, threads, GC, HTTP metrics |
| **actuator/health** | Todos los servicios (9/9) | Healthcheck para Docker Compose y balanceadores |
| **Eureka Heartbeat** | Todos los servicios (4 clientes) | Registro automático y detección de caídas (renovación cada 30s) |
| **Docker restart policy** | `unless-stopped`/`on-failure` | Recuperación automática ante caídas no controladas |
| **depends_on + condition** | Cadena completa | Orden de inicio garantizado |

**Acciones ante falla de un microservicio:**
1. Prometheus detecta target DOWN en el próximo scrape (5s)
2. Dashboard Grafana pierde las series del servicio (efecto visual inmediato)
3. Docker restart policy reinicia el contenedor automáticamente
4. Eureka marca la instancia como DOWN y la remueve del registro
5. Si el fallo persiste, `http://localhost:9090/targets` muestra estado DOWN como alerta visual

**Próxima mejora V4:** Alertmanager + notificaciones (Slack/email).

### 2.6 Production-Readiness Warnings (Spring Boot 3.x)

| Warning | Servicios | Estrategia V4 | Prioridad |
|---------|-----------|---------------|-----------|
| `hibernate.dialect` explícito | 4 servicios JPA | Eliminar propiedad `hibernate.dialect` de `application.properties` | Baja |
| `spring.jpa.open-in-view` | 4 servicios JPA | Agregar `spring.jpa.open-in-view=false` en todos los servicios | Media |
| LoadBalancer default cache | 5 servicios Java | Agregar dependencia `caffeine` + `CaffeineCacheManager` | Baja |
| yServerWebMvc keys obsoletas | api-gateway, backend-bff | Actualizar claves de configuración a Spring Boot 3.x | Baja |
| Bean Validation provider | discovery-server | Agregar `hibernate-validator` al classpath | Baja |

Estos warnings no afectan la funcionalidad del sistema pero representan mejoras de calidad para producción. Todos están planificados para la iteración V4.

### 2.7 Tests de Integración en BFF

| Aspecto | Detalle |
|---------|---------|
| **Estado actual** | 17/17 tests PASS, 0 errores. CorsConfigTest (7), WebConfigTest (8), ApplicationTest (2) — todos resueltos |
| **Brecha resuelta** | Tests de integración dependían de contexto de seguridad Spring Security. Se resolvió sin intervención directa (entorno de build local compatible) |
| **Monitoreo** | En CI/CD externo (GitHub Actions) podrian requerir ajuste con perfiles específicos. Opcional: migrar a TestContainers para entorno identico a produccion |
| **Patrón** | Test slices + context configuration |
| **Prioridad** | Baja (resuelto, solo monitoreo) |

---

## 3. Deuda Técnica Identificada

| Ítem | Impacto | Esfuerzo estimado V4 |
|------|---------|---------------------|
| Migrar comunicación de DNS directo a `lb://` vía Eureka | Medio (resiliencia) | 2 días |
| Refresh token endpoint retorna 401 | Medio (UX) | 1 día |
| Frontend migrar a TypeScript | Bajo (mantenibilidad) | 5 días |
| Agregar HTTPS en gateway | Alto (seguridad) | 1 día |
| Agregar logging interno en frontend | Bajo (trazabilidad) | 2 días |
| Alertmanager + notificaciones Prometheus | Medio (operaciones) | 1 día |

---

## 4. Principios de Diseño

- **Database per Service**: Cada microservicio tiene su propio esquema MySQL con usuario de privilegio mínimo (`app_colegio`).
- **API First**: La especificación OpenAPI (Swagger) es la fuente de verdad para la comunicación entre servicios.
- **Resilience by Design**: Circuit Breaker + healthchecks + retry pattern en comunicaciones inter-servicio.
- **Security by Default**: JWT stateless con refresh token, CORS configurado, gateway como punto único de entrada.
- **Evolution over Perfection**: Cada iteración cierra brechas técnicas priorizando funcionalidad entregable sobre completitud teórica.

---

## 5. Estándares de Rendimiento y Disponibilidad

### 5.1 Objetivos de Rendimiento (SLA)

| Componente | Métrica | Objetivo MV3 | Objetivo V4 |
|------------|---------|-------------|-------------|
| API Gateway | Latencia p99 | < 300ms | < 100ms |
| Microservicios (cada uno) | Latencia p99 | < 500ms | < 200ms |
| Frontend | Tiempo carga inicial | < 3s | < 1.5s |
| Frontend | Tiempo interacción | < 100ms | < 50ms |
| Frontend | Tiempo respuesta API simulada | < 1s | < 500ms |
| Base de Datos | Query simple | < 100ms | < 50ms |
| Disponibilidad | Uptime (Docker) | 99.5% (no HA) | 99.9% (K8s) |

### 5.2 Estrategia de Cumplimiento

- **Backend**: Servicios stateless diseñados para escalado horizontal. Cada instancia maneja su propio pool de conexiones JDBC.
- **Frontend**: Build estático servido por Nginx con compresión gzip y cacheo de assets.
- **Base de Datos**: Conexiones vía pool HikariCP configurado con timeout y límite de conexiones.
- **Gateway**: Enrutamiento sin estado, JWT validado en cada request sin sesiones en servidor.

---

## 6. Proyección V4

| Iteración | Objetivo | Métricas objetivo |
|-----------|----------|-------------------|
| V3 (actual) | Entrega funcional microservicios + frontend + monitoreo | 11/11 smoke tests, 9/9 contenedores healthy, 4/4 Prometheus targets UP |
| V4 | Logging centralizado + excepciones globales + alertas | Loki/Grafana, handler global, Alertmanager |
| V5 | Kubernetes + escalado | Despliegue K8s con HPA, migración a `lb://` |

---

*Documento generado como parte del Plan de Evolución Técnica — Sprint de Cierre EV3.*
