'use strict';

/**
 * Agrupa las rutas HTTP de cada historia. Cada módulo de `rutas/` solo traduce HTTP ⇄ controlador:
 * lee parámetros, llama a UN método del controlador y devuelve la respuesta. No contiene reglas de
 * negocio ni accede a los DAO.
 *
 * Formato de ruta: { metodo, ruta, manejador({ actor, params, query, cuerpo }) => { estado, cuerpo } }
 *
 * @param {object} controladores fachadas de la lógica de negocio (ver composicion.js).
 * @returns {Array<object>} lista de rutas.
 */
function crearRutas(controladores) {
  return [
    require('./inventario'), // HU01
    require('./ventas'), // HU05
    require('./solicitudes'), // HU06 (+ HU07, HU08)
    // Las rutas de cada historia se registran aquí al integrarla.
  ].flatMap((fabrica) => fabrica(controladores));
}

module.exports = { crearRutas };
