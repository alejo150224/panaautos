'use strict';

const { ErrorValidacion } = require('./errores');

/**
 * Utilidades de validación reutilizables por los controladores. Son funciones puras (sin acceso a
 * datos) para que cada regla se pueda probar de forma aislada.
 */

/** Acumula errores de campo para informarlos todos juntos y lanzar una sola excepción. */
class Errores {
  constructor() {
    this.lista = [];
  }

  /**
   * @param {string} campo
   * @param {string} mensaje
   */
  agregar(campo, mensaje) {
    this.lista.push({ campo, mensaje });
  }

  /** @throws {ErrorValidacion} si se acumuló al menos un error. */
  lanzarSiHay() {
    if (this.lista.length > 0) throw new ErrorValidacion(this.lista);
  }
}

/**
 * @param {unknown} valor
 * @returns {string} el texto sin espacios laterales, o '' si no es texto.
 */
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

/**
 * Convierte un identificador recibido (número o texto numérico) en entero positivo.
 * @param {unknown} valor
 * @returns {number|null} el entero, o null si no es un identificador válido.
 */
function aIdentificador(valor) {
  const n = typeof valor === 'string' && /^\d+$/.test(valor.trim()) ? Number(valor) : valor;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/**
 * @param {unknown} valor
 * @returns {boolean} true si es un número finito mayor que cero (no acepta texto).
 */
function esNumeroPositivo(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0;
}

/**
 * Valida una fecha calendario estricta AAAA-MM-DD (p. ej., 2026-11-10).
 * @param {unknown} valor
 * @returns {boolean}
 */
function esFechaIso(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

module.exports = { Errores, texto, aIdentificador, esNumeroPositivo, esFechaIso };
