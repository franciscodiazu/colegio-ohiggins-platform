# =============================================================================
# Dockerfile - Frontend (React + Vite)
# Ubicación: /Infra/docker/frontend.Dockerfile
# Contexto de build: Raíz del proyecto (../frontend)
# Multi-stage build: Build con Node.js + Runtime con Nginx
# Seguridad: Imágenes oficiales verificadas, no root en runtime
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: Build
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

# Instalar dependencias de build necesarias
RUN apk add --no-cache dumb-init

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (optimización de caché)
# El contexto es la raíz del proyecto, por eso usamos frontend/
COPY frontend/package*.json ./

# Instalar dependencias con npm ci (más rápido y determinista)
RUN npm ci --only=production=false

# Copiar código fuente desde la carpeta frontend
COPY frontend/ .

# Definir ARG para VITE_API_URL (build-time)
ARG VITE_API_URL=http://backend-bff:8080

# Build de la aplicación
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: Runtime
# -----------------------------------------------------------------------------
FROM nginx:alpine-slim

# Labels para trazabilidad
LABEL maintainer="Colegio Ohiggins DevOps Team"
LABEL version="1.0.0"
LABEL description="Frontend Colegio Ohiggins - React + Vite"

# Crear usuario no-root para nginx
RUN addgroup -g 1001 -S nginx-group && \
    adduser -u 1001 -S nginx-user -G nginx-group

# Copiar configuración de nginx desde Infra/docker/
COPY Infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados desde el stage de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Cambiar permisos para el usuario no-root
RUN chown -R nginx-user:nginx-group /usr/share/nginx/html && \
    chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-group /var/run/nginx.pid

# Configurar nginx para escuchar en puerto no privilegiado
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen  \[::\]:80;/listen  [::]:8080;/' /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Exponer puerto
EXPOSE 8080

# Cambiar a usuario no-root
USER nginx-user

# Iniciar nginx en foreground
CMD ["nginx", "-g", "daemon off;"]
