# =============================================================================
# Dockerfile - Servidor de Eureka (Spring Cloud Eureka Server)
# Ubicación: /Infra/docker/discovery.Dockerfile
# Contexto de build: Raíz del proyecto (../)
# Multi-stage build: Build con Maven + Runtime con JRE Alpine
# =============================================================================

# STAGE 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
LABEL stage=builder
WORKDIR /app
COPY discovery-server/pom.xml .
RUN mvn dependency:go-offline -B
COPY discovery-server/src ./src
RUN mvn clean package -B

# STAGE 2: Runtime
FROM eclipse-temurin:21-jre-alpine
LABEL maintainer="Colegio Ohiggins DevOps Team"
LABEL version="1.0.0"
LABEL description="Servidor de Descubrimiento - Spring Cloud Eureka"
RUN apk add --no-cache dumb-init curl
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN chown -R appuser:appgroup /app
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8761/actuator/health || exit 1
EXPOSE 8761
USER appuser
ENTRYPOINT ["dumb-init", "--"]
CMD ["java", "-jar", "app.jar"]
