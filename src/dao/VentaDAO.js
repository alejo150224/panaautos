'use strict';

const DAOBase = require('./DAOBase');
const Venta = require('../models/Venta');

/** DAO de ventas. Solo lee y escribe; la regla "no vender dos veces" vive en el controlador. */
class VentaDAO extends DAOBase {
  /** @param {import('./almacenamiento/AlmacenamientoMemoria')} almacenamiento */
  constructor(almacenamiento) {
    super(almacenamiento, 'ventas', Venta);
  }

  /**
   * Contrato: ventas registradas para un vehículo.
   * @param {number} vehiculoId
   * @returns {Venta[]}
   */
  porVehiculo(vehiculoId) {
    return this.todos().filter((v) => v.vehiculoId === vehiculoId);
  }
}

module.exports = VentaDAO;
