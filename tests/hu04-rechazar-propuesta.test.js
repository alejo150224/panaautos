'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { crearSistemaDePrueba, actorConRol, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const { ErrorNoAutenticado, ErrorPermiso, ErrorNoEncontrado, ErrorConflicto, ErrorValidacion } = require('../src/controllers/errores');

/**
 * HU04 — Rechazar propuesta de incorporación (Issue #4, RF-11, 2 SP, Should Have).
 * CA1: el dueño consulta una propuesta pendiente y puede rechazarla; los demás roles no.
 * CA2: al confirmar, el estado pasa a "Rechazada" y la decisión se conserva al volver a consultar.
 * CA3: la rechazada conserva su información, deja de aparecer entre las pendientes y no incorpora el vehículo.
 */

const datos = { marca: 'Kia', modelo: 'Rio', anio: 2019, origen: 'Proporcionado por empleado', precioEstimado: 41000000 };
function conPropuestas(cantidad = 1) {
  const s = crearSistemaDePrueba();
  for (let i = 0; i < cantidad; i += 1) s.controladores.propuestas.registrarPropuesta(actorConRol(s, ROLES.VENDEDOR), datos);
  return s;
}
const dueno = (s) => actorConRol(s, ROLES.DUENO);

describe('HU04 · CA1 — solo el dueño puede rechazar', () => {
  test('el dueño ve la propuesta pendiente y puede rechazarla', () => {
    const s = conPropuestas();
    assert.equal(s.controladores.propuestas.obtenerPropuesta(dueno(s), 1).estado, 'Pendiente');
    assert.equal(s.controladores.propuestas.rechazarPropuesta(dueno(s), 1).estado, 'Rechazada');
  });

  test('anónimos y los demás roles no pueden rechazar y la propuesta sigue pendiente', () => {
    const s = conPropuestas();
    assert.throws(() => s.controladores.propuestas.rechazarPropuesta(null, 1), ErrorNoAutenticado);
    for (const rol of [ROLES.VENDEDOR, ROLES.ENCARGADO_INVENTARIO, ROLES.ADMINISTRADOR]) {
      assert.throws(() => s.controladores.propuestas.rechazarPropuesta(actorConRol(s, rol), 1), ErrorPermiso, rol);
    }
    assert.equal(s.dao.propuestas.porId(1).estado, 'Pendiente');
  });
});

describe('HU04 · CA2 — el rechazo se confirma y se conserva', () => {
  test('estado "Rechazada" con responsable y fecha de decisión', () => {
    const s = conPropuestas();
    s.reloj.avanzar(1000);
    const r = s.controladores.propuestas.rechazarPropuesta(dueno(s), 1);
    assert.deepEqual([r.estado, r.decididaPor, r.fechaDecision], ['Rechazada', dueno(s).id, '2026-11-10T15:00:01.000Z']);
  });

  test('al volver a consultarla sigue "Rechazada"', () => {
    const s = conPropuestas();
    s.controladores.propuestas.rechazarPropuesta(dueno(s), 1);
    assert.equal(s.controladores.propuestas.obtenerPropuesta(dueno(s), 1).estado, 'Rechazada');
    assert.equal(s.dao.propuestas.porId(1).estado, 'Rechazada');
  });

  test('una propuesta rechazada no admite una segunda decisión (ni aprobarla ni rechazarla de nuevo)', () => {
    const s = conPropuestas();
    s.controladores.propuestas.rechazarPropuesta(dueno(s), 1);
    assert.throws(() => s.controladores.propuestas.aprobarPropuesta(dueno(s), 1), (e) => e instanceof ErrorConflicto && /ya fue rechazada/.test(e.message));
    assert.throws(() => s.controladores.propuestas.rechazarPropuesta(dueno(s), 1), ErrorConflicto);
    assert.equal(s.dao.propuestas.porId(1).estado, 'Rechazada');
  });

  test('una propuesta aprobada no se puede rechazar después', () => {
    const s = conPropuestas();
    s.controladores.propuestas.aprobarPropuesta(dueno(s), 1);
    assert.throws(() => s.controladores.propuestas.rechazarPropuesta(dueno(s), 1), (e) => e instanceof ErrorConflicto && /ya fue aprobada/.test(e.message));
    assert.equal(s.dao.propuestas.porId(1).estado, 'Aprobada');
  });

  test('id inexistente → no encontrado; inválido → validación', () => {
    const s = conPropuestas();
    assert.throws(() => s.controladores.propuestas.rechazarPropuesta(dueno(s), 50), ErrorNoEncontrado);
    assert.throws(() => s.controladores.propuestas.rechazarPropuesta(dueno(s), '1; DROP'), ErrorValidacion);
  });
});

