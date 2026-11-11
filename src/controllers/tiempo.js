'use strict';

/**
 * Zona horaria del negocio: Colombia (America/Bogota), UTC-5 fija y sin horario de verano.
 * Las marcas de tiempo se guardan en UTC (ISO 8601); las fechas de negocio (día de una venta,
 * filtros por fecha del historial) se interpretan en esta zona.
 */
const DESFASE_NEGOCIO_MS = -5 * 60 * 60 * 1000;

/**
 * Contrato: día calendario (AAAA-MM-DD) en la zona del negocio para un instante dado.
 * @param {Date} fecha
 * @returns {string}
 */
function fechaNegocio(fecha) {
  return new Date(fecha.getTime() + DESFASE_NEGOCIO_MS).toISOString().slice(0, 10);
}

module.exports = { fechaNegocio, DESFASE_NEGOCIO_MS };
