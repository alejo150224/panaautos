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
const PropuestaDAO = require('./dao/PropuestaDAO');
const PropuestaController = require('./controllers/PropuestaController');
const HistorialDAO = require('./dao/HistorialDAO');
const Auditor = require('./controllers/Auditor');

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
    propuestas: new PropuestaDAO(almacenamiento),
    historial: new HistorialDAO(almacenamiento),
  };
  const auditor = new Auditor({ historialDAO: dao.historial, reloj });

  const controladores = {
    sesion: new SesionController({ usuarioDAO: dao.usuarios }),
    inventario: new InventarioController({ vehiculoDAO: dao.vehiculos }),
    ventas: new VentaController({
      ventaDAO: dao.ventas,
      vehiculoDAO: dao.vehiculos,
      clienteDAO: dao.clientes,
      almacenamiento,
      reloj,
      auditor,
    }),
    catalogo: new CatalogoController({ vehiculoDAO: dao.vehiculos }),
    solicitudes: new SolicitudController({
      solicitudDAO: dao.solicitudes,
      vehiculoDAO: dao.vehiculos,
      almacenamiento,
      reloj,
      auditor,
    }),
    propuestas: new PropuestaController({
      propuestaDAO: dao.propuestas,
      usuarioDAO: dao.usuarios,
      almacenamiento,
      reloj,
      auditor,
    }),
  };

  return { almacenamiento, reloj, dao, auditor, controladores };
}

module.exports = { crearSistema };
