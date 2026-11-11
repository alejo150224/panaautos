'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { crearSistemaDePrueba, actorConRol, crearRelojFijo, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const { ErrorNoAutenticado, ErrorPermiso, ErrorNoEncontrado, ErrorConflicto, ErrorValidacion } = require('../src/controllers/errores');
const { crearSistema } = require('../src/composicion');
const AlmacenamientoJson = require('../src/dao/almacenamiento/AlmacenamientoJson');
const { crearDatosFicticios } = require('../src/dao/datosFicticios');

/**
 * HU03 — Aprobar propuesta de incorporación (Issue #3, RF-11, 2 SP, Should Have).
 * CA1: el dueño abre una propuesta pendiente y consulta vehículo, origen, precio, quién la presentó y fecha.
 * CA2: al aprobar, el estado pasa a "Aprobada" y la decisión se conserva al volver a consultarla.
 * CA3: solo el Dueño aprueba, y la aprobación no incorpora el vehículo al inventario ni lo marca disponible.
 */

const datos = { marca: 'Mazda', modelo: '3 Touring', anio: 2020, origen: 'Compra directa', precioEstimado: 70000000 };
function conPropuesta() {
  const s = crearSistemaDePrueba();
  s.controladores.propuestas.registrarPropuesta(actorConRol(s, ROLES.VENDEDOR), datos);
  return s;
}
const dueno = (s) => actorConRol(s, ROLES.DUENO);

describe('HU03 · CA1 — el dueño revisa los datos de la propuesta pendiente', () => {
  test('consulta vehículo, origen, precio, quién la presentó y la fecha de registro', () => {
    const s = conPropuesta();
    const p = s.controladores.propuestas.obtenerPropuesta(dueno(s), 1);
    assert.equal(p.estado, 'Pendiente');
    assert.deepEqual(
      [p.marca, p.modelo, p.anio, p.origen, p.precioEstimado, p.presentadaPorNombre, p.fechaRegistro],
      ['Mazda', '3 Touring', 2020, 'Compra directa', 70000000, 'Laura Gómez (demo)', '2026-11-10T15:00:00.000Z'],
    );
  });
});

describe('HU03 · CA2 — aprobar cambia el estado y se conserva', () => {
  test('una propuesta pendiente pasa a "Aprobada" con responsable y fecha de decisión', () => {
    const s = conPropuesta();
    s.reloj.avanzar(3600 * 1000);
    const r = s.controladores.propuestas.aprobarPropuesta(dueno(s), 1);
    assert.equal(r.estado, 'Aprobada');
    assert.equal(r.decididaPor, dueno(s).id);
    assert.equal(r.decididaPorNombre, 'Andrés Pérez (demo)');
    assert.equal(r.fechaDecision, '2026-11-10T16:00:00.000Z');
  });

  test('al volver a consultarla sigue "Aprobada" (detalle y listado)', () => {
    const s = conPropuesta();
    s.controladores.propuestas.aprobarPropuesta(dueno(s), 1);
    assert.equal(s.controladores.propuestas.obtenerPropuesta(dueno(s), 1).estado, 'Aprobada');
    assert.equal(s.controladores.propuestas.listarPropuestas(dueno(s), { estado: 'Aprobada' }).propuestas.length, 1);
    assert.equal(s.controladores.propuestas.listarPropuestas(dueno(s), { estado: 'Pendiente' }).propuestas.length, 0);
  });

  test('la decisión se conserva después de reiniciar (almacenamiento JSON)', () => {
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'panaautos-hu03-'));
    const ruta = path.join(carpeta, 'datos.json');
    const semilla = () => crearDatosFicticios();
    try {
      const s1 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }), reloj: crearRelojFijo() });
      s1.controladores.propuestas.registrarPropuesta(s1.dao.usuarios.porId(1), datos);
      s1.controladores.propuestas.aprobarPropuesta(s1.dao.usuarios.porId(4), 1);
      const s2 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }), reloj: crearRelojFijo() });
      assert.equal(s2.controladores.propuestas.obtenerPropuesta(s2.dao.usuarios.porId(4), 1).estado, 'Aprobada');
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });

  test('no se puede aprobar dos veces ni aprobar una propuesta ya rechazada (decisión final)', () => {
    const s = conPropuesta();
    s.controladores.propuestas.aprobarPropuesta(dueno(s), 1);
    assert.throws(() => s.controladores.propuestas.aprobarPropuesta(dueno(s), 1), (e) => e instanceof ErrorConflicto && /ya fue aprobada/.test(e.message));

    const s2 = conPropuesta();
    const p = s2.dao.propuestas.porId(1);
    p.estado = 'Rechazada';
    s2.dao.propuestas.actualizar(p);
    assert.throws(() => s2.controladores.propuestas.aprobarPropuesta(dueno(s2), 1), ErrorConflicto);
    assert.equal(s2.dao.propuestas.porId(1).estado, 'Rechazada');
  });

  test('propuesta inexistente → no encontrado; identificador inválido → validación', () => {
    const s = conPropuesta();
    assert.throws(() => s.controladores.propuestas.aprobarPropuesta(dueno(s), 9), ErrorNoEncontrado);
    assert.throws(() => s.controladores.propuestas.aprobarPropuesta(dueno(s), 'x'), ErrorValidacion);
  });
});

