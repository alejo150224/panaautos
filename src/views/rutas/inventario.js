'use strict';

/**
 * Rutas HTTP de la consulta de inventario (HU01). Solo traducen HTTP ⇄ controlador.
 * @param {object} controladores
 * @returns {Array<object>}
 */
module.exports = function rutasInventario({ inventario }) {
  return [
    {
      metodo: 'GET',
      ruta: '/api/inventario',
      manejador: ({ actor }) => ({ estado: 200, cuerpo: inventario.listarInventario(actor) }),
    },
  ];
};
