'use strict';

const DAOBase = require('./DAOBase');
const Vehiculo = require('../models/Vehiculo');

/** DAO de vehículos del inventario centralizado. */
class VehiculoDAO extends DAOBase {
  /** @param {import('./almacenamiento/AlmacenamientoMemoria')} almacenamiento */
  constructor(almacenamiento) {
    super(almacenamiento, 'vehiculos', Vehiculo);
  }

  /**
   * Contrato: cambia el estado de un vehículo y lo conserva.
   * @param {number} id
   * @param {string} estado uno de ESTADOS_VEHICULO.
   * @returns {Vehiculo} vehículo actualizado.
   * @throws {Error} si el vehículo no existe.
   */
  cambiarEstado(id, estado) {
    const vehiculo = this.porId(id);
    if (!vehiculo) throw new Error(`No existe vehiculos con id ${id}`);
    vehiculo.estado = estado;
    return this.actualizar(vehiculo);
  }
}

module.exports = VehiculoDAO;
