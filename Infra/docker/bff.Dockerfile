# =============================================================================
# Dockerfile - Backend BFF (Spring Boot Gateway)
# Ubicación: /Infra/docker/bff.Dockerfile
# Contexto de build: Raíz del proyecto (../backend-bff)
# Multi-stage build: Build con Maven + Runtime con JRE Alpine
# Seguridad: Imágenes oficiales, no root, JRE minimizado
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: Build
# -----------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

# Labels de build
LABEL stage=builder

# Directorio de trabajo
WORKDIR /app

# Copiar pom.xml primero (optimización de caché de dependencias Maven)
COPY backend-bff/pom.xml .

# Descargar dependencias (capa cacheable)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY backend-bff/src ./src

# Compilar y empaquetar (skip tests para build rápido, se testea en CI)
RUN mvn clean package -DskipTests -B && \
    mkdir -p target/dependency && \
    cd target/dependency && \
    jar -xf ../*.jar

# -----------------------------------------------------------------------------
# STAGE 2: Runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

# Labels para trazabilidad
LABEL maintainer="Colegio Ohiggins DevOps Team"
LABEL version="1.0.0"
LABEL description="Backend BFF - Spring Boot API Gateway"

# Instalar utilidades mínimas para healthcheck y arranque seguro
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root para ejecutar la aplicación
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Directorio de trabajo
WORKDIR /app

# Copiar JAR descomprimido desde el stage de build (mejor rendimiento de startup)
COPY --from=builder /app/target/dependency/BOOT-INF/lib /app/lib
COPY --from=builder /app/target/dependency/META-INF /app/META-INF
COPY --from=builder /app/target/dependency/BOOT-INF/classes /app

# Cambiar propietario a usuario no-root
RUN chown -R appuser:appgroup /app

# Health check basado en Actuator para reflejar disponibilidad real
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Exponer puerto
EXPOSE 8080

# Cambiar a usuario no-root
USER appuser

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["java", "-cp", "/app:/app/lib/*", "com.backend.backend_bff.BackendBffApplication"]
