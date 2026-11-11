'use strict';

const DAOBase = require('./DAOBase');
const Propuesta = require('../models/Propuesta');

/** DAO de propuestas de incorporación. Solo acceso a datos. */
class PropuestaDAO extends DAOBase {
  /** @param {import('./almacenamiento/AlmacenamientoMemoria')} almacenamiento */
  constructor(almacenamiento) {
    super(almacenamiento, 'propuestas', Propuesta);
  }
}

module.exports = PropuestaDAO;
