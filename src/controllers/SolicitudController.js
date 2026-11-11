'use strict';

const { ESTADOS_SOLICITUD } = require('../models/enums');
const { ErrorNoEncontrado, ErrorConflicto, ErrorValidacion } = require('./errores');
const { Errores, texto, aIdentificador } = require('./validaciones');
const { ESTADOS_PUBLICOS } = require('./CatalogoController');
const { exigirPermiso } = require('./permisos');

/** Mensaje exacto exigido por el criterio 3 del Issue #7. */
const MENSAJE_SIN_SOLICITUDES = 'No hay solicitudes registradas';
const MENSAJE_CONFIRMACION = 'Solicitud registrada. Nos pondremos en contacto con usted.';
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[+()\-\s\d]{7,20}$/;

/**
 * Controlador (fachada) de las solicitudes de interés.
 * HU06 (Issue #6, RF-17, 3 SP, Must Have): registro público. HU07 y HU08 se añaden en sus incrementos.
 *
 * Una solicitud válida NO genera reserva, venta ni cambio de estado del vehículo.
 */
class SolicitudController {
  /**
   * @param {{solicitudDAO: import('../dao/SolicitudDAO'), vehiculoDAO: import('../dao/VehiculoDAO'),
   *          almacenamiento: object, reloj: () => Date}} dependencias
   */
  constructor({ solicitudDAO, vehiculoDAO, almacenamiento, reloj }) {
    this.solicitudDAO = solicitudDAO;
    this.vehiculoDAO = vehiculoDAO;
    this.almacenamiento = almacenamiento;
    this.reloj = reloj;
  }

  /**
   * Contrato (HU06): registra una solicitud de interés enviada por un cliente (sin sesión).
   *
   * @param {{vehiculoId: number, nombre: string, telefono?: string, correo?: string, mensaje?: string}} datos
   *        Se exige `nombre` y al menos un medio de contacto (`telefono` o `correo`).
   * @returns {{id: number, vehiculoId: number, estado: string, vehiculoEstado: string, mensaje: string}}
   *          estado inicial "Nueva" y mensaje de confirmación; `vehiculoEstado` no cambia.
   * @throws {import('./errores').ErrorValidacion} falta nombre o contacto, o formato inválido (no se guarda).
   * @throws {import('./errores').ErrorNoEncontrado} el vehículo no existe.
   * @throws {import('./errores').ErrorConflicto} el vehículo no está disponible ni es próximo a ingresar.
   */
  registrarSolicitud(datos) {
    const { vehiculoId, nombre, telefono, correo, mensaje } = this._validar(datos);

    return this.almacenamiento.transaccion(() => {
      const vehiculo = this.vehiculoDAO.porId(vehiculoId);
      if (!vehiculo) throw new ErrorNoEncontrado('El vehículo seleccionado no existe');
      if (!ESTADOS_PUBLICOS.includes(vehiculo.estado)) {
        throw new ErrorConflicto('Solo se pueden enviar solicitudes sobre vehículos disponibles o próximos a ingresar');
      }
      const solicitud = this.solicitudDAO.insertar({
        vehiculoId,
        nombreCliente: nombre,
        telefono,
        correo,
        mensaje,
        estado: ESTADOS_SOLICITUD.NUEVA,
        fecha: this.reloj().toISOString(),
      });
      return {
        id: solicitud.id,
        vehiculoId,
        estado: solicitud.estado,
        vehiculoEstado: vehiculo.estado,
        mensaje: MENSAJE_CONFIRMACION,
      };
    });
  }

