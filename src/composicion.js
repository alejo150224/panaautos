'use strict';

const UsuarioDAO = require('./dao/UsuarioDAO');
const ClienteDAO = require('./dao/ClienteDAO');
const VehiculoDAO = require('./dao/VehiculoDAO');
const SesionController = require('./controllers/SesionController');
const InventarioController = require('./controllers/InventarioController');
const VentaDAO = require('./dao/VentaDAO');
const VentaController = require('./controllers/VentaController');
const SolicitudDAO = require('./dao/SolicitudDAO');
const CatalogoController = require('./controllers/CatalogoController');
const SolicitudController = require('./controllers/SolicitudController');

/**
 * Raíz de composición: único lugar que conoce todas las capas y las conecta (inyección de
 * dependencias manual). Devuelve por separado:
 *  - `controladores`: lo ÚNICO que reciben las vistas (patrón Facade).
 *  - `dao`: acceso a datos, para pruebas y preparación de datos.
 *
 * @param {{almacenamiento: import('./dao/almacenamiento/AlmacenamientoMemoria'), reloj?: () => Date}} opciones
 * @returns {{almacenamiento: object, reloj: () => Date, dao: object, controladores: object}}
 */
function crearSistema({ almacenamiento, reloj = () => new Date() }) {
  const dao = {
    usuarios: new UsuarioDAO(almacenamiento),
    clientes: new ClienteDAO(almacenamiento),
    vehiculos: new VehiculoDAO(almacenamiento),
    ventas: new VentaDAO(almacenamiento),
    solicitudes: new SolicitudDAO(almacenamiento),
  };

  const controladores = {
    sesion: new SesionController({ usuarioDAO: dao.usuarios }),
    inventario: new InventarioController({ vehiculoDAO: dao.vehiculos }),
    ventas: new VentaController({
      ventaDAO: dao.ventas,
      vehiculoDAO: dao.vehiculos,
      clienteDAO: dao.clientes,
      almacenamiento,
      reloj,
    }),
    catalogo: new CatalogoController({ vehiculoDAO: dao.vehiculos }),
    solicitudes: new SolicitudController({
      solicitudDAO: dao.solicitudes,
      vehiculoDAO: dao.vehiculos,
      almacenamiento,
      reloj,
    }),
  };

  return { almacenamiento, reloj, dao, controladores };
}

module.exports = { crearSistema };
