/*
╔══════════════════════════════════════════════════════════════╗
║                          api.js                              ║
║   Capa de comunicacion con el backend FastAPI.               ║
║   Contiene una funcion por cada endpoint de la API REST.     ║
║   App.js importa estas funciones y las llama segun la        ║
║   accion del usuario (cargar lista, crear, borrar).          ║
║                                                              ║
║   Este archivo es el unico que sabe la URL del backend.      ║
║   El resto del frontend no conoce ni le importa de donde     ║
║   vienen los datos.                                          ║
╚══════════════════════════════════════════════════════════════╝
*/

// URL base del backend FastAPI.
// process.env.REACT_APP_API_URL es una variable de entorno que React
// embebe dentro del codigo JavaScript en tiempo de compilacion (npm run build).
// La variable se pasa como ARG en el Dockerfile desde GitHub Actions.
//
// IMPORTANTE: como se embebe en tiempo de BUILD y no en runtime,
// si cambia la URL hay que reconstruir la imagen Docker. No alcanza
// con cambiar una variable de entorno en Render despues del deploy.
//
// El || actua como fallback: si la variable no existe (desarrollo local
// donde no hay Dockerfile ni GitHub Actions), usa localhost:8000.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';


/**
 * Obtener todos los usuarios.
 * Llama a GET /users en el backend.
 *
 * fetch() hace una peticion HTTP. Por defecto usa GET, por eso no
 * hace falta especificar el metodo.
 *
 * await pausa la ejecucion hasta que el servidor responda.
 * Sin await, response seria una Promise sin resolver, no los datos reales.
 *
 * response.ok es true si el codigo HTTP de respuesta es 200-299.
 * Si el servidor devuelve 500 o 404, ok es false y se lanza el error.
 *
 * response.json() lee el cuerpo de la respuesta y lo convierte de
 * texto JSON a un objeto JavaScript. Tambien es asincrono (devuelve Promise).
 */
export async function getUsers() {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Error al obtener usuarios');
  return response.json();
  // Devuelve: [{id: 1, nombre: "Seba", email: "s@s.com", created_at: "..."}, ...]
}


/**
 * Crear un nuevo usuario.
 * Llama a POST /users en el backend.
 *
 * A diferencia de getUsers, este request necesita enviar datos al servidor.
 * fetch() acepta un segundo argumento con las opciones del request:
 *
 * method: 'POST'
 *   Indica que se esta creando un recurso. Sin esto seria GET por defecto.
 *
 * headers: { 'Content-Type': 'application/json' }
 *   Le dice al servidor en que formato vienen los datos del body.
 *   Sin este header, FastAPI no sabria como leer el JSON y devolveria error.
 *
 * body: JSON.stringify({ nombre, email })
 *   Convierte el objeto JavaScript a texto JSON para enviarlo por HTTP.
 *   { nombre, email } es la sintaxis corta de ES6 para { nombre: nombre, email: email }
 *   cuando la clave y la variable tienen el mismo nombre.
 *
 * Si el backend devuelve un error (ej: email duplicado → 400),
 * lee el JSON del error para obtener el mensaje especifico del backend.
 * El backend FastAPI devuelve: { "detail": "El email ya está registrado" }
 * error.detail || 'Error al crear usuario' usa el mensaje del backend si existe,
 * o un mensaje generico si no.
 */
// ✅ CORRECCIÓN — además agregar el manejo de error que tienen las otras funciones
export async function createUser(nombre, email, edad) {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, edad })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al crear usuario');
  }

  return response.json();
}
  // Devuelve el usuario recien creado con su id y created_at
  // asignados automaticamente por la base de datos.



/**
 * Borrar un usuario por su ID.
 * Llama a DELETE /users/{id} en el backend.
 *
 * El ID se interpola directamente en la URL usando template literals.
 * Por ejemplo, si id = 3, la URL es: https://backend.onrender.com/users/3
 *
 * method: 'DELETE' indica que se esta eliminando un recurso.
 * No se envia body porque toda la informacion necesaria esta en la URL.
 *
 * El backend devuelve el usuario eliminado como confirmacion de que
 * la operacion se realizo correctamente.
 */
export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al borrar usuario');
  return response.json();
  // Devuelve el objeto del usuario que se acabo de eliminar.
}