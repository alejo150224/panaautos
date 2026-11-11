'use strict';

/**
 * Rutas HTTP de las propuestas de incorporación (HU02; HU03 y HU04 añaden la decisión).
 * Solo traducen HTTP ⇄ controlador.
 * @param {object} controladores
 * @returns {Array<object>}
 */
module.exports = function rutasPropuestas({ propuestas }) {
  return [
    {
      metodo: 'POST',
      ruta: '/api/propuestas',
      manejador: ({ actor, cuerpo }) => ({ estado: 201, cuerpo: propuestas.registrarPropuesta(actor, cuerpo) }),
    },
    {
      metodo: 'GET',
      ruta: '/api/propuestas',
      manejador: ({ actor, query }) => ({ estado: 200, cuerpo: propuestas.listarPropuestas(actor, { estado: query.estado }) }),
    },
    {
      metodo: 'GET',
      ruta: '/api/propuestas/:id',
      manejador: ({ actor, params }) => ({ estado: 200, cuerpo: propuestas.obtenerPropuesta(actor, params.id) }),
    },
    // HU03
    {
      metodo: 'POST',
      ruta: '/api/propuestas/:id/aprobar',
      manejador: ({ actor, params }) => ({ estado: 200, cuerpo: propuestas.aprobarPropuesta(actor, params.id) }),
    },
    // HU04
    {
      metodo: 'POST',
      ruta: '/api/propuestas/:id/rechazar',
      manejador: ({ actor, params }) => ({ estado: 200, cuerpo: propuestas.rechazarPropuesta(actor, params.id) }),
    },
  ];
};