describe('HU03 · CA3 — solo el Dueño aprueba y no se toca el inventario', () => {
  test('anónimos y todos los demás roles son rechazados, sin cambios', () => {
    const s = conPropuesta();
    assert.throws(() => s.controladores.propuestas.aprobarPropuesta(null, 1), ErrorNoAutenticado);
    for (const rol of [ROLES.VENDEDOR, ROLES.ENCARGADO_INVENTARIO, ROLES.ADMINISTRADOR]) {
      assert.throws(() => s.controladores.propuestas.aprobarPropuesta(actorConRol(s, rol), 1), ErrorPermiso, rol);
    }
    assert.throws(() => s.controladores.propuestas.aprobarPropuesta({ id: 5, rol: 'cliente' }, 1), ErrorPermiso);
    assert.equal(s.dao.propuestas.porId(1).estado, 'Pendiente');
    assert.equal(s.dao.propuestas.porId(1).decididaPor, null);
  });

  test('el empleado que presentó la propuesta no puede aprobarla él mismo', () => {
    const s = conPropuesta();
    assert.throws(() => s.controladores.propuestas.aprobarPropuesta(actorConRol(s, ROLES.VENDEDOR), 1), ErrorPermiso);
  });

  test('aprobar NO incorpora el vehículo al inventario ni lo marca como disponible', () => {
    const s = conPropuesta();
    const vehiculosAntes = s.dao.vehiculos.todos();
    s.controladores.propuestas.aprobarPropuesta(dueno(s), 1);
    assert.deepEqual(s.dao.vehiculos.todos(), vehiculosAntes);
    assert.equal(s.controladores.catalogo.listarCatalogo().vehiculos.some((v) => v.modelo === '3 Touring'), false);
    assert.equal(s.controladores.inventario.listarInventario(actorConRol(s, ROLES.VENDEDOR)).vehiculos.length, vehiculosAntes.length);
    assert.equal(s.dao.ventas.todos().length, 0, 'tampoco formaliza una compra ni una venta');
  });
});

describe('HU03 · capa de vistas (HTTP): POST /api/propuestas/:id/aprobar', () => {
  let s;
  let servidor;
  before(async () => {
    s = conPropuesta();
    servidor = await iniciarServidor(s.controladores);
  });
  after(() => servidor.cerrar());

  test('sin sesión 401; vendedor 403; el estado no cambia', async () => {
    assert.equal((await servidor.crearCliente().post('/api/propuestas/1/aprobar')).estado, 401);
    const v = servidor.crearCliente();
    await v.iniciarSesion(1);
    assert.equal((await v.post('/api/propuestas/1/aprobar')).estado, 403);
    assert.equal(s.dao.propuestas.porId(1).estado, 'Pendiente');
  });

  test('el dueño aprueba (200); un segundo intento responde 409; id inexistente 404', async () => {
    const d = servidor.crearCliente();
    await d.iniciarSesion(dueno(s).id);
    const r = await d.post('/api/propuestas/1/aprobar');
    assert.equal(r.estado, 200);
    assert.equal(r.json.estado, 'Aprobada');
    assert.equal((await d.post('/api/propuestas/1/aprobar')).estado, 409);
    assert.equal((await d.post('/api/propuestas/88/aprobar')).estado, 404);
  });

  test('doble clic simultáneo: exactamente una aprobación se acepta', async () => {
    const s2 = conPropuesta();
    const srv = await iniciarServidor(s2.controladores);
    try {
      const clientes = await Promise.all([1, 2, 3, 4, 5].map(async () => {
        const c = srv.crearCliente();
        await c.iniciarSesion(dueno(s2).id);
        return c;
      }));
      const estados = (await Promise.all(clientes.map((c) => c.post('/api/propuestas/1/aprobar')))).map((r) => r.estado).sort();
      assert.deepEqual(estados, [200, 409, 409, 409, 409]);
    } finally {
      await srv.cerrar();
    }
  });
});
