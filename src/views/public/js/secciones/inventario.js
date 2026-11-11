import { api, el, etiquetaEstado, formatearPrecio } from '../nucleo.js';

/** Sección HU01: consulta del inventario centralizado (solo personal autorizado). */
export const inventario = {
  id: 'inventario',
  titulo: 'Inventario',
  permiso: 'inventario:consultar',

  async montar(contenedor) {
    const { vehiculos, mensaje } = await api('GET', '/api/inventario');
    contenedor.append(
      el('h2', {}, 'Inventario centralizado'),
      el('p', { class: 'descripcion' }, 'Vehículos registrados y su estado actual. Cada consulta muestra el último estado guardado.'),
    );
    if (mensaje) {
      contenedor.append(el('p', { class: 'vacio', id: 'mensaje-inventario' }, mensaje));
      return;
    }
    contenedor.append(
      el(
        'div',
        { class: 'tabla-scroll' },
        el(
          'table',
          { id: 'tabla-inventario' },
          el(
            'thead',
            {},
            el(
              'tr',
              {},
              el('th', {}, 'ID'),
              el('th', {}, 'Marca'),
              el('th', {}, 'Modelo'),
              el('th', { class: 'num' }, 'Año'),
              el('th', { class: 'num' }, 'Precio'),
              el('th', {}, 'Estado'),
            ),
          ),
          el(
            'tbody',
            {},
            vehiculos.map((v) =>
              el(
                'tr',
                {},
                el('td', {}, v.id),
                el('td', {}, v.marca),
                el('td', {}, v.modelo),
                el('td', { class: 'num' }, v.anio),
                el('td', { class: 'num' }, formatearPrecio(v.precio)),
                el('td', {}, etiquetaEstado(v.estado)),
              ),
            ),
          ),
        ),
      ),
    );
  },
};
