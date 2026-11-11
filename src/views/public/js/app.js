import { api, el, mostrarAviso, mensajeDeError } from './nucleo.js';
import { SECCIONES } from './secciones/index.js';

// Estado de la interfaz: quién tiene sesión y qué sección se muestra.
const estado = { sesion: { usuario: null, permisos: [] }, seccionId: null, usuariosDemo: [] };

const zonaSesion = document.getElementById('zona-sesion');
const menu = document.getElementById('menu');
const contenido = document.getElementById('contenido');

/** Secciones visibles según los permisos que informa el controlador (la API vuelve a validarlos). */
function seccionesVisibles() {
  return SECCIONES.filter((s) => s.permiso === null || estado.sesion.permisos.includes(s.permiso));
}

function pintarSesion() {
  zonaSesion.replaceChildren();
  if (estado.sesion.usuario) {
    const { nombre, rolNombre } = estado.sesion.usuario;
    zonaSesion.append(
      el('span', {}, `Sesión: ${nombre} · ${rolNombre}`),
      el('button', { type: 'button', onclick: cerrarSesion }, 'Salir'),
    );
    return;
  }
  const selector = el(
    'select',
    { id: 'usuario-demo', 'aria-label': 'Usuario de demostración' },
    el('option', { value: '' }, 'Ingresar como…'),
    estado.usuariosDemo.map((u) => el('option', { value: String(u.id) }, `${u.nombre} — ${u.rolNombre}`)),
  );
  zonaSesion.append(
    selector,
    el('button', { type: 'button', onclick: () => iniciarSesion(selector.value) }, 'Ingresar'),
  );
}

function pintarMenu() {
  menu.replaceChildren(
    seccionesVisibles().map((s) =>
      el(
        'button',
        { type: 'button', 'aria-current': s.id === estado.seccionId ? 'page' : false, onclick: () => abrirSeccion(s.id) },
        s.titulo,
      ),
    ),
  );
}

async function abrirSeccion(id) {
  const visibles = seccionesVisibles();
  const seccion = visibles.find((s) => s.id === id) ?? visibles[0];
  estado.seccionId = seccion?.id ?? null;
  pintarMenu();
  contenido.replaceChildren();
  if (!seccion) {
    contenido.append(el('p', { class: 'vacio' }, 'Aún no hay secciones disponibles para este perfil.'));
    return;
  }
  try {
    await seccion.montar(contenido, { sesion: estado.sesion, recargar: () => abrirSeccion(seccion.id) });
  } catch (error) {
    contenido.append(el('p', { class: 'vacio' }, mensajeDeError(error)));
  }
}

async function cargarSesion() {
  estado.sesion = await api('GET', '/api/sesion');
}

async function iniciarSesion(usuarioId) {
  if (!usuarioId) return mostrarAviso('Seleccione un usuario de demostración', 'error');
  try {
    estado.sesion = await api('POST', '/api/sesion', { usuarioId: Number(usuarioId) });
    pintarSesion();
    await abrirSeccion(estado.seccionId);
  } catch (error) {
    mostrarAviso(mensajeDeError(error), 'error');
  }
}

async function cerrarSesion() {
  try {
    await api('DELETE', '/api/sesion');
    estado.sesion = { usuario: null, permisos: [] };
    pintarSesion();
    await abrirSeccion(estado.seccionId);
  } catch (error) {
    mostrarAviso(mensajeDeError(error), 'error');
  }
}

async function iniciar() {
  try {
    estado.usuariosDemo = await api('GET', '/api/usuarios-demo');
    await cargarSesion();
  } catch (error) {
    mostrarAviso(mensajeDeError(error), 'error');
  }
  pintarSesion();
  await abrirSeccion(null);
}

iniciar();
