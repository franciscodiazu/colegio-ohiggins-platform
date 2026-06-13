# =============================================================================
# Dockerfile - Servidor de Eureka (Spring Cloud Eureka Server)
# Ubicación: /Infra/docker/discovery.Dockerfile
# Contexto de build: Raíz del proyecto (../)
# Multi-stage build: Build con Maven + Runtime con JRE Alpine
# Seguridad: Imágenes oficiales, no root, JRE minimizado, manejo de señales
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: Build
# -----------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

# Labels de build
LABEL stage=builder

# Directorio de trabajo
WORKDIR /app

# Copia el pom.xml primero (optimización de caché de dependencias Maven)
# El contexto es la raíz, accedemos a discovery-server/
COPY discovery-server/pom.xml .

# Descargar dependencias (capa cacheable)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY discovery-server/src ./src

# Compilar, ejecutar tests y empaquetar JAR
RUN mvn clean package -B

# -----------------------------------------------------------------------------
# STAGE 2: Runtime (Entorno Seguro No-Root)
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

# Labels para trazabilidad homologados
LABEL maintainer="Colegio Ohiggins DevOps Team"
LABEL version="1.0.0"
LABEL description="Servidor de Descubrimiento - Spring Cloud Eureka"

# Instalar utilidades mínimas para healthcheck y arranque seguro
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root para ejecutar la aplicación de forma segura
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Directorio de trabajo
WORKDIR /app

# Copiar JAR ejecutable de Spring Boot desde el stage de build
COPY --from=builder /app/target/*.jar app.jar

# Cambiar propietario a usuario no-root
RUN chown -R appuser:appgroup /app

# Health check basado en Actuator para reflejar disponibilidad real del servidor
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8761/actuator/health || exit 1

# Exponer el puerto por defecto de Eureka Server
EXPOSE 8761

# Cambiar a usuario no-root
USER appuser

# Usar dumb-init para el manejo correcto de señales del ciclo de vida del contenedor
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio ejecutable
CMD ["java", "-jar", "app.jar"]