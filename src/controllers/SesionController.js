'use strict';

const { NOMBRES_ROL } = require('../models/enums');
const { ErrorValidacion, ErrorNoEncontrado } = require('./errores');
const { aIdentificador } = require('./validaciones');
const { permisosDe } = require('./permisos');

/**
 * Controlador de acceso (trabajo técnico habilitante). Resuelve quién es el actor de cada
 * operación a partir de usuarios ficticios. NO es autenticación real: no hay contraseñas.
 * Para producción habría que reemplazarlo por credenciales con hash y sesiones firmadas (DOCS/11).
 */
class SesionController {
  /**
   * @param {{usuarioDAO: import('../dao/UsuarioDAO')}} dependencias
   */
  constructor({ usuarioDAO }) {
    this.usuarioDAO = usuarioDAO;
  }

  /**
   * Contrato: usuarios ficticios entre los que se puede elegir para la demostración.
   * @returns {Array<{id: number, nombre: string, rol: string, rolNombre: string}>}
   */
  listarUsuariosDemo() {
    return this.usuarioDAO
      .todos()
      .filter((u) => u.activo)
      .map((u) => ({ id: u.id, nombre: u.nombre, rol: u.rol, rolNombre: NOMBRES_ROL[u.rol] }));
  }

  /**
   * Contrato: valida un usuario para abrir sesión.
   * @param {unknown} usuarioId
   * @returns {import('../models/Usuario')} el usuario activo.
   * @throws {ErrorValidacion} si el identificador no es válido.
   * @throws {ErrorNoEncontrado} si el usuario no existe o está inactivo.
   */
  iniciarSesion(usuarioId) {
    const id = aIdentificador(usuarioId);
    if (id === null) {
      throw new ErrorValidacion([{ campo: 'usuarioId', mensaje: 'Seleccione un usuario válido' }]);
    }
    const usuario = this.usuarioDAO.porId(id);
    if (!usuario || !usuario.activo) throw new ErrorNoEncontrado('El usuario no existe o está inactivo');
    return usuario;
  }

  /**
   * Contrato: recupera el usuario de una sesión ya abierta.
   * @param {number} usuarioId
   * @returns {import('../models/Usuario')|null} null si ya no existe o está inactivo.
   */
  obtenerUsuario(usuarioId) {
    const usuario = this.usuarioDAO.porId(usuarioId);
    return usuario && usuario.activo ? usuario : null;
  }

  /**
   * Contrato: describe la sesión actual para la interfaz.
   * @param {import('../models/Usuario')|null} actor
   * @returns {{usuario: object|null, permisos: string[]}}
   */
  describirSesion(actor) {
    if (!actor) return { usuario: null, permisos: [] };
    return {
      usuario: { id: actor.id, nombre: actor.nombre, rol: actor.rol, rolNombre: NOMBRES_ROL[actor.rol] },
      permisos: permisosDe(actor),
    };
  }
}

module.exports = SesionController;
