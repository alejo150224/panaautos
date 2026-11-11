'use strict';

/**
 * Rutas HTTP de la consulta del historial (HU10). Son de solo lectura (GET): la API no ofrece
 * ninguna ruta para crear, editar o eliminar entradas. Solo traducen HTTP ⇄ controlador.
 * @param {object} controladores
 * @returns {Array<object>}
 */
module.exports = function rutasHistorial({ historial }) {
  return [
    {
      metodo: 'GET',
      ruta: '/api/historial/opciones',
      manejador: ({ actor }) => ({ estado: 200, cuerpo: historial.obtenerOpcionesDeFiltro(actor) }),
    },
    {
      metodo: 'GET',
      ruta: '/api/historial',
      manejador: ({ actor, query }) => ({
        estado: 200,
        cuerpo: historial.consultarHistorial(actor, {
          usuarioId: query.usuarioId,
          desde: query.desde,
          hasta: query.hasta,
          tipoElemento: query.tipoElemento,
        }),
      }),
    },
  ];
};
