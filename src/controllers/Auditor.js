'use strict';

/**
 * Servicio de auditoría automática (HU09, Issue #9, RF-22, 5 SP, Should Have).
 *
 * Lo invocan los controladores DENTRO de la transacción de cada operación relevante: si la
 * operación falla, no queda entrada; si la entrada no se puede guardar, la operación se revierte.
 * No se generan eventos retrospectivos: solo se registra lo que ocurre a partir de ahora.
 */
class Auditor {
  /**
   * @param {{historialDAO: import('../dao/HistorialDAO'), reloj: () => Date}} dependencias
   */
  constructor({ historialDAO, reloj }) {
    this.historialDAO = historialDAO;
    this.reloj = reloj;
  }

  /**
   * Contrato: registra una acción completada.
   * @param {{id: number, nombre: string, rol: string}} actor usuario responsable.
   * @param {string} accion de ACCIONES_HISTORIAL.
   * @param {string} tipoElemento de TIPOS_ELEMENTO.
   * @param {number} elementoId identificador del registro afectado.
   * @param {string} [detalle] texto breve sin datos sensibles (p. ej. "Nueva → En contacto").
   * @returns {Readonly<object>} entrada guardada.
   */
  registrar(actor, accion, tipoElemento, elementoId, detalle = '') {
    return this.historialDAO.agregar({
      usuarioId: actor.id,
      usuarioNombre: actor.nombre,
      usuarioRol: actor.rol,
      accion,
      fechaHora: this.reloj().toISOString(),
      tipoElemento,
      elementoId,
      detalle,
    });
  }
}

module.exports = Auditor;
