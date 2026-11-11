// Utilidades compartidas de la interfaz. Solo presentación: ninguna regla de negocio vive aquí.

/** Error devuelto por la API, con el estado HTTP y el cuerpo de error del servidor. */
export class ErrorApi extends Error {
  constructor(estado, error) {
    super(error?.mensaje ?? 'Error inesperado');
    this.estado = estado;
    this.detalles = error?.detalles ?? [];
  }
}

/**
 * Crea un elemento del DOM. Los textos se insertan con nodos de texto (nunca innerHTML), de modo
 * que los datos de clientes no puedan inyectar HTML en la pantalla del personal.
 */
export function el(etiqueta, atributos = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) {
    if (valor === false || valor === null || valor === undefined) continue;
    if (clave === 'class') nodo.className = valor;
    else if (clave.startsWith('on') && typeof valor === 'function') nodo.addEventListener(clave.slice(2), valor);
    else if (['value', 'checked', 'disabled', 'selected'].includes(clave)) nodo[clave] = valor;
    else nodo.setAttribute(clave, valor === true ? '' : valor);
  }
  for (const hijo of hijos.flat()) {
    nodo.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo ?? '')));
  }
  return nodo;
}

/** Llama a la API y devuelve el JSON; lanza ErrorApi si la respuesta no es exitosa. */
export async function api(metodo, ruta, cuerpo) {
  const respuesta = await fetch(ruta, {
    method: metodo,
    headers: cuerpo ? { 'Content-Type': 'application/json' } : {},
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    credentials: 'same-origin',
  });
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, datos?.error);
  return datos;
}

/** Texto apto para el usuario a partir de un error de la API. */
export function mensajeDeError(error) {
  if (error instanceof ErrorApi && error.detalles.length > 0) {
    return error.detalles.map((d) => d.mensaje).join(' · ');
  }
  return error?.message ?? 'Ocurrió un error inesperado';
}

let temporizadorAviso = null;
/** Muestra un aviso temporal. tipo: 'ok' | 'error' | 'info'. */
export function mostrarAviso(texto, tipo = 'info') {
  const zona = document.getElementById('aviso');
  zona.replaceChildren(el('div', { class: `mensaje ${tipo}` }, texto));
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => zona.replaceChildren(), 6000);
}

const formatoCop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
/** @returns {string} valor en pesos colombianos. */
export function formatearPrecio(valor) {
  return formatoCop.format(valor);
}

/** @returns {string} fecha y hora en la zona horaria del negocio (Colombia, UTC-5). */
export function formatearFechaHora(iso) {
  return new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });
}

/** Clase CSS de la etiqueta de estado (solo presentación). */
export function claseEstado(estado) {
  return String(estado)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(' ')[0];
}

/** Etiqueta coloreada para un estado. */
export function etiquetaEstado(estado) {
  return el('span', { class: `etiqueta ${claseEstado(estado)}` }, estado);
}

/** Bloque de lista de errores de validación para un formulario. */
export function listaErrores(detalles) {
  return el('ul', { class: 'errores' }, detalles.map((d) => el('li', {}, d.mensaje)));
}
