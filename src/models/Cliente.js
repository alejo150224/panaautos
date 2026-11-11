'use strict';

/**
 * Modelo de datos: cliente registrado (trabajo técnico habilitante: registros de clientes
 * disponibles, supuesto declarado en DOCS/03 §2.3). Lo usa la venta (HU05).
 * Datos ficticios únicamente.
 */
class Cliente {
  /**
   * @param {{id: number, nombre: string, telefono?: string, correo?: string}} datos
   */
  constructor({ id, nombre, telefono = '', correo = '' }) {
    this.id = id;
    this.nombre = nombre;
    this.telefono = telefono;
    this.correo = correo;
  }
}

module.exports = Cliente;
