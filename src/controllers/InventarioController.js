'use strict';

const { exigirPermiso } = require('./permisos');

/** Mensaje exacto exigido por el criterio 3 del Issue #1. */
const MENSAJE_INVENTARIO_VACIO = 'No hay vehículos registrados';

/**
 * Controlador (fachada) de la consulta de inventario — HU01 (Issue #1, RF-09, 2 SP, Must Have).
 * Contiene la regla de acceso y la forma de la respuesta; no sabe dónde se guardan los datos.
 */
class InventarioController {
  /**
   * @param {{vehiculoDAO: import('../dao/VehiculoDAO')}} dependencias
   */
  constructor({ vehiculoDAO }) {
    this.vehiculoDAO = vehiculoDAO;
  }

  /**
   * Contrato (HU01): lista el inventario centralizado con el estado guardado más reciente.
   * Cada consulta lee del almacenamiento (no hay caché), por lo que un cambio de estado se
   * refleja en la consulta siguiente.
   *
   * @param {import('../models/Usuario')|null} actor usuario con sesión; null si es anónimo.
   * @returns {{vehiculos: Array<{id: number, marca: string, modelo: string, anio: number, precio: number, estado: string}>, mensaje: string|null}}
   *          `mensaje` es "No hay vehículos registrados" cuando el inventario está vacío; si no, null.
   * @throws {import('./errores').ErrorNoAutenticado} sin sesión.
   * @throws {import('./errores').ErrorPermiso} si el rol no pertenece al personal autorizado.
   */
  listarInventario(actor) {
    exigirPermiso(actor, 'inventario:consultar');
    const vehiculos = this.vehiculoDAO
      .todos()
      .sort((a, b) => a.id - b.id)
      .map(({ id, marca, modelo, anio, precio, estado }) => ({ id, marca, modelo, anio, precio, estado }));
    return { vehiculos, mensaje: vehiculos.length === 0 ? MENSAJE_INVENTARIO_VACIO : null };
  }
}

module.exports = InventarioController;
module.exports.MENSAJE_INVENTARIO_VACIO = MENSAJE_INVENTARIO_VACIO;
