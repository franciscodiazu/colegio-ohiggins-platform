# ETAPA 1: Construcción (Builder)
# Usamos Node 22 para compatibilidad con Vite 8 y React Router 7
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias
COPY frontend/package*.json ./

# Instalamos dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiamos el resto del código del frontend
COPY frontend/ .

# Variable de entorno para el build de Vite (ARG para build time)
ARG VITE_API_URL=http://localhost:8080/api
ENV VITE_API_URL=${VITE_API_URL}

# Ejecutamos el build con la variable de entorno inyectada
RUN npm run build

# ETAPA 2: Servidor de Producción (Nginx)
FROM nginx:alpine-slim

# Crear usuario no-root por seguridad (Pauta Israel)
RUN addgroup -g 1001 -S nginx-group && \
    adduser -u 1001 -S nginx-user -G nginx-group

# Copiar configuración personalizada de Nginx (Proxy Inverso)
COPY Infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Ajustar permisos para el usuario no-root
RUN chown -R nginx-user:nginx-group /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-group /var/run/nginx.pid

USER nginx-user

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]