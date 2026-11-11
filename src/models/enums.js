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

/** Modalidades de compra de una venta (HU05). Texto idéntico al criterio 2 del Issue #5. */
const MODALIDADES_VENTA = Object.freeze({
  CONTADO: 'Contado',
  CREDITO_EXTERNO: 'Crédito externo',
  INTERCAMBIO: 'Intercambio de vehículo/bienes',
});

/** Estados de atención de una solicitud de interés (HU06, HU08). Texto idéntico al Issue #8. */
const ESTADOS_SOLICITUD = Object.freeze({
  NUEVA: 'Nueva',
  EN_CONTACTO: 'En contacto',
  EN_NEGOCIACION: 'En negociación',
  ATENDIDA: 'Atendida',
  CERRADA: 'Cerrada',
});

/** Orígenes válidos de una propuesta de incorporación (HU02). Texto idéntico al Issue #2. */
const ORIGENES_PROPUESTA = Object.freeze({
  COMPRA_DIRECTA: 'Compra directa',
  EMPLEADO: 'Proporcionado por empleado',
});

/** Estados de una propuesta (HU02–HU04). */
const ESTADOS_PROPUESTA = Object.freeze({
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
});

module.exports = {
  ROLES, NOMBRES_ROL, ESTADOS_VEHICULO, MODALIDADES_VENTA, ESTADOS_SOLICITUD, ORIGENES_PROPUESTA, ESTADOS_PROPUESTA,
};
