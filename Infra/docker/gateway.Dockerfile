# =============================================================================
# Dockerfile - API Gateway (Spring Cloud Gateway + JWT Auth)
# Ubicación: /Infra/docker/gateway.Dockerfile
# Contexto de build: Raíz del proyecto (../api-gateway)
# Multi-stage build: Build con Maven + Runtime con JRE Alpine
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: Build
# -----------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

LABEL stage=builder

WORKDIR /app

# Copiar pom.xml primero (optimización de caché de dependencias Maven)
COPY api-gateway/pom.xml .

# Descargar dependencias (capa cacheable)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY api-gateway/src ./src

# Compilar, ejecutar tests y empaquetar JAR
RUN mvn clean package -B

# -----------------------------------------------------------------------------
# STAGE 2: Runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Colegio Ohiggins DevOps Team"
LABEL version="1.0.0"
LABEL description="API Gateway - Spring Cloud Gateway con JWT Auth"

# Instalar utilidades mínimas para healthcheck
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar JAR ejecutable
COPY --from=builder /app/target/*.jar app.jar

# Cambiar propietario a usuario no-root
RUN chown -R appuser:appgroup /app

# Health check basado en Actuator
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Exponer puerto
EXPOSE 8080

# Cambiar a usuario no-root
USER appuser

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["java", "-jar", "app.jar"]
