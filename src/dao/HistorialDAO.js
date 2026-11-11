'use strict';

const EntradaHistorial = require('../models/EntradaHistorial');

/**
 * DAO del historial de acciones (HU09). Es de SOLO AGREGAR: a propósito no extiende DAOBase y no
 * ofrece actualizar ni eliminar. Las entradas se devuelven congeladas, de modo que ninguna función
 * normal de la aplicación pueda editarlas ni borrarlas.
 *
 * LÍMITE: quien tenga acceso directo al archivo JSON puede alterarlo; no hay firma ni cadena de
 * hashes (inmutabilidad lógica, no criptográfica; ver DOCS/11).
 */
class HistorialDAO {
  /** @param {import('./almacenamiento/AlmacenamientoMemoria')} almacenamiento */
  constructor(almacenamiento) {
    this.almacenamiento = almacenamiento;
    this.coleccion = 'historial';
  }

  /**
   * Contrato: agrega una entrada nueva con identificador creciente.
   * @param {object} datos campos de la entrada, sin `id`.
   * @returns {Readonly<EntradaHistorial>} entrada guardada (congelada).
   */
  agregar(datos) {
    return this.almacenamiento.transaccion(() => {
      const fila = { ...datos, id: this.almacenamiento.siguienteId(this.coleccion) };
      this.almacenamiento.coleccion(this.coleccion).push(fila);
      return Object.freeze(new EntradaHistorial(fila));
    });
  }

  /**
   * Contrato: todas las entradas, de la más antigua a la más reciente.
   * @returns {ReadonlyArray<Readonly<EntradaHistorial>>}
   */
  todos() {
    return this.almacenamiento
      .coleccion(this.coleccion)
      .map((fila) => Object.freeze(new EntradaHistorial(fila)));
  }

  /**
   * Contrato: una entrada por su identificador.
   * @param {number} id
   * @returns {Readonly<EntradaHistorial>|null}
   */
  porId(id) {
    const fila = this.almacenamiento.coleccion(this.coleccion).find((f) => f.id === id);
    return fila ? Object.freeze(new EntradaHistorial(fila)) : null;
  }
}

module.exports = HistorialDAO;
