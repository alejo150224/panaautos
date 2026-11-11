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
    // HU07 (internas: exigen sesión de vendedor)
    {
      metodo: 'GET',
      ruta: '/api/solicitudes',
      manejador: ({ actor }) => ({ estado: 200, cuerpo: solicitudes.listarSolicitudes(actor) }),
    },
    {
      metodo: 'GET',
      ruta: '/api/solicitudes/:id',
      manejador: ({ actor, params }) => ({ estado: 200, cuerpo: solicitudes.obtenerSolicitud(actor, params.id) }),
    },
    // HU08
    {
      metodo: 'PATCH',
      ruta: '/api/solicitudes/:id/estado',
      manejador: ({ actor, params, cuerpo }) => ({ estado: 200, cuerpo: solicitudes.actualizarEstado(actor, params.id, cuerpo.estado) }),
    },
  ];
};
