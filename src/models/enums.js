'use strict';

/**
 * Catálogos cerrados del dominio PANA AUTOS.
 * Los textos coinciden literalmente con los criterios de aceptación de los Issues #1–#10.
 * Este archivo solo declara valores: no contiene reglas de negocio (SRP).
 */

/** Roles internos del sistema (habilitante: acceso por roles). */
const ROLES = Object.freeze({
  VENDEDOR: 'vendedor',
  ENCARGADO_INVENTARIO: 'encargado_inventario',
  DUENO: 'dueno',
  ADMINISTRADOR: 'administrador',
});

/** Nombre legible de cada rol para la interfaz. */
const NOMBRES_ROL = Object.freeze({
  [ROLES.VENDEDOR]: 'Vendedor',
  [ROLES.ENCARGADO_INVENTARIO]: 'Encargado de Inventario',
  [ROLES.DUENO]: 'Dueño',
  [ROLES.ADMINISTRADOR]: 'Administrador',
});

/** Estados de un vehículo (HU01, HU05, HU06). */
const ESTADOS_VEHICULO = Object.freeze({
  DISPONIBLE: 'Disponible',
  PROXIMO: 'Próximo a ingresar',
  VENDIDO: 'Vendido',
});

module.exports = { ROLES, NOMBRES_ROL, ESTADOS_VEHICULO };
