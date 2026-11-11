'use strict';

/**
 * Modelo de datos: usuario interno del sistema (trabajo técnico habilitante: acceso por roles).
 * Solo describe la entidad (SRP). Deliberadamente NO guarda contraseñas ni tokens:
 * el prototipo usa usuarios ficticios y una sesión de demostración (ver DOCS/11).
 */
class Usuario {
  /**
   * @param {{id: number, nombre: string, rol: string, activo?: boolean}} datos
   */
  constructor({ id, nombre, rol, activo = true }) {
    this.id = id;
    this.nombre = nombre;
    this.rol = rol; // uno de ROLES
    this.activo = activo;
  }
}

module.exports = Usuario;
