# =============================================================================
# Dockerfile - Spring Boot Admin Server
# Ubicación: /Infra/docker/admin.Dockerfile
# Contexto de build: Raíz del proyecto (../admin-server)
# Multi-stage build: Build con Maven + Runtime con JRE Alpine
# Seguridad: Imágenes oficiales, no root, JRE minimizado
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: Build
# -----------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

LABEL stage=builder

WORKDIR /app

COPY admin-server/pom.xml .

RUN mvn dependency:go-offline -B

COPY admin-server/src ./src

RUN mvn clean package -B

# -----------------------------------------------------------------------------
# STAGE 2: Runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Colegio Ohiggins DevOps Team"
LABEL version="1.0.0"
LABEL description="Spring Boot Admin Server - Monitoreo Centralizado"

RUN apk add --no-cache dumb-init curl

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

RUN chown -R appuser:appgroup /app

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8084/actuator/health || exit 1

EXPOSE 8084

USER appuser

ENTRYPOINT ["dumb-init", "--"]

CMD ["java", "-jar", "app.jar"]
