'use strict';

/**
 * Modelo de datos: venta concretada (HU05, RF-14).
 * Registra la operación comercial; NO modela pagos, cuotas ni créditos (fuera de alcance del Issue #5).
 */
class Venta {
  /**
   * @param {{id: number, vehiculoId: number, clienteId: number, vendedorId: number, fecha: string,
   *          precio: number, modalidad: string, registradaEn: string}} datos
   *        `fecha`: día de la venta (AAAA-MM-DD). `precio`: COP. `modalidad`: uno de MODALIDADES_VENTA.
   *        `registradaEn`: instante de registro en el sistema (ISO 8601, UTC).
   */
  constructor({ id, vehiculoId, clienteId, vendedorId, fecha, precio, modalidad, registradaEn }) {
    this.id = id;
    this.vehiculoId = vehiculoId;
    this.clienteId = clienteId;
    this.vendedorId = vendedorId;
    this.fecha = fecha;
    this.precio = precio;
    this.modalidad = modalidad;
    this.registradaEn = registradaEn;
  }
}

module.exports = Venta;
