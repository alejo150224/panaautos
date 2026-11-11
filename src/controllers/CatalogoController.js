'use strict';

const { ESTADOS_VEHICULO } = require('../models/enums');

/** Estados que se muestran al público: disponibles y próximos a ingresar. */
const ESTADOS_PUBLICOS = Object.freeze([ESTADOS_VEHICULO.DISPONIBLE, ESTADOS_VEHICULO.PROXIMO]);

/**
 * Controlador del catálogo público (trabajo técnico habilitante para HU06: "acceso desde la
 * información pública del vehículo", supuesto de DOCS/04 §3.2). Solo expone lo mínimo necesario
 * para abrir el formulario de interés; no requiere sesión.
 */
class CatalogoController {
  /** @param {{vehiculoDAO: import('../dao/VehiculoDAO')}} dependencias */
  constructor({ vehiculoDAO }) {
    this.vehiculoDAO = vehiculoDAO;
  }

  /**
   * Contrato: vehículos visibles al público (Disponible y Próximo a ingresar). Los vendidos no se muestran.
   * @returns {{vehiculos: Array<{id: number, marca: string, modelo: string, anio: number, precio: number, estado: string}>,
   *            mensaje: string|null}}
   */
  listarCatalogo() {
    const vehiculos = this.vehiculoDAO
      .todos()
      .filter((v) => ESTADOS_PUBLICOS.includes(v.estado))
      .sort((a, b) => a.id - b.id)
      .map(({ id, marca, modelo, anio, precio, estado }) => ({ id, marca, modelo, anio, precio, estado }));
    return { vehiculos, mensaje: vehiculos.length === 0 ? 'No hay vehículos disponibles por ahora' : null };
  }
}

module.exports = CatalogoController;
module.exports.ESTADOS_PUBLICOS = ESTADOS_PUBLICOS;
