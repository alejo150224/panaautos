'use strict';

/**
 * Rutas HTTP del registro de ventas (HU05). Solo traducen HTTP ⇄ controlador.
 * @param {object} controladores
 * @returns {Array<object>}
 */
module.exports = function rutasVentas({ ventas }) {
  return [
    {
      metodo: 'GET',
      ruta: '/api/ventas/opciones',
      manejador: ({ actor }) => ({ estado: 200, cuerpo: ventas.obtenerOpcionesDeVenta(actor) }),
    },
    {
      metodo: 'POST',
      ruta: '/api/ventas',
      manejador: ({ actor, cuerpo }) => ({ estado: 201, cuerpo: ventas.registrarVenta(actor, cuerpo) }),
    },
  ];
};
