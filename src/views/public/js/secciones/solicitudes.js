import { api, el, etiquetaEstado, formatearFechaHora, formatearPrecio, mensajeDeError } from '../nucleo.js';

/** Sección HU07: consulta de solicitudes de clientes (solo vendedores). */
export const solicitudes = {
  id: 'solicitudes',
  titulo: 'Solicitudes',
  permiso: 'solicitudes:consultar',

  async montar(contenedor) {
    const { solicitudes: lista, mensaje } = await api('GET', '/api/solicitudes');
    contenedor.append(
      el('h2', {}, 'Solicitudes de clientes'),
      el('p', { class: 'descripcion' }, 'Interesados por vehículo. Seleccione una solicitud para ver los datos de contacto.'),
    );
    if (mensaje) {
      contenedor.append(el('p', { class: 'vacio', id: 'mensaje-solicitudes' }, mensaje));
      return;
    }
    const zonaDetalle = el('div', { id: 'detalle-solicitud' });
    contenedor.append(
      el(
        'div',
        { class: 'tabla-scroll' },
        el(
          'table',
          { id: 'tabla-solicitudes' },
          el('thead', {}, el('tr', {}, ['ID', 'Cliente', 'Vehículo de interés', 'Fecha', 'Estado', ''].map((t) => el('th', {}, t)))),
          el(
            'tbody',
            {},
            lista.map((s) =>
              el(
                'tr',
                {},
                el('td', {}, s.id),
                el('td', {}, s.nombreCliente),
                el('td', {}, s.vehiculo.descripcion),
                el('td', {}, formatearFechaHora(s.fecha)),
                el('td', {}, etiquetaEstado(s.estado)),
                el('td', {}, el('button', { type: 'button', class: 'accion secundario', onclick: () => mostrarDetalle(zonaDetalle, s.id) }, 'Ver detalle')),
              ),
            ),
          ),
        ),
      ),
      zonaDetalle,
    );
  },
};

async function mostrarDetalle(zona, id) {
  try {
    const s = await api('GET', `/api/solicitudes/${id}`);
    const v = s.vehiculo;
    zona.replaceChildren(
      el(
        'section',
        { class: 'tarjeta' },
        el('h3', {}, `Solicitud #${s.id}`),
        el(
          'dl',
          { class: 'detalle-lista' },
          el('dt', {}, 'Cliente'), el('dd', {}, s.nombreCliente),
          el('dt', {}, 'Teléfono'), el('dd', {}, s.telefono || '—'),
          el('dt', {}, 'Correo'), el('dd', {}, s.correo || '—'),
          el('dt', {}, 'Mensaje'), el('dd', {}, s.mensaje || '—'),
          el('dt', {}, 'Fecha'), el('dd', {}, formatearFechaHora(s.fecha)),
          el('dt', {}, 'Estado'), el('dd', {}, etiquetaEstado(s.estado)),
          el('dt', {}, 'Vehículo'),
          el('dd', {}, v ? `#${v.id} ${v.marca} ${v.modelo} ${v.anio} · ${formatearPrecio(v.precio)} · ${v.estado}` : 'No disponible'),
        ),
      ),
    );
  } catch (error) {
    zona.replaceChildren(el('p', { class: 'vacio' }, mensajeDeError(error)));
  }
}