describe('HU04 · CA3 — se conserva para consulta, sale de pendientes y no toca el inventario', () => {
  test('conserva todos sus datos originales', () => {
    const s = conPropuestas();
    const antes = s.controladores.propuestas.obtenerPropuesta(dueno(s), 1);
    const despues = s.controladores.propuestas.rechazarPropuesta(dueno(s), 1);
    for (const campo of ['marca', 'modelo', 'anio', 'origen', 'precioEstimado', 'presentadaPor', 'presentadaPorNombre', 'fechaRegistro']) {
      assert.equal(despues[campo], antes[campo], campo);
    }
  });

  test('deja de aparecer entre las pendientes pero sigue en la consulta general y entre las rechazadas', () => {
    const s = conPropuestas(2);
    s.controladores.propuestas.rechazarPropuesta(dueno(s), 1);
    const ids = (estado) => s.controladores.propuestas.listarPropuestas(dueno(s), estado ? { estado } : {}).propuestas.map((p) => p.id);
    assert.deepEqual(ids('Pendiente'), [2]);
    assert.deepEqual(ids('Rechazada'), [1]);
    assert.deepEqual(ids().sort(), [1, 2]);
  });

  test('el empleado que la presentó puede seguir consultándola', () => {
    const s = conPropuestas();
    s.controladores.propuestas.rechazarPropuesta(dueno(s), 1);
    assert.equal(s.controladores.propuestas.obtenerPropuesta(actorConRol(s, ROLES.VENDEDOR), 1).estado, 'Rechazada');
  });

  test('NO incorpora el vehículo al inventario', () => {
    const s = conPropuestas();
    const antes = s.dao.vehiculos.todos();
    s.controladores.propuestas.rechazarPropuesta(dueno(s), 1);
    assert.deepEqual(s.dao.vehiculos.todos(), antes);
    assert.equal(s.controladores.inventario.listarInventario(actorConRol(s, ROLES.VENDEDOR)).vehiculos.some((v) => v.modelo === 'Rio'), false);
  });
});

describe('HU04 · capa de vistas (HTTP): POST /api/propuestas/:id/rechazar', () => {
  let s;
  let servidor;
  before(async () => {
    s = conPropuestas(2);
    servidor = await iniciarServidor(s.controladores);
  });
  after(() => servidor.cerrar());

  test('sin sesión 401 y vendedor 403', async () => {
    assert.equal((await servidor.crearCliente().post('/api/propuestas/1/rechazar')).estado, 401);
    const v = servidor.crearCliente();
    await v.iniciarSesion(1);
    assert.equal((await v.post('/api/propuestas/1/rechazar')).estado, 403);
    assert.equal(s.dao.propuestas.porId(1).estado, 'Pendiente');
  });

  test('el dueño rechaza (200); repetir la decisión o aprobar después da 409', async () => {
    const d = servidor.crearCliente();
    await d.iniciarSesion(dueno(s).id);
    assert.equal((await d.post('/api/propuestas/1/rechazar')).json.estado, 'Rechazada');
    assert.equal((await d.post('/api/propuestas/1/rechazar')).estado, 409);
    assert.equal((await d.post('/api/propuestas/1/aprobar')).estado, 409);
  });

  test('decisiones contradictorias simultáneas: gana una sola y la otra recibe 409', async () => {
    const clientes = await Promise.all([0, 1].map(async () => {
      const c = servidor.crearCliente();
      await c.iniciarSesion(dueno(s).id);
      return c;
    }));
    const [a, b] = await Promise.all([clientes[0].post('/api/propuestas/2/aprobar'), clientes[1].post('/api/propuestas/2/rechazar')]);
    assert.deepEqual([a.estado, b.estado].sort(), [200, 409]);
    assert.ok(['Aprobada', 'Rechazada'].includes(s.dao.propuestas.porId(2).estado));
  });
});
