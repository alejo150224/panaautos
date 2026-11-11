'use strict';

const { ORIGENES_PROPUESTA, ESTADOS_PROPUESTA, ROLES } = require('../models/enums');
const { exigirPermiso } = require('./permisos');
const { ErrorNoEncontrado, ErrorPermiso, ErrorValidacion, ErrorConflicto } = require('./errores');
const { Errores, texto, aIdentificador, esNumeroPositivo } = require('./validaciones');

const MENSAJE_SIN_PROPUESTAS = 'No hay propuestas registradas';

/**
 * Controlador (fachada) de las propuestas de incorporación.
 * HU02 (Issue #2, RF-23, 3 SP, Should Have): registro y consulta. HU03 y HU04 añaden la decisión del dueño.
 *
 * Una propuesta guardada queda "Pendiente" para revisión del dueño y NO incorpora el vehículo al
 * inventario ni lo marca como disponible.
 */
class PropuestaController {
  /**
   * @param {{propuestaDAO: import('../dao/PropuestaDAO'), usuarioDAO: import('../dao/UsuarioDAO'),
   *          almacenamiento: object, reloj: () => Date}} dependencias
   */
  constructor({ propuestaDAO, usuarioDAO, almacenamiento, reloj }) {
    this.propuestaDAO = propuestaDAO;
    this.usuarioDAO = usuarioDAO;
    this.almacenamiento = almacenamiento;
    this.reloj = reloj;
  }

  /**
   * Contrato (HU02): registra una propuesta de incorporación en estado "Pendiente".
   *
   * @param {import('../models/Usuario')|null} actor empleado (Vendedor o Encargado de Inventario) que la presenta.
   * @param {{marca: string, modelo: string, anio: number, origen: string, precioEstimado: number}} datos
   *        `origen`: "Compra directa" o "Proporcionado por empleado".
   * @returns {object} propuesta guardada con identificador, usuario que la presenta, fecha y estado "Pendiente".
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso}
   * @throws {import('./errores').ErrorValidacion} dato obligatorio faltante o inválido (no se guarda nada).
   */
  registrarPropuesta(actor, datos) {
    exigirPermiso(actor, 'propuestas:registrar');
    const { marca, modelo, anio, origen, precioEstimado } = this._validar(datos);
    const propuesta = this.almacenamiento.transaccion(() =>
      this.propuestaDAO.insertar({
        marca,
        modelo,
        anio,
        origen,
        precioEstimado,
        presentadaPor: actor.id,
        fechaRegistro: this.reloj().toISOString(),
        estado: ESTADOS_PROPUESTA.PENDIENTE,
        decididaPor: null,
        fechaDecision: null,
      }));
    return this._presentar(propuesta);
  }

  /**
   * Contrato: lista propuestas. El Dueño ve todas; un empleado ve solo las que él presentó.
   * @param {import('../models/Usuario')|null} actor
   * @param {{estado?: string}} [filtros] estado a filtrar (p. ej. "Pendiente").
   * @returns {{propuestas: object[], mensaje: string|null}}
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso}
   * @throws {import('./errores').ErrorValidacion} estado de filtro inválido.
   */
  listarPropuestas(actor, filtros = {}) {
    exigirPermiso(actor, 'propuestas:consultar');
    const { estado } = filtros;
    if (estado !== undefined && estado !== '' && !Object.values(ESTADOS_PROPUESTA).includes(estado)) {
      throw new ErrorValidacion([{ campo: 'estado', mensaje: `Estado inválido: ${Object.values(ESTADOS_PROPUESTA).join(', ')}` }]);
    }
    const propuestas = this.propuestaDAO
      .todos()
      .filter((p) => this._puedeVer(actor, p))
      .filter((p) => !estado || p.estado === estado)
      .sort((a, b) => b.id - a.id)
      .map((p) => this._presentar(p));
    return { propuestas, mensaje: propuestas.length === 0 ? MENSAJE_SIN_PROPUESTAS : null };
  }

  /**
   * Contrato: detalle de una propuesta (datos del vehículo, origen, precio, quién la presentó y fecha).
   * @param {import('../models/Usuario')|null} actor Dueño, o el empleado que la presentó.
   * @param {number|string} id
   * @returns {object}
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso}
   * @throws {import('./errores').ErrorValidacion|import('./errores').ErrorNoEncontrado}
   */
  obtenerPropuesta(actor, id) {
    exigirPermiso(actor, 'propuestas:consultar');
    const propuestaId = aIdentificador(id);
    if (propuestaId === null) throw new ErrorValidacion([{ campo: 'id', mensaje: 'Identificador de propuesta inválido' }]);
    const propuesta = this.propuestaDAO.porId(propuestaId);
    if (!propuesta) throw new ErrorNoEncontrado('La propuesta no existe');
    if (!this._puedeVer(actor, propuesta)) throw new ErrorPermiso('Solo puede consultar las propuestas que usted presentó');
    return this._presentar(propuesta);
  }

