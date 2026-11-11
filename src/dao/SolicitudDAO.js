'use strict';

const DAOBase = require('./DAOBase');
const Solicitud = require('../models/Solicitud');

/** DAO de solicitudes de interés. Solo acceso a datos. */
class SolicitudDAO extends DAOBase {
  /** @param {import('./almacenamiento/AlmacenamientoMemoria')} almacenamiento */
  constructor(almacenamiento) {
    super(almacenamiento, 'solicitudes', Solicitud);
  }
}

module.exports = SolicitudDAO;
