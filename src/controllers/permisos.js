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

  // HU05 (Issue #5): "Como empleado/vendedor". El Issue exige "vendedor" como dato de la venta,
  // por lo que solo el rol Vendedor registra ventas (el vendedor es el usuario con sesión).
  'ventas:registrar': [ROLES.VENDEDOR],

  // HU07 (Issue #7): "El vendedor autorizado puede consultar". El Dueño y el Administrador
  // consultan reportes e historial, no gestionan solicitudes (DOCS/01 §2).
  'solicitudes:consultar': [ROLES.VENDEDOR],

  // HU08 (Issue #8): "usuario sin permiso de gestión" no puede modificar el estado.
  'solicitudes:gestionar': [ROLES.VENDEDOR],

  // HU02 (Issue #2): "Como empleado/vendedor". Se autoriza a los empleados que presentan
  // propuestas (Vendedor y Encargado de Inventario); Dueño y Administrador no las presentan.
  'propuestas:registrar': [ROLES.VENDEDOR, ROLES.ENCARGADO_INVENTARIO],
  // Consulta: el Dueño revisa todas; el empleado solo las que presentó (regla en el controlador).
  'propuestas:consultar': [ROLES.DUENO, ROLES.VENDEDOR, ROLES.ENCARGADO_INVENTARIO],

  // HU03 y HU04 (Issues #3 y #4): "La aprobación solo puede ser realizada por el rol Dueño".
  'propuestas:decidir': [ROLES.DUENO],
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