  /**
   * Contrato (HU03): aprueba una propuesta pendiente. La decisión se conserva y es definitiva.
   * NO incorpora el vehículo al inventario ni lo marca como disponible.
   *
   * @param {import('../models/Usuario')|null} actor solo el rol Dueño.
   * @param {number|string} id identificador de la propuesta.
   * @returns {object} propuesta con estado "Aprobada", quién decidió y cuándo.
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso} si no es el dueño.
   * @throws {import('./errores').ErrorValidacion|import('./errores').ErrorNoEncontrado}
   * @throws {import('./errores').ErrorConflicto} la propuesta ya fue decidida (aprobada o rechazada).
   */
  aprobarPropuesta(actor, id) {
    return this._decidir(actor, id, ESTADOS_PROPUESTA.APROBADA);
  }

  /**
   * Aplica la decisión del dueño sobre una propuesta pendiente dentro de una transacción.
   * Una propuesta decidida no admite una segunda decisión (ni la misma ni la contraria).
   * @param {import('../models/Usuario')|null} actor
   * @param {number|string} id
   * @param {string} estadoDestino "Aprobada" o "Rechazada".
   * @returns {object} propuesta decidida.
   */
  _decidir(actor, id, estadoDestino) {
    exigirPermiso(actor, 'propuestas:decidir');
    const propuestaId = aIdentificador(id);
    if (propuestaId === null) throw new ErrorValidacion([{ campo: 'id', mensaje: 'Identificador de propuesta inválido' }]);

    return this.almacenamiento.transaccion(() => {
      const propuesta = this.propuestaDAO.porId(propuestaId);
      if (!propuesta) throw new ErrorNoEncontrado('La propuesta no existe');
      if (propuesta.estado !== ESTADOS_PROPUESTA.PENDIENTE) {
        const decision = propuesta.estado === ESTADOS_PROPUESTA.APROBADA ? 'aprobada' : 'rechazada';
        throw new ErrorConflicto(`La propuesta ya fue ${decision}: la decisión del dueño no se puede cambiar`);
      }
      propuesta.estado = estadoDestino;
      propuesta.decididaPor = actor.id;
      propuesta.fechaDecision = this.reloj().toISOString();
      this.propuestaDAO.actualizar(propuesta);
      return this._presentar(propuesta);
    });
  }

  /** @returns {boolean} el dueño ve todo; un empleado solo lo propio. */
  _puedeVer(actor, propuesta) {
    return actor.rol === ROLES.DUENO || propuesta.presentadaPor === actor.id;
  }

  /** Forma pública de una propuesta, con el nombre de quien la presentó y de quien decidió. */
  _presentar(p) {
    const nombre = (id) => (id ? this.usuarioDAO.porId(id)?.nombre ?? `Usuario #${id}` : null);
    return {
      id: p.id,
      marca: p.marca,
      modelo: p.modelo,
      anio: p.anio,
      origen: p.origen,
      precioEstimado: p.precioEstimado,
      presentadaPor: p.presentadaPor,
      presentadaPorNombre: nombre(p.presentadaPor),
      fechaRegistro: p.fechaRegistro,
      estado: p.estado,
      decididaPor: p.decididaPor,
      decididaPorNombre: nombre(p.decididaPor),
      fechaDecision: p.fechaDecision,
    };
  }

  /**
   * Valida y normaliza el formulario informando todos los problemas a la vez.
   * @param {unknown} datos
   * @throws {import('./errores').ErrorValidacion}
   */
  _validar(datos) {
    const entrada = datos !== null && typeof datos === 'object' ? datos : {};
    const errores = new Errores();

    const marca = texto(entrada.marca);
    if (!marca) errores.agregar('marca', 'La marca es obligatoria');
    else if (marca.length > 60) errores.agregar('marca', 'La marca no puede superar 60 caracteres');

    const modelo = texto(entrada.modelo);
    if (!modelo) errores.agregar('modelo', 'El modelo es obligatorio');
    else if (modelo.length > 60) errores.agregar('modelo', 'El modelo no puede superar 60 caracteres');

    const anio = entrada.anio;
    const anioMaximo = this.reloj().getUTCFullYear() + 1;
    if (!Number.isInteger(anio) || anio < 1950 || anio > anioMaximo) {
      errores.agregar('anio', `El año es obligatorio y debe estar entre 1950 y ${anioMaximo}`);
    }

    const origen = entrada.origen;
    if (!Object.values(ORIGENES_PROPUESTA).includes(origen)) {
      errores.agregar('origen', `El origen es obligatorio: ${Object.values(ORIGENES_PROPUESTA).join(' o ')}`);
    }

    const precioEstimado = entrada.precioEstimado;
    if (!esNumeroPositivo(precioEstimado)) errores.agregar('precioEstimado', 'El precio estimado es obligatorio y debe ser mayor que cero');

    errores.lanzarSiHay();
    return { marca, modelo, anio, origen, precioEstimado };
  }
}

module.exports = PropuestaController;
module.exports.MENSAJE_SIN_PROPUESTAS = MENSAJE_SIN_PROPUESTAS;
