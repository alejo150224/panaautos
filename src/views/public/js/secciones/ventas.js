import { api, el, formatearPrecio, listaErrores, mensajeDeError, mostrarAviso, ErrorApi } from '../nucleo.js';

/** Sección HU05: registro de una venta concretada (solo vendedores). */
export const ventas = {
  id: 'ventas',
  titulo: 'Registrar venta',
  permiso: 'ventas:registrar',

  async montar(contenedor, { recargar }) {
    const opciones = await api('GET', '/api/ventas/opciones');
    contenedor.append(
      el('h2', {}, 'Registrar venta'),
      el('p', { class: 'descripcion' }, 'Registra una venta concretada. El vehículo pasa a "Vendido" en la misma operación. No procesa pagos ni créditos.'),
    );

    if (opciones.vehiculos.length === 0) {
      contenedor.append(el('p', { class: 'vacio' }, 'No hay vehículos disponibles para vender.'));
      return;
    }

    const zonaErrores = el('div', { id: 'errores-venta' });
    const precio = el('input', { id: 'precio', type: 'number', min: '1', step: '1', inputmode: 'numeric' });
    const vehiculo = el(
      'select',
      {
        id: 'vehiculoId',
        onchange: () => {
          const elegido = opciones.vehiculos.find((v) => String(v.id) === vehiculo.value);
          precio.value = elegido ? String(elegido.precio) : '';
        },
      },
      el('option', { value: '' }, 'Seleccione un vehículo…'),
      opciones.vehiculos.map((v) =>
        el('option', { value: String(v.id) }, `#${v.id} ${v.marca} ${v.modelo} ${v.anio} — ${formatearPrecio(v.precio)}`),
      ),
    );
    const cliente = el(
      'select',
      { id: 'clienteId' },
      el('option', { value: '' }, 'Seleccione un cliente…'),
      opciones.clientes.map((c) => el('option', { value: String(c.id) }, c.nombre)),
    );
    const fecha = el('input', { id: 'fecha', type: 'date', value: opciones.fechaHoy, max: opciones.fechaHoy });
    const modalidad = el(
      'select',
      { id: 'modalidad' },
      el('option', { value: '' }, 'Seleccione la modalidad…'),
      opciones.modalidades.map((m) => el('option', { value: m }, m)),
    );
    const boton = el('button', { type: 'submit', class: 'accion' }, 'Registrar venta');

    const formulario = el(
      'form',
      {
        class: 'tarjeta',
        novalidate: true,
        onsubmit: async (evento) => {
          evento.preventDefault();
          zonaErrores.replaceChildren();
          boton.disabled = true; // evita doble envío por doble clic
          try {
            const venta = await api('POST', '/api/ventas', {
              vehiculoId: vehiculo.value ? Number(vehiculo.value) : null,
              clienteId: cliente.value ? Number(cliente.value) : null,
              fecha: fecha.value,
              precio: precio.value === '' ? null : Number(precio.value),
              modalidad: modalidad.value,
            });
            mostrarAviso(`Venta #${venta.id} registrada. El vehículo #${venta.vehiculoId} ahora figura como Vendido.`, 'ok');
            await recargar();
          } catch (error) {
            if (error instanceof ErrorApi && error.detalles.length > 0) zonaErrores.append(listaErrores(error.detalles));
            else mostrarAviso(mensajeDeError(error), 'error');
            if (error instanceof ErrorApi && error.estado === 409) await recargar();
          } finally {
            boton.disabled = false;
          }
        },
      },
      el('label', { for: 'vehiculoId' }, 'Vehículo'),
      vehiculo,
      el('label', { for: 'clienteId' }, 'Cliente'),
      cliente,
      el('label', { for: 'fecha' }, 'Fecha de la venta'),
      fecha,
      el('label', { for: 'precio' }, 'Precio de venta (COP)'),
      precio,
      el('label', { for: 'modalidad' }, 'Modalidad de compra'),
      modalidad,
      zonaErrores,
      el('div', { class: 'fila-acciones' }, boton),
    );
    contenedor.append(formulario);
  },
};
