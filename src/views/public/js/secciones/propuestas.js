import { api, el, etiquetaEstado, formatearFechaHora, formatearPrecio, listaErrores, mensajeDeError, mostrarAviso, ErrorApi } from '../nucleo.js';

// Orígenes que ofrece el formulario (el servidor valida de nuevo: Issue #2).
const ORIGENES = ['Compra directa', 'Proporcionado por empleado'];

/** Sección HU02: registro y consulta de propuestas de incorporación (HU03/HU04 añaden la decisión). */
export const propuestas = {
  id: 'propuestas',
  titulo: 'Propuestas',
  permiso: 'propuestas:consultar',

  async montar(contenedor, { sesion, recargar }) {
    contenedor.append(
      el('h2', {}, 'Propuestas de incorporación'),
      el('p', { class: 'descripcion' }, 'Una propuesta no incorpora el vehículo al inventario: queda pendiente de revisión del dueño.'),
    );
    if (sesion.permisos.includes('propuestas:registrar')) contenedor.append(formularioRegistro(recargar));

    const { propuestas: lista, mensaje } = await api('GET', '/api/propuestas');
    if (mensaje) {
      contenedor.append(el('p', { class: 'vacio', id: 'mensaje-propuestas' }, mensaje));
      return;
    }
    const zonaDetalle = el('div', { id: 'detalle-propuesta' });
    contenedor.append(
      el(
        'div',
        { class: 'tabla-scroll' },
        el(
          'table',
          { id: 'tabla-propuestas' },
          el('thead', {}, el('tr', {}, ['ID', 'Vehículo', 'Origen', 'Precio estimado', 'Estado', ''].map((t) => el('th', {}, t)))),
          el(
            'tbody',
            {},
            lista.map((p) =>
              el(
                'tr',
                {},
                el('td', {}, p.id),
                el('td', {}, `${p.marca} ${p.modelo} ${p.anio}`),
                el('td', {}, p.origen),
                el('td', { class: 'num' }, formatearPrecio(p.precioEstimado)),
                el('td', {}, etiquetaEstado(p.estado)),
                el('td', {}, el('button', { type: 'button', class: 'accion secundario', onclick: () => mostrarDetalle(zonaDetalle, p.id, sesion, recargar) }, 'Revisar')),
              ),
            ),
          ),
        ),
      ),
      zonaDetalle,
    );
  },
};

function formularioRegistro(recargar) {
  const zonaErrores = el('div', { id: 'errores-propuesta' });
  const marca = el('input', { id: 'p-marca', type: 'text', maxlength: '60' });
  const modelo = el('input', { id: 'p-modelo', type: 'text', maxlength: '60' });
  const anio = el('input', { id: 'p-anio', type: 'number', min: '1950', step: '1' });
  const origen = el('select', { id: 'p-origen' }, el('option', { value: '' }, 'Seleccione el origen…'), ORIGENES.map((o) => el('option', { value: o }, o)));
  const precio = el('input', { id: 'p-precio', type: 'number', min: '1', step: '1' });
  const boton = el('button', { type: 'submit', class: 'accion' }, 'Registrar propuesta');
  return el(
    'form',
    {
      class: 'tarjeta',
      novalidate: true,
      onsubmit: async (evento) => {
        evento.preventDefault();
        zonaErrores.replaceChildren();
        boton.disabled = true;
        try {
          const p = await api('POST', '/api/propuestas', {
            marca: marca.value,
            modelo: modelo.value,
            anio: anio.value === '' ? null : Number(anio.value),
            origen: origen.value,
            precioEstimado: precio.value === '' ? null : Number(precio.value),
          });
          mostrarAviso(`Propuesta #${p.id} registrada como ${p.estado}`, 'ok');
          await recargar();
        } catch (error) {
          if (error instanceof ErrorApi && error.detalles.length > 0) zonaErrores.append(listaErrores(error.detalles));
          else mostrarAviso(mensajeDeError(error), 'error');
          boton.disabled = false;
        }
      },
    },
    el('h3', {}, 'Nueva propuesta'),
    el('label', { for: 'p-marca' }, 'Marca'), marca,
    el('label', { for: 'p-modelo' }, 'Modelo'), modelo,
    el('label', { for: 'p-anio' }, 'Año'), anio,
    el('label', { for: 'p-origen' }, 'Origen'), origen,
    el('label', { for: 'p-precio' }, 'Precio estimado (COP)'), precio,
    zonaErrores,
    el('div', { class: 'fila-acciones' }, boton),
  );
}

