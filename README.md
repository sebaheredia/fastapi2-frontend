# FastApi2 Frontend — React + Docker + CI/CD

Frontend de la aplicación FastApi2, construido con **React**, servido con **nginx**, dockerizado y desplegado automáticamente en **Render** via **GitHub Actions**.

---

## Arquitectura

```
[Usuario] → [React (frontend)] → [FastAPI (backend)] → [PostgreSQL]
```

El frontend NO se conecta directamente a la base de datos. Solo habla con el backend via HTTP/JSON. hola

---

## Estructura del proyecto

```
fastapi2-frontend/
├── public/
│   └── index.html          # HTML base
├── src/
│   ├── index.js            # Punto de entrada de React
│   ├── App.js              # Componente principal
│   ├── App.css             # Estilos
│   └── api.js              # Funciones para llamar al backend
├── nginx.conf              # Configuración del servidor web
├── Dockerfile              # Build multi-stage: Node → nginx
└── .github/
    └── workflows/
        └── ci.yml          # Pipeline CI/CD
```

---

## Cómo funciona `api.js`

`api.js` es la capa de comunicación con el backend. Contiene una función por cada endpoint:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function getUsers() { ... }    // GET /users
export async function createUser(...) { ... } // POST /users
export async function deleteUser(id) { ... } // DELETE /users/{id}
```

`REACT_APP_API_URL` es una variable de entorno que se inyecta en tiempo de build — apunta al backend de staging o producción según la rama.

---

## El Dockerfile — Multi-stage build

```
Etapa 1 (builder): Node.js
  → instala dependencias
  → compila React → archivos estáticos en /build

Etapa 2 (server): nginx
  → copia los archivos de /build
  → los sirve en el puerto 80
```

Nginx es mucho más liviano que Node para servir archivos estáticos — la imagen final pesa ~25MB en lugar de ~300MB.

---

## CI/CD

El pipeline tiene 3 jobs:

```
[docker] → [deploy-staging]    (solo en develop)
         → [deploy-production]  (solo en main)
```

El frontend no tiene job de tests porque React valida el código en el build. Si el código tiene errores de sintaxis o imports rotos, `npm run build` falla y el pipeline se detiene.

### Secrets requeridos en GitHub

| Secret | Descripción |
|---|---|
| `RENDER_API_KEY` | Token de Render (el mismo del backend) |
| `RENDER_FRONTEND_STAGING_SERVICE_ID` | ID del servicio frontend staging |
| `RENDER_FRONTEND_PRODUCTION_SERVICE_ID` | ID del servicio frontend producción |
| `GHCR_TOKEN` | Token GitHub con `read:packages` |
| `BACKEND_STAGING_URL` | URL del backend staging (ej: https://fastapi2-staging-docker.onrender.com) |
| `BACKEND_PRODUCTION_URL` | URL del backend producción |

---

## Correr localmente

```bash
# Instalar dependencias
npm install

# Correr en desarrollo (apunta a localhost:8000)
npm start
# http://localhost:3000

# El backend debe estar corriendo en localhost:8000
# En otra terminal: uvicorn main:app --reload
```

---

## Configurar en Render

1. Crear dos Web Services del tipo **Image** en Render:
   - `fastapi2-frontend-staging` → imagen `ghcr.io/sebaheredia/fastapi2-frontend:develop`
   - `fastapi2-frontend-production` → imagen `ghcr.io/sebaheredia/fastapi2-frontend:main`

2. No necesitan variables de entorno en Render — la URL del backend se incluyó en el bundle al buildear.

3. Cargar los secrets en GitHub y hacer push para disparar el primer deploy.

---

## Contacto

ADAIP (Área de Desarrollos Avanzados de Imágenes y Percepción)
