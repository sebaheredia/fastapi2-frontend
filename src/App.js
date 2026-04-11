import React, { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from './api';
import './App.css';

export default function App() {
  // ─── Estado ────────────────────────────────────────────────
  const [users, setUsers] = useState([]);           // lista de usuarios
  // Al principio del componente App, después de los useState
  console.log("API URL:", process.env.REACT_APP_API_URL);
  const [nombre, setNombre] = useState('');          // campo nombre del form
  const [email, setEmail] = useState('');            // campo email del form
  const [loading, setLoading] = useState(true);      // cargando lista
  const [submitting, setSubmitting] = useState(false); // enviando form
  const [error, setError] = useState('');            // mensaje de error
  const [success, setSuccess] = useState('');        // mensaje de éxito

  // ─── Cargar usuarios al montar el componente ───────────────
  // useEffect con [] como dependencia corre solo una vez al cargar la página
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  // ─── Crear usuario ─────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault(); // evitar que el form recargue la página
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await createUser(nombre, email);
      setSuccess(`Usuario ${nombre} creado exitosamente`);
      setNombre('');
      setEmail('');
      fetchUsers(); // recargar la lista
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Borrar usuario ────────────────────────────────────────
  async function handleDelete(id, nombre) {
    if (!window.confirm(`¿Borrar a ${nombre}?`)) return;
    setError('');
    try {
      await deleteUser(id);
      setSuccess(`Usuario ${nombre} eliminado`);
      fetchUsers(); // recargar la lista
    } catch (err) {
      setError('Error al borrar el usuario');
    }
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-badge">CI/CD</div>
          <h1 className="header-title">Gestión de Usuarios</h1>
          <p className="header-sub">FastAPI + React + PostgreSQL + Docker</p>
        </div>
      </header>

      <main className="main">

        {/* Formulario de registro */}
        <section className="card form-card">
          <h2 className="card-title">
            <span className="card-number">01</span>
            Nuevo Usuario
          </h2>

          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="label">Nombre</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Seba Heredia"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
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
            <button
              className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </form>

          {/* Mensajes de feedback */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </section>

        {/* Lista de usuarios */}
        <section className="card list-card">
          <h2 className="card-title">
            <span className="card-number">02</span>
            Usuarios Registrados
            <span className="badge">{users.length}</span>
          </h2>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <span>Cargando usuarios...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◎</div>
              <p>No hay usuarios registrados todavía</p>
            </div>
          ) : (
            <ul className="user-list">
              {users.map((user, index) => (
                <li key={user.id} className="user-item" style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="user-avatar">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-nombre">{user.nombre}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="user-meta">
                    <span className="user-id">#{user.id}</span>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user.id, user.nombre)}
                      title="Eliminar usuario"
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

      {/* Footer */}
      <footer className="footer">
        <span>FastApi2 — ADAIP</span>
        <span className="footer-dot">·</span>
        <span>CI/CD con GitHub Actions + Render</span>
      </footer>

    </div>
  );
}
