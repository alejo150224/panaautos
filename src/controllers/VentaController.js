'use strict';

const { ESTADOS_VEHICULO, MODALIDADES_VENTA } = require('../models/enums');
const { exigirPermiso } = require('./permisos');
const { ErrorNoEncontrado, ErrorConflicto } = require('./errores');
const { Errores, aIdentificador, esNumeroPositivo, esFechaIso } = require('./validaciones');
const { fechaNegocio } = require('./tiempo');

/**
 * Controlador (fachada) del registro de ventas — HU05 (Issue #5, RF-14, 8 SP, Must Have).
 *
 * Regla central: la venta y el cambio del vehículo a "Vendido" se confirman JUNTOS en una sola
 * transacción del almacenamiento. Como la transacción es síncrona y Node tiene un único hilo,
 * dos intentos sobre el mismo vehículo se ejecutan uno después del otro y el segundo ve "Vendido".
 * LÍMITE: la garantía vale dentro de un mismo proceso. Con varios procesos sobre el mismo archivo
 * JSON haría falta un motor de base de datos con bloqueos (ver DOCS/11).
 *
 * Fuera de alcance (Issue #5): no procesa pagos, no aprueba créditos y no incorpora al inventario
 * los bienes recibidos por intercambio.
 */
class VentaController {
  /**
   * @param {{ventaDAO: import('../dao/VentaDAO'), vehiculoDAO: import('../dao/VehiculoDAO'),
   *          clienteDAO: import('../dao/ClienteDAO'),
   *          almacenamiento: import('../dao/almacenamiento/AlmacenamientoMemoria'),
   *          reloj: () => Date}} dependencias
   */
  constructor({ ventaDAO, vehiculoDAO, clienteDAO, almacenamiento, reloj }) {
    this.ventaDAO = ventaDAO;
    this.vehiculoDAO = vehiculoDAO;
    this.clienteDAO = clienteDAO;
    this.almacenamiento = almacenamiento;
    this.reloj = reloj;
  }

  /**
   * Contrato: datos para armar el formulario de venta (solo vehículos disponibles, clientes
   * registrados, modalidades y la fecha de hoy en la zona del negocio).
   * @param {import('../models/Usuario')|null} actor
   * @returns {{vehiculos: Array<{id: number, marca: string, modelo: string, anio: number, precio: number}>,
   *            clientes: Array<{id: number, nombre: string}>, modalidades: string[], fechaHoy: string}}
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso}
   */
  obtenerOpcionesDeVenta(actor) {
    exigirPermiso(actor, 'ventas:registrar');
    return {
      vehiculos: this.vehiculoDAO
        .todos()
        .filter((v) => v.estado === ESTADOS_VEHICULO.DISPONIBLE)
        .sort((a, b) => a.id - b.id)
        .map(({ id, marca, modelo, anio, precio }) => ({ id, marca, modelo, anio, precio })),
      clientes: this.clienteDAO.todos().sort((a, b) => a.id - b.id).map(({ id, nombre }) => ({ id, nombre })),
      modalidades: Object.values(MODALIDADES_VENTA),
      fechaHoy: fechaNegocio(this.reloj()),
    };
  }

  /**
   * Contrato (HU05): registra una venta concretada y marca el vehículo como "Vendido" en una
   * única operación. El vendedor es el actor con sesión.
   *
   * @param {import('../models/Usuario')|null} actor debe tener rol Vendedor.
   * @param {{vehiculoId: number, clienteId: number, fecha: string, precio: number, modalidad: string}} datos
   *        `fecha` AAAA-MM-DD (no futura); `precio` número COP > 0; `modalidad` de MODALIDADES_VENTA.
   * @returns {{id: number, vehiculoId: number, clienteId: number, vendedorId: number, fecha: string,
   *            precio: number, modalidad: string, registradaEn: string, vehiculoEstado: string}}
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso} sin permiso.
   * @throws {import('./errores').ErrorValidacion} dato obligatorio faltante o inválido (no se guarda nada).
   * @throws {import('./errores').ErrorNoEncontrado} vehículo o cliente inexistente.
   * @throws {import('./errores').ErrorConflicto} el vehículo ya está vendido o no está disponible.
   */
  registrarVenta(actor, datos) {
    exigirPermiso(actor, 'ventas:registrar');
    const { vehiculoId, clienteId, fecha, precio, modalidad } = this._validar(datos);

    return this.almacenamiento.transaccion(() => {
      const vehiculo = this.vehiculoDAO.porId(vehiculoId);
      if (!vehiculo) throw new ErrorNoEncontrado('El vehículo seleccionado no existe');
      if (!this.clienteDAO.porId(clienteId)) throw new ErrorNoEncontrado('El cliente seleccionado no existe');

      if (vehiculo.estado === ESTADOS_VEHICULO.VENDIDO) {
        throw new ErrorConflicto('El vehículo ya figura como vendido: no se registra otra venta');
      }
      if (vehiculo.estado !== ESTADOS_VEHICULO.DISPONIBLE) {
        throw new ErrorConflicto(`Solo se pueden vender vehículos disponibles; este vehículo está "${vehiculo.estado}"`);
      }

      const venta = this.ventaDAO.insertar({
        vehiculoId,
        clienteId,
        vendedorId: actor.id,
        fecha,
        precio,
        modalidad,
        registradaEn: this.reloj().toISOString(),
      });
      this.vehiculoDAO.cambiarEstado(vehiculoId, ESTADOS_VEHICULO.VENDIDO);
      return { ...venta, vehiculoEstado: ESTADOS_VEHICULO.VENDIDO };
    });
  }

  /**
   * Valida y normaliza los datos de entrada, informando TODOS los problemas a la vez.
   * @param {unknown} datos
   * @returns {{vehiculoId: number, clienteId: number, fecha: string, precio: number, modalidad: string}}
   * @throws {import('./errores').ErrorValidacion}
   */
  _validar(datos) {
    const entrada = datos !== null && typeof datos === 'object' ? datos : {};
    const errores = new Errores();

    const vehiculoId = aIdentificador(entrada.vehiculoId);
    if (vehiculoId === null) errores.agregar('vehiculoId', 'Debe seleccionar el vehículo');

    const clienteId = aIdentificador(entrada.clienteId);
    if (clienteId === null) errores.agregar('clienteId', 'Debe seleccionar el cliente');

    const { fecha } = entrada;
    if (!esFechaIso(fecha)) {
      errores.agregar('fecha', 'La fecha de la venta es obligatoria (formato AAAA-MM-DD)');
    } else if (fecha > fechaNegocio(this.reloj())) {
      errores.agregar('fecha', 'La fecha de la venta no puede ser futura');
    }

    const { precio } = entrada;
    if (!esNumeroPositivo(precio)) errores.agregar('precio', 'El precio de venta debe ser un número mayor que cero');

    const { modalidad } = entrada;
    if (!Object.values(MODALIDADES_VENTA).includes(modalidad)) {
      errores.agregar('modalidad', `Seleccione la modalidad de compra: ${Object.values(MODALIDADES_VENTA).join(', ')}`);
    }

    errores.lanzarSiHay();
    return { vehiculoId, clienteId, fecha, precio, modalidad };
  }
}

module.exports = VentaController;
