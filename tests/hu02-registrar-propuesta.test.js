'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { crearSistemaDePrueba, actorConRol, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const { ErrorNoAutenticado, ErrorPermiso, ErrorValidacion, ErrorNoEncontrado } = require('../src/controllers/errores');

/**
 * HU02 — Registrar propuesta de incorporación (Issue #2, RF-23, 3 SP, Should Have).
 * CA1: exige marca, modelo, año, origen y precio estimado; origen "Compra directa" o "Proporcionado
 *      por empleado"; si falta un dato informa el error y no guarda.
 * CA2: al guardar asigna identificador, registra usuario y fecha y deja el estado "Pendiente".
 * CA3: queda disponible para revisión del dueño, sin incorporar el vehículo ni marcarlo disponible.
 */

const valida = (extra = {}) => ({ marca: 'Mazda', modelo: '3 Touring', anio: 2020, origen: 'Compra directa', precioEstimado: 70000000, ...extra });
const vendedor = (s) => actorConRol(s, ROLES.VENDEDOR);

describe('HU02 · CA1 — campos obligatorios y orígenes permitidos', () => {
  for (const campo of ['marca', 'modelo', 'anio', 'origen', 'precioEstimado']) {
    test(`si falta "${campo}" informa el error y no guarda la propuesta`, () => {
      const s = crearSistemaDePrueba();
      const datos = valida();
      delete datos[campo];
      assert.throws(() => s.controladores.propuestas.registrarPropuesta(vendedor(s), datos), (e) => {
        assert.ok(e instanceof ErrorValidacion);
        assert.ok(e.detalles.some((d) => d.campo === campo));
        return true;
      });
      assert.equal(s.dao.propuestas.todos().length, 0);
    });
  }

  for (const origen of ['Compra directa', 'Proporcionado por empleado']) {
    test(`acepta el origen "${origen}"`, () => {
      const s = crearSistemaDePrueba();
      assert.equal(s.controladores.propuestas.registrarPropuesta(vendedor(s), valida({ origen })).origen, origen);
    });
  }

  for (const origen of ['Importación', 'compra directa', 'Empleado', '', 3]) {
    test(`rechaza un origen distinto de los dos permitidos: ${JSON.stringify(origen)}`, () => {
      const s = crearSistemaDePrueba();
      assert.throws(() => s.controladores.propuestas.registrarPropuesta(vendedor(s), valida({ origen })), ErrorValidacion);
      assert.equal(s.dao.propuestas.todos().length, 0);
    });
  }

  for (const [campo, valor] of [['precioEstimado', 0], ['precioEstimado', -5], ['precioEstimado', '70000000'], ['anio', 1900], ['anio', 2030], ['anio', 2020.5], ['anio', '2020'], ['marca', '   '], ['modelo', 'x'.repeat(61)]]) {
    test(`rechaza ${campo} inválido: ${JSON.stringify(valor)}`, () => {
      const s = crearSistemaDePrueba();
      assert.throws(() => s.controladores.propuestas.registrarPropuesta(vendedor(s), valida({ [campo]: valor })), ErrorValidacion);
      assert.equal(s.dao.propuestas.todos().length, 0);
    });
  }

  test('el año máximo permitido es el año siguiente al actual', () => {
    const s = crearSistemaDePrueba(); // reloj fijo en 2026
    assert.doesNotThrow(() => s.controladores.propuestas.registrarPropuesta(vendedor(s), valida({ anio: 2027 })));
    assert.throws(() => s.controladores.propuestas.registrarPropuesta(vendedor(s), valida({ anio: 2028 })), ErrorValidacion);
  });

  test('informa todos los errores a la vez', () => {
    const s = crearSistemaDePrueba();
    try {
      s.controladores.propuestas.registrarPropuesta(vendedor(s), {});
      assert.fail('debía lanzar');
    } catch (e) {
      assert.deepEqual(e.detalles.map((d) => d.campo).sort(), ['anio', 'marca', 'modelo', 'origen', 'precioEstimado']);
    }
  });

  test('solo empleados presentan propuestas: dueño, administrador y anónimos son rechazados', () => {
    const s = crearSistemaDePrueba();
    assert.throws(() => s.controladores.propuestas.registrarPropuesta(null, valida()), ErrorNoAutenticado);
    for (const rol of [ROLES.DUENO, ROLES.ADMINISTRADOR]) {
      assert.throws(() => s.controladores.propuestas.registrarPropuesta(actorConRol(s, rol), valida()), ErrorPermiso, rol);
    }
    assert.equal(s.dao.propuestas.todos().length, 0);
    assert.doesNotThrow(() => s.controladores.propuestas.registrarPropuesta(actorConRol(s, ROLES.ENCARGADO_INVENTARIO), valida()));
  });
});

describe('HU02 · CA2 — identificador, usuario, fecha y estado "Pendiente"', () => {
  test('guarda la propuesta con id, autor, fecha y estado Pendiente', () => {
    const s = crearSistemaDePrueba();
    const p = s.controladores.propuestas.registrarPropuesta(s.dao.usuarios.porId(2), valida());
    assert.equal(p.id, 1);
    assert.equal(p.estado, 'Pendiente');
    assert.equal(p.presentadaPor, 2);
    assert.equal(p.presentadaPorNombre, 'Carlos Ruiz (demo)');
    assert.equal(p.fechaRegistro, '2026-11-10T15:00:00.000Z');
    assert.equal(p.decididaPor, null);
    assert.equal(p.fechaDecision, null);
    assert.equal(s.dao.propuestas.porId(1).estado, 'Pendiente');
  });

  test('ignora campos que el cliente intente imponer (estado, autor, fecha)', () => {
    const s = crearSistemaDePrueba();
    const p = s.controladores.propuestas.registrarPropuesta(vendedor(s), valida({ estado: 'Aprobada', presentadaPor: 4, fechaRegistro: '2000-01-01T00:00:00Z', decididaPor: 4 }));
    assert.equal(p.estado, 'Pendiente');
    assert.equal(p.presentadaPor, vendedor(s).id);
    assert.equal(p.fechaRegistro, '2026-11-10T15:00:00.000Z');
    assert.equal(p.decididaPor, null);
  });

  test('los identificadores son únicos y crecientes', () => {
    const s = crearSistemaDePrueba();
    const ids = [1, 2, 3].map(() => s.controladores.propuestas.registrarPropuesta(vendedor(s), valida()).id);
    assert.deepEqual(ids, [1, 2, 3]);
  });
});

