'use strict';

/**
 * Modelo de datos: propuesta de incorporación de un vehículo (HU02–HU04, RF-23 y RF-11).
 * Una propuesta NO es un vehículo del inventario: aprobarla no lo incorpora ni lo marca disponible.
 */
class Propuesta {
  /**
   * @param {{id: number, marca: string, modelo: string, anio: number, origen: string, precioEstimado: number,
   *          presentadaPor: number, fechaRegistro: string, estado: string, decididaPor?: number|null,
   *          fechaDecision?: string|null}} datos
   *        `origen`: uno de ORIGENES_PROPUESTA. `estado`: uno de ESTADOS_PROPUESTA.
   *        `presentadaPor`: id del usuario que la registró. `decididaPor`/`fechaDecision`: decisión del dueño.
   */
  constructor({ id, marca, modelo, anio, origen, precioEstimado, presentadaPor, fechaRegistro, estado, decididaPor = null, fechaDecision = null }) {
    this.id = id;
    this.marca = marca;
    this.modelo = modelo;
    this.anio = anio;
    this.origen = origen;
    this.precioEstimado = precioEstimado;
    this.presentadaPor = presentadaPor;
    this.fechaRegistro = fechaRegistro;
    this.estado = estado;
    this.decididaPor = decididaPor;
    this.fechaDecision = fechaDecision;
  }
}

module.exports = Propuesta;
