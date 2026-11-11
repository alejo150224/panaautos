import { api, el, formatearFechaHora, listaErrores, mensajeDeError, mostrarAviso, ErrorApi } from '../nucleo.js';

/** Sección HU10: consulta y filtros del historial de acciones (Dueño y Administrador). */
export const historial = {
  id: 'historial',
  titulo: 'Historial',
  permiso: 'historial:consultar',

  async montar(contenedor) {
    const opciones = await api('GET', '/api/historial/opciones');
    contenedor.append(
      el('h2', {}, 'Historial de acciones'),
      el('p', { class: 'descripcion' }, 'Registro automático de propuestas, decisiones, ventas y cambios de estado de solicitudes. Los filtros se combinan.'),
    );

    const usuario = el('select', { id: 'f-usuario' }, el('option', { value: '' }, 'Todos los usuarios'), opciones.usuarios.map((u) => el('option', { value: String(u.id) }, u.nombre)));
    const desde = el('input', { id: 'f-desde', type: 'date' });
    const hasta = el('input', { id: 'f-hasta', type: 'date' });
    const tipo = el('select', { id: 'f-tipo' }, el('option', { value: '' }, 'Todos los tipos'), opciones.tiposElemento.map((t) => el('option', { value: t }, t)));
    const zonaErrores = el('div', { id: 'errores-historial' });
    const resultados = el('div', { id: 'resultados-historial' });

    async function consultar() {
      zonaErrores.replaceChildren();
      const params = new URLSearchParams();
      if (usuario.value) params.set('usuarioId', usuario.value);
      if (desde.value) params.set('desde', desde.value);
      if (hasta.value) params.set('hasta', hasta.value);
      if (tipo.value) params.set('tipoElemento', tipo.value);
      try {
        const { entradas, mensaje } = await api('GET', `/api/historial?${params}`);
        resultados.replaceChildren(mensaje ? el('p', { class: 'vacio', id: 'mensaje-historial' }, mensaje) : tabla(entradas));
      } catch (error) {
        resultados.replaceChildren();
        if (error instanceof ErrorApi && error.detalles.length > 0) zonaErrores.append(listaErrores(error.detalles));
        else mostrarAviso(mensajeDeError(error), 'error');
      }
    }

    contenedor.append(
      el(
        'form',
        { class: 'tarjeta', novalidate: true, onsubmit: (e) => { e.preventDefault(); consultar(); } },
        el('label', { for: 'f-usuario' }, 'Usuario'), usuario,
        el('label', { for: 'f-desde' }, 'Desde'), desde,
        el('label', { for: 'f-hasta' }, 'Hasta'), hasta,
        el('label', { for: 'f-tipo' }, 'Tipo de elemento'), tipo,
        zonaErrores,
        el(
          'div',
          { class: 'fila-acciones' },
          el('button', { type: 'submit', class: 'accion' }, 'Filtrar'),
          el('button', { type: 'button', class: 'accion secundario', onclick: () => { usuario.value = ''; desde.value = ''; hasta.value = ''; tipo.value = ''; consultar(); } }, 'Limpiar filtros'),
        ),
      ),
      resultados,
    );
    await consultar();
  },
};

function tabla(entradas) {
  return el(
    'div',
    { class: 'tabla-scroll' },
    el(
      'table',
      { id: 'tabla-historial' },
      el('thead', {}, el('tr', {}, ['Fecha y hora', 'Usuario', 'Acción', 'Elemento', 'ID', 'Detalle'].map((t) => el('th', {}, t)))),
      el(
        'tbody',
        {},
        entradas.map((e) =>
          el(
            'tr',
            {},
            el('td', {}, formatearFechaHora(e.fechaHora)),
            el('td', {}, e.usuarioNombre),
            el('td', {}, e.accion),
            el('td', {}, e.tipoElemento),
            el('td', { class: 'num' }, e.elementoId),
            el('td', {}, e.detalle || '—'),
          ),
        ),
      ),
    ),
  );
}