async function mostrarDetalle(zona, id, sesion, recargar) {
  try {
    const p = await api('GET', `/api/propuestas/${id}`);
    zona.replaceChildren(
      el(
        'section',
        { class: 'tarjeta' },
        el('h3', {}, `Propuesta #${p.id}`),
        el(
          'dl',
          { class: 'detalle-lista' },
          el('dt', {}, 'Vehículo'), el('dd', {}, `${p.marca} ${p.modelo} ${p.anio}`),
          el('dt', {}, 'Origen'), el('dd', {}, p.origen),
          el('dt', {}, 'Precio estimado'), el('dd', {}, formatearPrecio(p.precioEstimado)),
          el('dt', {}, 'Presentada por'), el('dd', {}, p.presentadaPorNombre),
          el('dt', {}, 'Fecha de registro'), el('dd', {}, formatearFechaHora(p.fechaRegistro)),
          el('dt', {}, 'Estado'), el('dd', {}, etiquetaEstado(p.estado)),
          p.decididaPorNombre ? [el('dt', {}, 'Decisión de'), el('dd', {}, `${p.decididaPorNombre} · ${formatearFechaHora(p.fechaDecision)}`)] : [],
        ),
        zonaDecision(p, sesion, recargar),
      ),
    );
  } catch (error) {
    zona.replaceChildren(el('p', { class: 'vacio' }, mensajeDeError(error)));
  }
}

/** Botones de decisión del dueño: solo para propuestas pendientes (HU03 aprueba; HU04 rechaza). */
function zonaDecision(p, sesion, recargar) {
  const zona = el('div', { class: 'fila-acciones', id: 'zona-decision' });
  if (p.estado !== 'Pendiente' || !sesion.permisos.includes('propuestas:decidir')) return zona;
  const aprobar = el(
    'button',
    {
      type: 'button',
      class: 'accion',
      id: 'btn-aprobar',
      onclick: async () => {
        aprobar.disabled = true;
        try {
          const r = await api('POST', `/api/propuestas/${p.id}/aprobar`);
          mostrarAviso(`Propuesta #${r.id} aprobada. No se incorporó ningún vehículo al inventario.`, 'ok');
          await recargar();
        } catch (error) {
          mostrarAviso(mensajeDeError(error), 'error');
          aprobar.disabled = false;
        }
      },
    },
    'Aprobar',
  );
  const rechazar = el('button', { type: 'button', class: 'accion peligro', id: 'btn-rechazar', onclick: () => pedirConfirmacion() }, 'Rechazar');

  // Confirmación en la propia página (HU04: "Al confirmar el rechazo"); no usa diálogos del navegador.
  function pedirConfirmacion() {
    const confirmar = el(
      'button',
      {
        type: 'button',
        class: 'accion peligro',
        id: 'btn-confirmar-rechazo',
        onclick: async () => {
          confirmar.disabled = true;
          try {
            const r = await api('POST', `/api/propuestas/${p.id}/rechazar`);
            mostrarAviso(`Propuesta #${r.id} rechazada. Se conserva para consulta.`, 'ok');
            await recargar();
          } catch (error) {
            mostrarAviso(mensajeDeError(error), 'error');
            confirmar.disabled = false;
          }
        },
      },
      'Sí, confirmar rechazo',
    );
    const cancelar = el('button', { type: 'button', class: 'accion secundario', onclick: () => zona.replaceChildren(aprobar, rechazar) }, 'Cancelar');
    zona.replaceChildren(el('span', {}, '¿Confirma el rechazo de esta propuesta?'), confirmar, cancelar);
  }

  zona.append(aprobar, rechazar);
  return zona;
}