  /**
   * Contrato (HU07): lista las solicitudes registradas, las más recientes primero.
   * @param {import('../models/Usuario')|null} actor debe tener rol Vendedor.
   * @returns {{solicitudes: Array<{id: number, nombreCliente: string, vehiculo: {id: number, descripcion: string},
   *            fecha: string, estado: string}>, mensaje: string|null}}
   *          `mensaje` = "No hay solicitudes registradas" si no existe ninguna.
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso}
   */
  listarSolicitudes(actor) {
    exigirPermiso(actor, 'solicitudes:consultar');
    const solicitudes = this.solicitudDAO
      .todos()
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : b.id - a.id))
      .map((s) => ({
        id: s.id,
        nombreCliente: s.nombreCliente,
        vehiculo: { id: s.vehiculoId, descripcion: this._descripcionVehiculo(s.vehiculoId) },
        fecha: s.fecha,
        estado: s.estado,
      }));
    return { solicitudes, mensaje: solicitudes.length === 0 ? MENSAJE_SIN_SOLICITUDES : null };
  }

  /**
   * Contrato (HU07): detalle de una solicitud con los datos de contacto y el vehículo asociado.
   * @param {import('../models/Usuario')|null} actor debe tener rol Vendedor.
   * @param {number|string} id identificador de la solicitud.
   * @returns {{id: number, nombreCliente: string, telefono: string, correo: string, mensaje: string, estado: string,
   *            fecha: string, vehiculo: {id: number, marca: string, modelo: string, anio: number, precio: number, estado: string}|null}}
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso}
   * @throws {import('./errores').ErrorValidacion} identificador inválido.
   * @throws {import('./errores').ErrorNoEncontrado} la solicitud no existe.
   */
  obtenerSolicitud(actor, id) {
    exigirPermiso(actor, 'solicitudes:consultar');
    const solicitudId = aIdentificador(id);
    if (solicitudId === null) throw new ErrorValidacion([{ campo: 'id', mensaje: 'Identificador de solicitud inválido' }]);
    const s = this.solicitudDAO.porId(solicitudId);
    if (!s) throw new ErrorNoEncontrado('La solicitud no existe');
    const v = this.vehiculoDAO.porId(s.vehiculoId);
    return {
      id: s.id,
      nombreCliente: s.nombreCliente,
      telefono: s.telefono,
      correo: s.correo,
      mensaje: s.mensaje,
      estado: s.estado,
      fecha: s.fecha,
      vehiculo: v ? { id: v.id, marca: v.marca, modelo: v.modelo, anio: v.anio, precio: v.precio, estado: v.estado } : null,
    };
  }

  /** @returns {string} "Marca Modelo Año" del vehículo, o un texto de reserva si no existe. */
  _descripcionVehiculo(vehiculoId) {
    const v = this.vehiculoDAO.porId(vehiculoId);
    return v ? `${v.marca} ${v.modelo} ${v.anio}` : 'Vehículo no disponible';
  }

  /**
   * Valida y normaliza el formulario público informando todos los problemas a la vez.
   * @param {unknown} datos
   * @returns {{vehiculoId: number, nombre: string, telefono: string, correo: string, mensaje: string}}
   * @throws {import('./errores').ErrorValidacion}
   */
  _validar(datos) {
    const entrada = datos !== null && typeof datos === 'object' ? datos : {};
    const errores = new Errores();

    const vehiculoId = aIdentificador(entrada.vehiculoId);
    if (vehiculoId === null) errores.agregar('vehiculoId', 'Debe seleccionar un vehículo');

    const nombre = texto(entrada.nombre);
    if (!nombre) errores.agregar('nombre', 'Debe completar su nombre');
    else if (nombre.length > 100) errores.agregar('nombre', 'El nombre no puede superar 100 caracteres');

    const telefono = texto(entrada.telefono);
    const correo = texto(entrada.correo);
    if (!telefono && !correo) {
      errores.agregar('contacto', 'Debe completar al menos un medio de contacto: teléfono o correo');
    }
    if (telefono && (!REGEX_TELEFONO.test(telefono) || telefono.replace(/\D/g, '').length < 7 || telefono.replace(/\D/g, '').length > 15)) {
      errores.agregar('telefono', 'El teléfono no es válido (7 a 15 dígitos)');
    }
    if (correo && (!REGEX_CORREO.test(correo) || correo.length > 120)) {
      errores.agregar('correo', 'El correo electrónico no es válido');
    }

    const mensaje = texto(entrada.mensaje);
    if (mensaje.length > 500) errores.agregar('mensaje', 'El mensaje no puede superar 500 caracteres');

    errores.lanzarSiHay();
    return { vehiculoId, nombre, telefono, correo, mensaje };
  }
}

module.exports = SolicitudController;
module.exports.MENSAJE_CONFIRMACION = MENSAJE_CONFIRMACION;
module.exports.MENSAJE_SIN_SOLICITUDES = MENSAJE_SIN_SOLICITUDES;