describe('HU02 · CA3 — disponible para revisión del dueño, sin tocar el inventario', () => {
  test('el dueño ve la propuesta pendiente con todos sus datos', () => {
    const s = crearSistemaDePrueba();
    s.controladores.propuestas.registrarPropuesta(vendedor(s), valida());
    const dueno = actorConRol(s, ROLES.DUENO);
    const { propuestas } = s.controladores.propuestas.listarPropuestas(dueno, { estado: 'Pendiente' });
    assert.equal(propuestas.length, 1);
    const d = s.controladores.propuestas.obtenerPropuesta(dueno, 1);
    assert.deepEqual([d.marca, d.modelo, d.anio, d.origen, d.precioEstimado, d.presentadaPorNombre], ['Mazda', '3 Touring', 2020, 'Compra directa', 70000000, 'Laura Gómez (demo)']);
  });

  test('NO incorpora el vehículo al inventario ni lo marca como disponible', () => {
    const s = crearSistemaDePrueba();
    const antes = s.dao.vehiculos.todos();
    s.controladores.propuestas.registrarPropuesta(vendedor(s), valida());
    assert.deepEqual(s.dao.vehiculos.todos(), antes);
    assert.equal(s.controladores.catalogo.listarCatalogo().vehiculos.some((v) => v.marca === 'Mazda' && v.modelo === '3 Touring'), false);
  });

  test('un empleado solo ve sus propias propuestas', () => {
    const s = crearSistemaDePrueba();
    s.controladores.propuestas.registrarPropuesta(s.dao.usuarios.porId(1), valida({ marca: 'De Laura' }));
    s.controladores.propuestas.registrarPropuesta(s.dao.usuarios.porId(2), valida({ marca: 'De Carlos' }));
    const lista = s.controladores.propuestas.listarPropuestas(s.dao.usuarios.porId(1)).propuestas;
    assert.deepEqual(lista.map((p) => p.marca), ['De Laura']);
    assert.throws(() => s.controladores.propuestas.obtenerPropuesta(s.dao.usuarios.porId(1), 2), ErrorPermiso);
    assert.equal(s.controladores.propuestas.listarPropuestas(actorConRol(s, ROLES.DUENO)).propuestas.length, 2);
  });

  test('el administrador y los anónimos no consultan propuestas', () => {
    const s = crearSistemaDePrueba();
    assert.throws(() => s.controladores.propuestas.listarPropuestas(null), ErrorNoAutenticado);
    assert.throws(() => s.controladores.propuestas.listarPropuestas(actorConRol(s, ROLES.ADMINISTRADOR)), ErrorPermiso);
  });

  test('lista vacía con mensaje; filtro de estado inválido → validación; id inexistente → no encontrado', () => {
    const s = crearSistemaDePrueba();
    const dueno = actorConRol(s, ROLES.DUENO);
    assert.deepEqual(s.controladores.propuestas.listarPropuestas(dueno), { propuestas: [], mensaje: 'No hay propuestas registradas' });
    assert.throws(() => s.controladores.propuestas.listarPropuestas(dueno, { estado: 'Inventado' }), ErrorValidacion);
    assert.throws(() => s.controladores.propuestas.obtenerPropuesta(dueno, 9), ErrorNoEncontrado);
    assert.throws(() => s.controladores.propuestas.obtenerPropuesta(dueno, 'x'), ErrorValidacion);
  });
});

describe('HU02 · capa de vistas (HTTP)', () => {
  let s;
  let servidor;
  before(async () => {
    s = crearSistemaDePrueba();
    servidor = await iniciarServidor(s.controladores);
  });
  after(() => servidor.cerrar());

  test('sin sesión 401; dueño 403 al registrar', async () => {
    assert.equal((await servidor.crearCliente().post('/api/propuestas', valida())).estado, 401);
    const d = servidor.crearCliente();
    await d.iniciarSesion(actorConRol(s, ROLES.DUENO).id);
    assert.equal((await d.post('/api/propuestas', valida())).estado, 403);
  });

  test('el vendedor registra (201) y el dueño la ve pendiente (200)', async () => {
    const v = servidor.crearCliente();
    await v.iniciarSesion(1);
    const r = await v.post('/api/propuestas', valida());
    assert.equal(r.estado, 201);
    assert.equal(r.json.estado, 'Pendiente');
    const d = servidor.crearCliente();
    await d.iniciarSesion(actorConRol(s, ROLES.DUENO).id);
    const lista = await d.get('/api/propuestas?estado=Pendiente');
    assert.equal(lista.json.propuestas.length, 1);
    assert.equal((await d.get(`/api/propuestas/${r.json.id}`)).json.marca, 'Mazda');
  });

  test('datos inválidos → 400 y no se guarda', async () => {
    const antes = s.dao.propuestas.todos().length;
    const v = servidor.crearCliente();
    await v.iniciarSesion(1);
    assert.equal((await v.post('/api/propuestas', valida({ origen: 'Importación' }))).estado, 400);
    assert.equal(s.dao.propuestas.todos().length, antes);
  });
});
