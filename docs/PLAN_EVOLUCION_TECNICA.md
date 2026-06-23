# Plan de Evolución Técnica — Colegio O'Higgins Platform

## Versión: 1.0 — MV3 (Minimum Viable Product)
## Fecha: 23/06/2026

---

## 1. Visión de Arquitectura

El presente documento describe las brechas técnicas identificadas durante la auditoría EV3 que, por alcance del MV3, no fueron implementadas en esta iteración. Se detalla la estrategia de implementación planificada para la iteración V4, demostrando que el diseño de arquitectura contempla estos aspectos desde su concepción.

---

## 2. Brechas Técnicas y Roadmap V4

### 2.1 Sistema de Métricas y Monitoreo (Prometheus + Grafana)

| Aspecto | Detalle |
|---------|---------|
| **Estado actual** | Healthchecks básicos (actuator/health) en todos los servicios. Eureka heartbeat para detección de disponibilidad. Docker restart policy (`unless-stopped`) para recuperación automática. JaCoCo coverage para calidad de código |
| **Brecha** | No hay métricas de rendimiento, latencia, tasa de error ni dashboards visuales |
| **Estrategia V4** | Implementar Micrometer + Prometheus para exponer métricas en formato `/actuator/prometheus`. Desplegar stack Prometheus/Grafana vía Docker Compose. Crear dashboard predefinido con: latencia de endpoints, tasa de error por servicio, uso de memoria/CPU, estado de circuit breakers |
| **Patrón** | Observability sidecar + metrics exporter |
| **Prioridad** | Alta |

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

### 2.5 Monitoreo Funcional Actual (MV3)

El MV3 implementa un esquema de monitoreo básico pero funcional que cubre la detección de fallos y recuperación automática:

| Mecanismo | Cobertura | Propósito |
|-----------|-----------|-----------|
| **actuator/health** | Todos los servicios (7/7) | Healthcheck para Docker Compose y balanceadores |
| **Eureka Heartbeat** | Todos los servicios | Registro automático y detección de caídas (renovación cada 30s) |
| **Docker restart policy** | `unless-stopped` en todos los servicios | Recuperación automática ante caídas no controladas |
| **depends_on + condition** | Cadena completa: mysql → discovery → MS → gateway → frontend | Orden de inicio garantizado |
| **JaCoCo Coverage** | ms-students, ms-attendance | Reportes de cobertura de código embebidos |

**Acciones ante falla de un microservicio:**
1. Docker restart policy reinicia el contenedor automáticamente (hasta 3 reintentos)
2. Eureka marca la instancia como DOWN y la remueve del registro
3. Los servicios dependientes detectan la caída vía healthcheck
4. Si el fallo persiste, `docker ps` muestra `(unhealthy)` como alerta visual

Este esquema será reemplazado por Prometheus + Grafana + alertas en V4.

### 2.6 Tests de Integración en BFF

| Aspecto | Detalle |
|---------|---------|
| **Estado actual** | 10 tests pasan, 15 fallan en entornos sin contexto JWT completo |
| **Brecha** | Tests de integración dependen de contexto de seguridad Spring Security |
| **Estrategia V4** | Migrar tests a `@SpringBootTest` con `@AutoConfigureMockMvc` y `@WithMockUser`. Agregar perfiles específicos de test con H2 en lugar de MySQL. Implementar TestContainers para entorno IDÉNTICO al de producción |
| **Patrón** | Test slices + context configuration + TestContainers |
| **Prioridad** | Baja (no bloqueante para despliegue) |

---

## 3. Deuda Técnica Identificada

| Ítem | Impacto | Esfuerzo estimado V4 |
|------|---------|---------------------|
| Migrar comunicación de DNS directo a `lb://` vía Eureka | Medio (resiliencia) | 2 días |
| Refresh token endpoint retorna 401 | Medio (UX) | 1 día |
| Frontend migrar a TypeScript | Bajo (mantenibilidad) | 5 días |
| Agregar HTTPS en gateway | Alto (seguridad) | 1 día |
| Agregar logging interno en frontend | Bajo (trazabilidad) | 2 días |

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
| V3 (actual) | Entrega funcional microservicios + frontend | 11/11 smoke tests, 7/7 contenedores healthy |
| V4 | Monitoreo + logging + excepciones globales | Dashboard Prometheus, logs centralizados, handler global |
| V5 | Kubernetes + escalado | Despliegue K8s con HPA, migración a `lb://` |

---

*Documento generado como parte del Plan de Evolución Técnica — Sprint de Cierre EV3.*
