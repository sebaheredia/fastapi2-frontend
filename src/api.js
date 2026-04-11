// URL base del backend FastAPI
// En desarrollo local: http://localhost:8000
// En producción: la URL de Render del backend
// La variable de entorno se configura en el Dockerfile o en Render
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Obtener todos los usuarios
 * GET /users
 */
export async function getUsers() {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Error al obtener usuarios');
  return response.json();
}

/**
 * Crear un nuevo usuario
 * POST /users
 */
export async function createUser(nombre, email) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al crear usuario');
  }
  return response.json();
}

/**
 * Borrar un usuario por ID
 * DELETE /users/{id}
 */
export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al borrar usuario');
  return response.json();
}
