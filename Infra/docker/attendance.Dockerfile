# =============================================================================
# Dockerfile - Microservicio Attendance (Spring Boot)
# Ubicación: /Infra/docker/attendance.Dockerfile
# Contexto de build: Raíz del proyecto (../ms-attendance)
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
COPY ms-attendance/pom.xml .

# Descargar dependencias (capa cacheable)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY ms-attendance/src ./src

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
LABEL description="Microservicio Attendance - Spring Boot"

# Instalar utilidades necesarias
RUN apk add --no-cache dumb-init

# Crear usuario no-root para ejecutar la aplicación
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Directorio de trabajo
WORKDIR /app

# Copiar JAR descomprimido desde el stage de build
COPY --from=builder /app/target/dependency/BOOT-INF/lib /app/lib
COPY --from=builder /app/target/dependency/META-INF /app/META-INF
COPY --from=builder /app/target/dependency/BOOT-INF/classes /app

# Cambiar propietario a usuario no-root
RUN chown -R appuser:appgroup /app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD pgrep java || exit 1

# Exponer puerto
EXPOSE 8082

# Cambiar a usuario no-root
USER appuser

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio - Ajustar el nombre de la clase principal
CMD ["java", "-cp", "/app:/app/lib/*", "com.backend.ms_attendance.MsAttendanceApplication"]
