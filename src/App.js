/*
╔══════════════════════════════════════════════════════════════╗
║                          App.js                              ║
║   Componente principal de la aplicacion React.               ║
║   Maneja el estado global de la UI y orquesta todas          ║
║   las interacciones con el backend via api.js.               ║
╚══════════════════════════════════════════════════════════════╝
*/

import React, { useState, useEffect } from 'react';
// React      → libreria principal para construir interfaces
// useState   → hook para manejar estado local del componente
//              Cada llamada a useState crea una variable reactiva:
//              cuando cambia, React re-renderiza el componente automaticamente
// useEffect  → hook para ejecutar codigo con efectos secundarios
//              (llamadas a APIs, timers, suscripciones)

import { getUsers, createUser, deleteUser } from './api';
// Importa las tres funciones de comunicacion con el backend.
// Cada una corresponde a un endpoint de la API REST.

import './App.css';
// Estilos del componente. React los aplica globalmente.


// ─── Componente principal ──────────────────────────────────────
// export default → permite que otros archivos importen este componente
// App es una funcion que devuelve JSX (HTML dentro de JavaScript)
// React la llama automaticamente cada vez que el estado cambia
export default function App() {

  // ─── Estado ──────────────────────────────────────────────────
  // useState(valorInicial) devuelve [valor, funcion_para_cambiarlo]
  // Cuando se llama a la funcion setter, React re-renderiza el componente
  // con el nuevo valor. Es la forma en que React "reacciona" a los cambios.

  const [users, setUsers] = useState([]);
  // Lista de usuarios que viene del backend.
  // Inicia vacia [] y se llena cuando fetchUsers() termina.

  // Solo para debug: muestra en la consola del navegador que URL esta usando React.
  // Util para verificar que REACT_APP_API_URL se embebio correctamente en el build.
  // En produccion se puede quitar.
  console.log("API URL:", process.env.REACT_APP_API_URL);

  const [nombre, setNombre] = useState('');
  // Valor del campo "Nombre" del formulario.
  // Se actualiza con onChange en cada tecla que escribe el usuario.

  const [email, setEmail] = useState('');
  // Valor del campo "Email" del formulario. Igual que nombre.

  const [loading, setLoading] = useState(true);
  // true  → muestra el spinner "Cargando usuarios..."
  // false → muestra la lista o el mensaje "No hay usuarios"
  // Inicia en true porque al cargar la pagina inmediatamente
  // empieza a buscar usuarios.

  const [submitting, setSubmitting] = useState(false);
  // true  → el formulario esta enviando datos al backend
  //         el boton muestra "Registrando..." y esta deshabilitado
  // false → el formulario esta listo para recibir datos

  const [error, setError] = useState('');
  // Mensaje de error que se muestra en rojo debajo del formulario.
  // String vacio '' significa que no hay error (el mensaje no se muestra).

  const [success, setSuccess] = useState('');
  // Mensaje de exito que se muestra en verde debajo del formulario.
  // String vacio '' significa que no hay mensaje.
  const [edad, setEdad] = useState("");


  // ─── Efecto inicial ───────────────────────────────────────────
  useEffect(() => {
    fetchUsers();
  }, []);
  // useEffect(funcion, dependencias) ejecuta la funcion cuando
  // las dependencias cambian.
  // [] como dependencias significa "ejecutar solo una vez al montar
  // el componente", equivalente al evento "onLoad" de la pagina.
  // Sin [], correria en cada re-render (bucle infinito).


  // ─── Cargar usuarios ──────────────────────────────────────────
  async function fetchUsers() {
    // async/await permite escribir codigo asincronico de forma lineal.
    // Sin async/await habria que usar .then().catch() (callbacks anidados).
    try {
      setLoading(true);                // mostrar spinner
      const data = await getUsers();   // llamar al backend, esperar respuesta
      setUsers(data);                  // guardar la lista en el estado
                                       // React re-renderiza con los nuevos datos
    } catch (err) {
      // Si getUsers() lanza una excepcion (sin conexion, error del servidor),
      // se captura aca y se muestra el mensaje de error en la UI
      setError('No se pudo conectar con el servidor');
    } finally {
      // finally corre siempre, haya error o no.
      // Garantiza que el spinner se oculta en cualquier caso.
      setLoading(false);
    }
  }


  // ─── Crear usuario ────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    // Sin preventDefault(), el navegador recargaria la pagina al enviar el form.
    // Eso es el comportamiento default de HTML. React maneja el envio via fetch,
    // no via recarga de pagina, por eso hay que cancelar el default.

    // Limpiar mensajes anteriores antes de intentar el nuevo envio
    setError('');
    setSuccess('');
    if (!edad) {
      setError("La edad es obligatoria");
      return;
    }
    setSubmitting(true); // deshabilitar boton y mostrar "Registrando..."

    try {
      await createUser(nombre, email, Number(edad));// llamar al backend
      setSuccess(`Usuario ${nombre} creado exitosamente`); // mostrar confirmacion
      setNombre('');   // limpiar campo nombre del formulario
      setEmail('');    // limpiar campo email del formulario
      setEdad('');
      fetchUsers();    // recargar la lista para mostrar el nuevo usuario
    } catch (err) {
      // err.message viene del throw new Error() en api.js
      // Por ejemplo: "El email ya está registrado"
      setError(err.message);
    } finally {
      setSubmitting(false); // volver a habilitar el boton
    }
  }


  // ─── Borrar usuario ───────────────────────────────────────────
  async function handleDelete(id, nombre) {
    // window.confirm abre un dialogo de confirmacion nativo del navegador.
    // Si el usuario hace clic en "Cancelar", devuelve false y el return
    // detiene la funcion sin borrar nada.
    if (!window.confirm(`¿Borrar a ${nombre}?`)) return;

    setError(''); // limpiar errores anteriores
    try {
      await deleteUser(id);                          // llamar al backend
      setSuccess(`Usuario ${nombre} eliminado`);     // mostrar confirmacion
      fetchUsers();                                  // recargar la lista
    } catch (err) {
      setError('Error al borrar el usuario');
    }
  }


  // ─── Render ───────────────────────────────────────────────────
  // JSX: sintaxis que mezcla HTML con JavaScript.
  // Las expresiones JavaScript van entre llaves {}.
  // React compila JSX a llamadas JavaScript puras antes de ejecutar.
  return (
    <div className="app">
      {/* className en lugar de class porque class es palabra reservada en JS */}
      {/* Los comentarios en JSX van dentro de llaves con esta sintaxis */}

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-badge">CI/CD</div>
          <h1 className="header-title">Gestión de Usuarios</h1>
          <p className="header-sub">FastAPI + React + PostgreSQL + Docker</p>
        </div>
      </header>

      <main className="main">

        {/* ── Formulario de registro ──────────────────────── */}
        <section className="card form-card">
          <h2 className="card-title">
            <span className="card-number">01</span>
            Nuevo Usuario
          </h2>

          {/* onSubmit llama a handleSubmit cuando el usuario envia el form */}
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="label">Nombre</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Seba Heredia"
                value={nombre}
                // value={nombre} hace que el input sea "controlado":
                // React es la fuente de verdad del valor, no el DOM.
                onChange={e => setNombre(e.target.value)}
                // onChange se llama en cada tecla. e.target.value es
                // el texto actual del input. setNombre actualiza el estado
                // y React re-renderiza el input con el nuevo valor.
                required
                // required: el navegador impide enviar el form si esta vacio
              />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="Ej: seba@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label">Edad</label>
              <input
                className="input"
                type="number"
                placeholder="Ej: 30"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                required
              />
            </div>

            <button
              className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </form>

          {/* Renderizado condicional: solo muestra el div si el string no esta vacio */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {/* En JavaScript, '' (string vacio) es falsy, entonces '' && <div>
              no renderiza nada. Cuando hay un mensaje, lo muestra. */}
        </section>

        {/* ── Lista de usuarios ───────────────────────────── */}
        <section className="card list-card">
          <h2 className="card-title">
            <span className="card-number">02</span>
            Usuarios Registrados
            <span className="badge">{users.length}</span>
            {/* users.length muestra el numero de usuarios en el badge */}
          </h2>

          {loading ? (
            // Si loading es true → mostrar spinner
            <div className="loading">
              <div className="spinner" />
              <span>Cargando usuarios...</span>
            </div>
          ) : users.length === 0 ? (
            // Si no esta cargando y no hay usuarios → mostrar mensaje vacio
            <div className="empty">
              <div className="empty-icon">◎</div>
              <p>No hay usuarios registrados todavía</p>
            </div>
          ) : (
            // Si hay usuarios → mostrar la lista
            // Este patron (A ? B : C ? D : E) es un ternario anidado
            <ul className="user-list">
              {users.map((user, index) => (
                // .map() itera el array y devuelve un elemento JSX por cada item
                // key={user.id} es obligatorio: React lo usa internamente para
                // identificar cada elemento y hacer updates eficientes.
                // Sin key, React no sabe cual elemento cambio y re-renderiza todo.
                <li
                  key={user.id}
                  className="user-item"
                  style={{ animationDelay: `${index * 60}ms` }}
                  // Delay escalonado para la animacion de entrada:
                  // primer usuario: 0ms, segundo: 60ms, tercero: 120ms...
                  // Crea el efecto de que los items aparecen de a uno.
                >
                  <div className="user-avatar">
                    {user.nombre.charAt(0).toUpperCase()}
                    {/* Muestra la primera letra del nombre en mayuscula
                        como avatar. charAt(0) devuelve el primer caracter. */}
                  </div>

                  <div className="user-info">
                    <span className="user-nombre">{user.nombre}</span>
                    <span className="user-email">{user.email}</span>
                    <span>Edad: {user.edad}</span>
                    <span style={{ fontWeight: 'bold' }}>
                      {user.categoria?.toUpperCase() ?? '—'}
                    </span>
                  </div>
                  <div className="user-meta">
                    <span className="user-id">#{user.id}</span>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user.id, user.nombre)}
                      // Arrow function necesaria porque handleDelete recibe
                      // argumentos. Sin la arrow function, se ejecutaria
                      // inmediatamente al renderizar en lugar de al hacer clic.
                      // onClick={handleDelete} seria incorrecto porque
                      // handleDelete espera (id, nombre), no el evento.
                      title="Eliminar usuario"
                      // title muestra un tooltip al pasar el mouse
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="footer">
        <span>FastApi2 — ADAIP</span>
        <span className="footer-dot">·</span>
        <span>CI/CD con GitHub Actions + Render</span>
      </footer>

    </div>
  );
}
