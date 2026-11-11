'use strict';

/**
 * Errores de negocio que lanzan los controladores. La vista los traduce a respuestas
 * (400/401/403/404/409) sin conocer las reglas que los originaron.
 */

class ErrorNegocio extends Error {
  /** @param {string} mensaje texto en español apto para mostrar al usuario. */
  constructor(mensaje) {
    super(mensaje);
    this.name = this.constructor.name;
  }
}

/** Datos faltantes o inválidos. `detalles` lista cada campo con su mensaje. */
class ErrorValidacion extends ErrorNegocio {
  /**
   * @param {Array<{campo: string, mensaje: string}>} detalles
   * @param {string} [mensaje]
   */
  constructor(detalles, mensaje = 'Los datos enviados no son válidos') {
    super(mensaje);
    this.detalles = detalles;
  }
}

/** No hay sesión iniciada. */
class ErrorNoAutenticado extends ErrorNegocio {
  constructor(mensaje = 'Debe iniciar sesión para realizar esta operación') {
    super(mensaje);
  }
}

/** La sesión existe pero el rol no permite la operación. */
class ErrorPermiso extends ErrorNegocio {
  constructor(mensaje = 'Su rol no tiene permiso para realizar esta operación') {
    super(mensaje);
  }
}

/** El registro solicitado no existe. */
class ErrorNoEncontrado extends ErrorNegocio {
  constructor(mensaje = 'El registro solicitado no existe') {
    super(mensaje);
  }
}

/** La operación choca con el estado actual (p. ej., vehículo ya vendido). */
class ErrorConflicto extends ErrorNegocio {
  constructor(mensaje = 'La operación no es posible con el estado actual del registro') {
    super(mensaje);
  }
}

module.exports = {
  ErrorNegocio,
  ErrorValidacion,
  ErrorNoAutenticado,
  ErrorPermiso,
  ErrorNoEncontrado,
  ErrorConflicto,
};
