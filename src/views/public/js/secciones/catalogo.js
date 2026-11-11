import { api, el, etiquetaEstado, formatearPrecio, listaErrores, mensajeDeError, mostrarAviso, ErrorApi } from '../nucleo.js';

/** Sección pública HU06: catálogo de vehículos y formulario de solicitud de interés. */
export const catalogo = {
  id: 'catalogo',
  titulo: 'Catálogo público',
  permiso: null,

  async montar(contenedor) {
    const { vehiculos, mensaje } = await api('GET', '/api/catalogo');
    contenedor.append(
      el('h2', {}, 'Vehículos disponibles y próximos a ingresar'),
      el('p', { class: 'descripcion' }, 'Elija un vehículo y envíe su solicitud de interés. No reserva ni compra el vehículo: un asesor lo contactará.'),
    );
    const zonaFormulario = el('div', { id: 'zona-formulario' });
    if (mensaje) {
      contenedor.append(el('p', { class: 'vacio' }, mensaje));
      return;
    }
    contenedor.append(
      el(
        'div',
        { class: 'tabla-scroll' },
        el(
          'table',
          { id: 'tabla-catalogo' },
          el('thead', {}, el('tr', {}, ['Vehículo', 'Año', 'Precio', 'Condición', ''].map((t) => el('th', {}, t)))),
          el(
            'tbody',
            {},
            vehiculos.map((v) =>
              el(
                'tr',
                {},
                el('td', {}, `${v.marca} ${v.modelo}`),
                el('td', {}, v.anio),
                el('td', {}, formatearPrecio(v.precio)),
                el('td', {}, etiquetaEstado(v.estado)),
                el(
                  'td',
                  {},
                  el('button', { type: 'button', class: 'accion secundario', onclick: () => mostrarFormulario(zonaFormulario, v) }, 'Me interesa'),
                ),
              ),
            ),
          ),
        ),
      ),
      zonaFormulario,
    );
  },
};

function mostrarFormulario(zona, vehiculo) {
  const zonaErrores = el('div', { id: 'errores-solicitud' });
  const nombre = el('input', { id: 'nombre', type: 'text', maxlength: '100', autocomplete: 'name' });
  const telefono = el('input', { id: 'telefono', type: 'tel', autocomplete: 'tel' });
  const correo = el('input', { id: 'correo', type: 'email', autocomplete: 'email' });
  const mensaje = el('textarea', { id: 'mensaje', rows: '3', maxlength: '500' });
  const boton = el('button', { type: 'submit', class: 'accion' }, 'Enviar solicitud');

  zona.replaceChildren(
    el(
      'form',
      {
        class: 'tarjeta',
        novalidate: true,
        onsubmit: async (evento) => {
          evento.preventDefault();
          zonaErrores.replaceChildren();
          boton.disabled = true;
          try {
            const r = await api('POST', '/api/solicitudes', {
              vehiculoId: vehiculo.id,
              nombre: nombre.value,
              telefono: telefono.value,
              correo: correo.value,
              mensaje: mensaje.value,
            });
            zona.replaceChildren(el('p', { class: 'tarjeta', id: 'confirmacion-solicitud' }, `${r.mensaje} (Solicitud #${r.id})`));
            mostrarAviso('Solicitud enviada', 'ok');
          } catch (error) {
            if (error instanceof ErrorApi && error.detalles.length > 0) zonaErrores.append(listaErrores(error.detalles));
            else mostrarAviso(mensajeDeError(error), 'error');
            boton.disabled = false;
          }
        },
      },
      el('h3', {}, 'Solicitud de interés'),
      el('p', { id: 'vehiculo-seleccionado' }, `Vehículo: ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio} — condición actual: ${vehiculo.estado}`),
      el('label', { for: 'nombre' }, 'Nombre'),
      nombre,
      el('label', { for: 'telefono' }, 'Teléfono'),
      telefono,
      el('label', { for: 'correo' }, 'Correo electrónico'),
      correo,
      el('p', { class: 'descripcion' }, 'Indique al menos un medio de contacto: teléfono o correo.'),
      el('label', { for: 'mensaje' }, 'Mensaje (opcional)'),
      mensaje,
      zonaErrores,
      el('div', { class: 'fila-acciones' }, boton),
    ),
  );
  nombre.focus();
}
