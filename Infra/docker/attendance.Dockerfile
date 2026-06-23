# =============================================================================
# Dockerfile - Microservicio Attendance (Spring Boot)
# Ubicación: /Infra/docker/attendance.Dockerfile
# Contexto de build: Raíz del proyecto (../)
# Multi-stage build: Build con Maven + Runtime con JRE Alpine
# Seguridad: Imágenes oficiales, no root, JRE minimizado
# =============================================================================

# ----------------------------------------------------------------------------
# STAGE 1: Build y Pruebas Automatizadas (Rúbrica AWS Ready)
# ----------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
LABEL stage=builder
WORKDIR /app

# Copiar pom.xml primero (optimización de caché de dependencias Maven)
COPY ms-attendance/pom.xml .

# Descargar dependencias (capa cacheable)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY ms-attendance/src ./src

# Compilar, ejecutar los 101 tests y empaquetar el JAR ejecutable de producción
RUN mvn clean package -B

# ----------------------------------------------------------------------------
# STAGE 2: Runtime (Entorno Seguro No-Root)
# ----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Colegio Ohiggins DevOps Team"
LABEL version="1.0.0"
LABEL description="Microservicio Attendance - Spring Boot"

# Instalar utilidades mínimas para healthcheck y arranque seguro
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copiar JAR ejecutable de Spring Boot
COPY --from=builder /app/target/*.jar app.jar

# Cambiar propietario de los archivos al usuario sin privilegios
RUN chown -R appuser:appgroup /app

# Health check basado en Spring Actuator para AWS / Docker internal
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8082/actuator/health || exit 1

EXPOSE 8082
USER appuser

ENTRYPOINT ["/usr/bin/dumb-init", "--", "java", "-jar", "app.jar"]
