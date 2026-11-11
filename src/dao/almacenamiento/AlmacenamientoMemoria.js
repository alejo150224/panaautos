'use strict';

const ErrorAlmacenamiento = require('./ErrorAlmacenamiento');

/**
 * Adaptador de almacenamiento en memoria (equivalente al `zonasBD` de la guía, pero con
 * transacciones). Se usa en las pruebas y con `npm run start:memoria`.
 *
 * QUÉ SE PIERDE AL REINICIAR: todo. Los datos viven solo en el proceso.
 *
 * Garantía de atomicidad: `transaccion(fn)` trabaja sobre una copia (borrador) de todos los datos
 * y la confirma de una sola vez. Como `fn` es síncrona y Node ejecuta un solo hilo, ninguna otra
 * operación de ESTE proceso puede intercalarse. No hay garantía entre procesos distintos.
 */
class AlmacenamientoMemoria {
  /**
   * @param {object} [datosIniciales] colecciones y `secuencias` iniciales (se copian).
   */
  constructor(datosIniciales = {}) {
    this._datos = structuredClone({ secuencias: {}, ...datosIniciales });
    this._borrador = null;
  }

  /** @returns {object} datos visibles ahora: el borrador si hay transacción, si no los confirmados. */
  _fuente() {
    return this._borrador ?? this._datos;
  }

  /**
   * Contrato: devuelve el arreglo vivo de una colección. Las escrituras deben hacerse dentro de
   * `transaccion` (los DAO lo garantizan).
   * @param {string} nombre
   * @returns {Array<object>}
   */
  coleccion(nombre) {
    const fuente = this._fuente();
    if (!Array.isArray(fuente[nombre])) fuente[nombre] = [];
    return fuente[nombre];
  }

  /**
   * Contrato: genera el siguiente identificador de la colección. Los identificadores no se reutilizan.
   * @param {string} nombre
   * @returns {number}
   * @throws {ErrorAlmacenamiento} si se llama fuera de una transacción.
   */
  siguienteId(nombre) {
    if (!this._borrador) {
      throw new ErrorAlmacenamiento('siguienteId debe llamarse dentro de una transacción');
    }
    const secuencias = this._borrador.secuencias;
    secuencias[nombre] = (secuencias[nombre] ?? 0) + 1;
    return secuencias[nombre];
  }

  /**
   * Contrato: ejecuta `fn` de forma atómica. Si `fn` lanza una excepción o la persistencia falla,
   * no queda ningún cambio parcial. Si ya hay una transacción activa, `fn` se une a ella.
   * @template T
   * @param {() => T} fn función SÍNCRONA que usa los DAO.
   * @returns {T} el resultado de `fn`.
   * @throws {ErrorAlmacenamiento} si `fn` es asíncrona o falla el guardado.
   */
  transaccion(fn) {
    if (this._borrador) return fn();

    const borrador = structuredClone(this._datos);
    this._borrador = borrador;
    try {
      const resultado = fn();
      if (resultado instanceof Promise) {
        throw new ErrorAlmacenamiento('Las transacciones deben ser síncronas');
      }
      this._persistir(borrador); // si lanza, no se confirma nada
      this._datos = borrador;
      return resultado;
    } finally {
      this._borrador = null;
    }
  }

  /**
   * Gancho de persistencia. En memoria no hace nada; los adaptadores durables lo sobrescriben.
   * @param {object} _datos estado completo que se va a confirmar.
   */
  _persistir(_datos) {}
}

module.exports = AlmacenamientoMemoria;
