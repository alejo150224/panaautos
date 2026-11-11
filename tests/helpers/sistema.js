'use strict';

const { crearSistema } = require('../../src/composicion');
const AlmacenamientoMemoria = require('../../src/dao/almacenamiento/AlmacenamientoMemoria');
const { crearDatosFicticios } = require('../../src/dao/datosFicticios');
const { ROLES } = require('../../src/models/enums');

/** Reloj controlable para pruebas deterministas. */
function crearRelojFijo(isoInicial = '2026-11-10T15:00:00.000Z') {
  let ahora = new Date(isoInicial);
  const reloj = () => new Date(ahora);
  reloj.avanzar = (milisegundos) => {
    ahora = new Date(ahora.getTime() + milisegundos);
  };
  reloj.fijar = (iso) => {
    ahora = new Date(iso);
  };
  return reloj;
}

/**
 * Crea un sistema completo con almacenamiento aislado (memoria) y datos ficticios.
 * Nunca toca archivos ni bases reales.
 * @param {{conInventario?: boolean, almacenamiento?: object, reloj?: Function}} [opciones]
 */
function crearSistemaDePrueba({ conInventario = true, almacenamiento, reloj } = {}) {
  const alm = almacenamiento ?? new AlmacenamientoMemoria(crearDatosFicticios({ conInventario }));
  return crearSistema({ almacenamiento: alm, reloj: reloj ?? crearRelojFijo() });
}

/** Devuelve el primer usuario ficticio con el rol indicado. */
function actorConRol(sistema, rol) {
  const usuario = sistema.dao.usuarios.todos().find((u) => u.rol === rol);
  if (!usuario) throw new Error(`No hay usuario ficticio con rol ${rol}`);
  return usuario;
}

module.exports = { crearRelojFijo, crearSistemaDePrueba, actorConRol, ROLES };
