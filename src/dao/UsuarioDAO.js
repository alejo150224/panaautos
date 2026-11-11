'use strict';

const DAOBase = require('./DAOBase');
const Usuario = require('../models/Usuario');

/** DAO de usuarios internos (habilitante: acceso por roles). */
class UsuarioDAO extends DAOBase {
  /** @param {import('./almacenamiento/AlmacenamientoMemoria')} almacenamiento */
  constructor(almacenamiento) {
    super(almacenamiento, 'usuarios', Usuario);
  }
}

module.exports = UsuarioDAO;
