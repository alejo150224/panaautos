'use strict';

const { ROLES } = require('../models/enums');
const { ErrorNoAutenticado, ErrorPermiso } = require('./errores');

/** Roles que son personal interno de PANA AUTOS. */
const PERSONAL_INTERNO = Object.freeze([
  ROLES.VENDEDOR,
  ROLES.ENCARGADO_INVENTARIO,
  ROLES.DUENO,
  ROLES.ADMINISTRADOR,
]);

/**
 * Regla de negocio de acceso por roles (trabajo técnico habilitante).
 * Cada permiso lista los roles autorizados. Las vistas nunca deciden quién puede qué: solo
 * preguntan al controlador y muestran el resultado.
 *
 * Decisiones propuestas (pendientes de validación del equipo) en DOCS/11.
 * Los permisos de cada historia se declaran junto con su incremento.
 */
const PERMISOS = Object.freeze({
  // HU01 (Issue #1): "El empleado/vendedor autorizado puede consultar un listado". RF-09 habla de
  // "empleados": se autoriza a todo el personal interno; el cliente/anónimo queda excluido.
  'inventario:consultar': PERSONAL_INTERNO,
});

/**
 * Contrato: comprueba que el actor tenga sesión y un rol autorizado.
 * @param {{rol: string}|null|undefined} actor usuario con sesión, o null si es anónimo.
 * @param {string} permiso clave de PERMISOS.
 * @param {Record<string, readonly string[]>} [tabla] tabla de permisos (inyectable en pruebas).
 * @throws {ErrorNoAutenticado} si no hay actor.
 * @throws {ErrorPermiso} si el rol no está autorizado.
 */
function exigirPermiso(actor, permiso, tabla = PERMISOS) {
  if (!actor) throw new ErrorNoAutenticado();
  const roles = tabla[permiso];
  if (!roles || !roles.includes(actor.rol)) throw new ErrorPermiso();
}

/**
 * Contrato: lista los permisos que concede el rol del actor (la interfaz los usa para mostrar u
 * ocultar secciones; la autorización real se vuelve a comprobar en cada operación).
 * @param {{rol: string}|null|undefined} actor
 * @param {Record<string, readonly string[]>} [tabla]
 * @returns {string[]}
 */
function permisosDe(actor, tabla = PERMISOS) {
  if (!actor) return [];
  return Object.keys(tabla).filter((permiso) => tabla[permiso].includes(actor.rol));
}

module.exports = { PERMISOS, PERSONAL_INTERNO, exigirPermiso, permisosDe };
