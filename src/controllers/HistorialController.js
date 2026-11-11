'use strict';

const { TIPOS_ELEMENTO } = require('../models/enums');
const { exigirPermiso } = require('./permisos');
const { Errores, aIdentificador, esFechaIso } = require('./validaciones');
const { DESFASE_NEGOCIO_MS } = require('./tiempo');

const MENSAJE_HISTORIAL_VACIO = 'No hay acciones registradas';
const MENSAJE_SIN_COINCIDENCIAS = 'No hay acciones que coincidan con los filtros seleccionados';
const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Controlador (fachada) de la consulta del historial — HU10 (Issue #10, RF-24, 3 SP, Should Have).
 * Solo lectura: la captura del historial es de HU09 (Auditor) y no se puede editar desde aquí.
 */
class HistorialController {
  /**
   * @param {{historialDAO: import('../dao/HistorialDAO'), usuarioDAO: import('../dao/UsuarioDAO')}} dependencias
   */
  constructor({ historialDAO, usuarioDAO }) {
    this.historialDAO = historialDAO;
    this.usuarioDAO = usuarioDAO;
  }

  /**
   * Contrato: opciones para armar los filtros de la pantalla.
   * @param {import('../models/Usuario')|null} actor Dueño o Administrador.
   * @returns {{usuarios: Array<{id: number, nombre: string}>, tiposElemento: string[]}}
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso}
   */
  obtenerOpcionesDeFiltro(actor) {
    exigirPermiso(actor, 'historial:consultar');
    return {
      usuarios: this.usuarioDAO.todos().sort((a, b) => a.id - b.id).map(({ id, nombre }) => ({ id, nombre })),
      tiposElemento: Object.values(TIPOS_ELEMENTO),
    };
  }

  /**
   * Contrato (HU10): consulta el historial de acciones, de la más reciente a la más antigua.
   * Los filtros son opcionales y se combinan con "Y": un resultado cumple TODOS los filtros dados.
   * Las fechas son días calendario en la zona del negocio (Colombia, UTC-5), ambos extremos incluidos.
   *
   * @param {import('../models/Usuario')|null} actor solo Dueño o Administrador.
   * @param {{usuarioId?: number|string, desde?: string, hasta?: string, tipoElemento?: string}} [filtros]
   *        `desde`/`hasta` en formato AAAA-MM-DD; un valor vacío equivale a "sin filtro".
   * @returns {{entradas: Array<{id: number, usuarioId: number, usuarioNombre: string, usuarioRol: string, accion: string,
   *            fechaHora: string, tipoElemento: string, elementoId: number, detalle: string}>, mensaje: string|null}}
   *          `mensaje` informa cuando no hay registros o ninguno coincide con los filtros.
   * @throws {import('./errores').ErrorNoAutenticado|import('./errores').ErrorPermiso} sin permiso.
   * @throws {import('./errores').ErrorValidacion} filtro con formato inválido o rango de fechas invertido.
   */
  consultarHistorial(actor, filtros = {}) {
    exigirPermiso(actor, 'historial:consultar');
    const f = this._normalizarFiltros(filtros);

    const todas = this.historialDAO.todos();
    const entradas = todas
      .filter((e) => f.usuarioId === null || e.usuarioId === f.usuarioId)
      .filter((e) => f.tipoElemento === null || e.tipoElemento === f.tipoElemento)
      .filter((e) => {
        const instante = Date.parse(e.fechaHora);
        return (f.inicio === null || instante >= f.inicio) && (f.fin === null || instante <= f.fin);
      })
      .sort((a, b) => (a.fechaHora < b.fechaHora ? 1 : a.fechaHora > b.fechaHora ? -1 : b.id - a.id))
      .map((e) => ({ ...e }));

    let mensaje = null;
    if (entradas.length === 0) mensaje = todas.length === 0 ? MENSAJE_HISTORIAL_VACIO : MENSAJE_SIN_COINCIDENCIAS;
    return { entradas, mensaje };
  }

  /**
   * Valida los filtros y calcula el intervalo de tiempo en milisegundos UTC.
   * @param {object} filtros
   * @returns {{usuarioId: number|null, tipoElemento: string|null, inicio: number|null, fin: number|null}}
   * @throws {import('./errores').ErrorValidacion}
   */
  _normalizarFiltros(filtros) {
    const entrada = filtros !== null && typeof filtros === 'object' ? filtros : {};
    const vacio = (v) => v === undefined || v === null || v === '';
    const errores = new Errores();

    let usuarioId = null;
    if (!vacio(entrada.usuarioId)) {
      usuarioId = aIdentificador(entrada.usuarioId);
      if (usuarioId === null) errores.agregar('usuarioId', 'El usuario del filtro no es válido');
    }

    let tipoElemento = null;
    if (!vacio(entrada.tipoElemento)) {
      if (Object.values(TIPOS_ELEMENTO).includes(entrada.tipoElemento)) tipoElemento = entrada.tipoElemento;
      else errores.agregar('tipoElemento', `El tipo de elemento debe ser: ${Object.values(TIPOS_ELEMENTO).join(', ')}`);
    }

    let inicio = null;
    let fin = null;
    let desdeValida = true;
    let hastaValida = true;
    if (!vacio(entrada.desde)) {
      if (esFechaIso(entrada.desde)) inicio = Date.parse(`${entrada.desde}T00:00:00Z`) - DESFASE_NEGOCIO_MS;
      else {
        desdeValida = false;
        errores.agregar('desde', 'La fecha "desde" debe tener el formato AAAA-MM-DD');
      }
    }
    if (!vacio(entrada.hasta)) {
      if (esFechaIso(entrada.hasta)) fin = Date.parse(`${entrada.hasta}T00:00:00Z`) + DIA_MS - 1 - DESFASE_NEGOCIO_MS;
      else {
        hastaValida = false;
        errores.agregar('hasta', 'La fecha "hasta" debe tener el formato AAAA-MM-DD');
      }
    }
    if (desdeValida && hastaValida && inicio !== null && fin !== null && inicio > fin) {
      errores.agregar('rango', 'La fecha "desde" no puede ser posterior a la fecha "hasta"');
    }

    errores.lanzarSiHay();
    return { usuarioId, tipoElemento, inicio, fin };
  }
}

module.exports = HistorialController;
module.exports.MENSAJE_HISTORIAL_VACIO = MENSAJE_HISTORIAL_VACIO;
module.exports.MENSAJE_SIN_COINCIDENCIAS = MENSAJE_SIN_COINCIDENCIAS;
