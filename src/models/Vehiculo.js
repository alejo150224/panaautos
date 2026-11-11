'use strict';

/**
 * Modelo de datos: vehículo del inventario centralizado (HU01).
 * Campos exigidos por el Issue #1: identificador, marca, modelo, año, precio y estado actual.
 * Solo describe la entidad (SRP); las reglas de negocio viven en los controladores.
 */
class Vehiculo {
  /**
   * @param {{id: number, marca: string, modelo: string, anio: number, precio: number, estado: string}} datos
   *        `precio` en COP; `estado` es uno de ESTADOS_VEHICULO.
   */
  constructor({ id, marca, modelo, anio, precio, estado }) {
    this.id = id;
    this.marca = marca;
    this.modelo = modelo;
    this.anio = anio;
    this.precio = precio;
    this.estado = estado;
  }
}

module.exports = Vehiculo;
