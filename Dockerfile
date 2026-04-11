# ─── Etapa 1: Build ─────────────────────────────────────────
# Usamos Node para compilar el React en archivos estáticos
FROM node:20-slim AS builder

WORKDIR /app

# Copiar dependencias primero para aprovechar cache
COPY package.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Variable de entorno con la URL del backend
# Se pasa en tiempo de build (no en runtime)
# En Render se configura como Build Environment Variable
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Compilar React → genera archivos estáticos en /app/build
RUN npm run build

# ─── Etapa 2: Servidor ──────────────────────────────────────
# Usamos nginx para servir los archivos estáticos
# nginx es mucho más liviano que Node para servir archivos
FROM nginx:alpine

# Copiar los archivos compilados al directorio de nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Configuración de nginx para React Router
# Sin esto, al refrescar una ruta como /users daría 404
COPY nginx.conf /etc/nginx/conf.d/default.conf

# nginx escucha en el puerto 80 por defecto
# Render lo mapea automáticamente
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
