'use strict';

const DAOBase = require('./DAOBase');
const Cliente = require('../models/Cliente');

/** DAO de clientes registrados (habilitante para HU05). */
class ClienteDAO extends DAOBase {
  /** @param {import('./almacenamiento/AlmacenamientoMemoria')} almacenamiento */
  constructor(almacenamiento) {
    super(almacenamiento, 'clientes', Cliente);
  }
}

module.exports = ClienteDAO;
