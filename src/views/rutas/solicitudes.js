'use strict';

/**
 * Rutas HTTP del catálogo público y de las solicitudes de interés. Solo traducen HTTP ⇄ controlador.
 * @param {object} controladores
 * @returns {Array<object>}
 */
module.exports = function rutasSolicitudes({ catalogo, solicitudes }) {
  return [
    // HU06 (públicas: no exigen sesión)
    {
      metodo: 'GET',
      ruta: '/api/catalogo',
      manejador: () => ({ estado: 200, cuerpo: catalogo.listarCatalogo() }),
    },
    {
      metodo: 'POST',
      ruta: '/api/solicitudes',
      manejador: ({ cuerpo }) => ({ estado: 201, cuerpo: solicitudes.registrarSolicitud(cuerpo) }),
    },
  ];
};
