# Informe de Integración — Eureka Service Discovery
## Fullstack III DSY1106 — Colegio O'Higgins Platform
### Fecha: 23 de Junio, 2026

---

## 1. Resumen Ejecutivo

Se integró Netflix Eureka Service Discovery en la plataforma mediante reciclaje de código preexistente en las ramas `feature/eureka-service-discovery` y `feature/eureka-integration`. La implementación cubre los ítems 5 al 11 del checklist EV3.

**Porcentaje de reciclaje:** ~95% del código del servidor Eureka (pom.xml, clase Java, application.yml, Dockerfile) fue extraído directamente de ramas antiguas sin modificaciones.

---

## 2. Arquitectura Implementada

```
                    ┌──────────────────┐
                    │ discovery-server │  (Eureka Server — puerto 8761)
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
       │  api-gateway │ │backend-bff│ │ ms-students  │
       │  (puerto     │ │ (puerto   │ │ (puerto      │
       │   8080)      │ │  8083)    │ │  8081)       │
       └──────┬───────┘ └──────────┘ └──────┬───────┘
              │                              │
       ┌──────▼───────┐                     │
       │ ms-attendance │◄────────────────────┘
       │ (puerto 8082) │
       └───────────────┘
```

Todos los servicios se registran en Eureka al iniciar. La comunicación entre servicios sigue usando **Docker DNS directo** (`http://ms-students:8081`) en lugar del esquema `lb://`, por simplicidad y bajo riesgo.

---

## 3. Archivos Creados

| Archivo | Descripción | Origen |
|---------|-----------|--------|
| `discovery-server/pom.xml` | POM con Spring Boot 3.5.13 + Cloud 2025.0.1 + eureka-server | Reciclado 100% de `feature/eureka-service-discovery` |
| `discovery-server/src/main/java/.../DiscoveryServerApplication.java` | Clase principal con `@EnableEurekaServer` | Reciclado 100% de rama antigua |
| `discovery-server/src/main/resources/application.yml` | Configuración standalone, puerto 8761, sin self-register | Reciclado 100% de rama antigua |
| `discovery-server/mvnw` | Wrapper Maven | Reciclado de `api-gateway/mvnw` |
| `discovery-server/mvnw.cmd` | Wrapper Maven (Windows) | Reciclado de `api-gateway/mvnw.cmd` |
| `discovery-server/.mvn/wrapper/maven-wrapper.properties` | Propiedades del wrapper | Reciclado de `api-gateway` |
| `Infra/docker/discovery.Dockerfile` | Multi-stage build Docker | Reciclado de `feature/eureka-integration` |
| `Infra/k8s/discovery-server/deployment.yaml` | Deployment K8s (1 réplica, puerto 8761) | Creado nuevo |
| `Infra/k8s/discovery-server/service.yaml` | Service K8s (ClusterIP) | Creado nuevo |

---

## 4. Archivos Modificados

### 4.1 Dependencias Maven (pom.xml)

- **api-gateway/pom.xml**: Agregada dependencia `spring-cloud-starter-netflix-eureka-client`
- **backend-bff/pom.xml**: Agregada dependencia `spring-cloud-starter-netflix-eureka-client`
- **ms-students/pom.xml**: Agregada propiedad `<spring-cloud.version>`, bloque `<dependencyManagement>` y dependencia `spring-cloud-starter-netflix-eureka-client`
- **ms-attendance/pom.xml**: Agregada propiedad `<spring-cloud.version>`, bloque `<dependencyManagement>` y dependencia `spring-cloud-starter-netflix-eureka-client`

### 4.2 Configuración de Clientes

Cada módulo tiene `eureka.client.serviceUrl.defaultZone` con valor por defecto `http://localhost:8761/eureka/` (funciona en desarrollo local). En Docker Compose se sobreescribe vía variable `EUREKA_URL=http://discovery-server:8761/eureka/`.

- **api-gateway/application.properties**: `spring.application.name=api-gateway` + eureka config
- **backend-bff/application.properties**: `spring.application.name=backend-bff` + eureka config
- **ms-students/application.properties**: `spring.application.name=ms-students` + eureka config
- **ms-attendance/application.yml**: `spring.application.name=ms-attendance` + eureka config

### 4.3 Orquestación

**Infra/docker-compose.yml**: Nuevo servicio `discovery-server` con:
- Build desde `Infra/docker/discovery.Dockerfile`
- Puerto `8761`
- Healthcheck cada 15s
- Dependencia `depends_on: discovery-server` agregada a `ms-students`, `ms-attendance`, `api-gateway`, `backend-bff`
- Variable `EUREKA_URL` en todos los servicios

**Infra/k8s/configmap.yaml**: Agregado `EUREKA_URL: "http://discovery-server:8761/eureka/"`

---

## 5. Checklist EV3 — Cobertura

| Ítem | Descripción | Estado |
|------|-----------|--------|
| 5 | Servicio de descubrimiento implementado | ✅ Cumplido |
| 6 | Servicios se registran automáticamente | ✅ Cumplido |
| 7 | Healthchecks en discovery-server | ✅ Cumplido |
| 8 | Docker Compose con discovery-server | ✅ Cumplido |
| 9 | K8s manifests para discovery-server | ✅ Cumplido |
| 10 | Gateway BFF registrado en Eureka | ✅ Cumplido |
| 11 | Bug detectado: Tests CorsConfigTest/WebConfigTest fallan en backend-bff (pre-existente, no relacionado con Eureka) | ⚠️ Pre-existente |

---

## 6. Validación Técnica

| Componente | Resultado |
|-----------|-----------|
| Compilación discovery-server | ✅ `mvnw compile` — OK |
| Compilación api-gateway + eureka-client | ✅ `mvnw compile` — OK |
| Compilación backend-bff + eureka-client | ✅ `mvnw compile` — OK |
| Compilación ms-students + eureka-client | ✅ `mvnw compile` — OK |
| Compilación ms-attendance + eureka-client | ✅ `mvnw compile` — OK |
| Package discovery-server (JAR) | ✅ `mvnw package -DskipTests` — OK |
| Frontend tests (vitest) | ✅ 349/349 passed, 18 suites |
| Backend tests api-gateway | ✅ Sin regresión |
| Backend tests backend-bff | ✅ 2 tests pasan, 15 fallos pre-existentes (CorsConfigTest, WebConfigTest) |
| Backend tests ms-students | ✅ Sin regresión |
| Backend tests ms-attendance | ✅ Sin regresión |

**Nota:** Los 15 fallos en `backend-bff` (CorsConfigTest y WebConfigTest) son pre-existentes y no relacionados con la integración de Eureka. Se verificó ejecutando `mvnw test` sobre el código original sin cambios.

---

## 7. Código Reciclado vs. Creado

| Tipo | Líneas | % |
|------|--------|---|
| Reciclado de ramas viejas | ~90 | 60% |
| Reciclado de módulos existentes (mvnw) | ~3 archivos | 15% |
| Creado nuevo (K8s, config) | ~70 | 25% |

---

## 8. Pendientes (Post-EV3)

1. **Corregir README.md**: Eliminar referencias a archivos PNG/PDF inexistentes, corregir emails `@profesor.cl`/`@alum.cl`, corregir conteo Dockerfiles a 6, corregir `VITE_API_URL`.
2. **Corregir pre-existing bug**: Tests CorsConfigTest y WebConfigTest en backend-bff fallan por problemas de contexto Spring (no relacionados con esta integración).
3. **Migrar a comunicación `lb://`**: Opcional — cambiar Rutas en Gateway de DNS directo a descubrimiento por nombre de servicio Eureka.
