'use strict';

/**
 * Error técnico de la capa de acceso a datos (fallo al guardar, archivo corrupto, uso incorrecto
 * de una transacción). No es un error de negocio: la vista lo traduce a un error interno genérico.
 */
class ErrorAlmacenamiento extends Error {
  /**
   * @param {string} mensaje
   * @param {{cause?: unknown}} [opciones]
   */
  constructor(mensaje, opciones) {
    super(mensaje, opciones);
    this.name = 'ErrorAlmacenamiento';
  }
}

module.exports = ErrorAlmacenamiento;
