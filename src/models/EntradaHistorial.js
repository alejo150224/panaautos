'use strict';

/**
 * Modelo de datos: entrada del historial de acciones (HU09, RF-22).
 * Cada entrada es evidencia inmutable de una operación completada. Guarda el nombre y el rol del
 * responsable tal como eran en ese momento (no cambian si el usuario se renombra) y nunca
 * contraseñas, tokens ni datos personales de clientes.
 */
class EntradaHistorial {
  /**
   * @param {{id: number, usuarioId: number, usuarioNombre: string, usuarioRol: string, accion: string,
   *          fechaHora: string, tipoElemento: string, elementoId: number, detalle?: string}} datos
   *        `accion`: de ACCIONES_HISTORIAL. `tipoElemento`: de TIPOS_ELEMENTO. `fechaHora`: ISO 8601 UTC.
   */
  constructor({ id, usuarioId, usuarioNombre, usuarioRol, accion, fechaHora, tipoElemento, elementoId, detalle = '' }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.usuarioNombre = usuarioNombre;
    this.usuarioRol = usuarioRol;
    this.accion = accion;
    this.fechaHora = fechaHora;
    this.tipoElemento = tipoElemento;
    this.elementoId = elementoId;
    this.detalle = detalle;
  }
}

module.exports = EntradaHistorial;
