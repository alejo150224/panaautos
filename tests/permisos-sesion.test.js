'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { exigirPermiso, permisosDe } = require('../src/controllers/permisos');
const { ErrorNoAutenticado, ErrorPermiso, ErrorValidacion, ErrorNoEncontrado } = require('../src/controllers/errores');
const { Errores, texto, aIdentificador, esNumeroPositivo, esFechaIso } = require('../src/controllers/validaciones');
const { crearSistemaDePrueba, actorConRol, ROLES } = require('./helpers/sistema');

const TABLA = { 'demo:leer': [ROLES.VENDEDOR], 'demo:todo': [ROLES.VENDEDOR, ROLES.DUENO] };

describe('Permisos por rol', () => {
  test('sin actor se lanza ErrorNoAutenticado', () => {
    assert.throws(() => exigirPermiso(null, 'demo:leer', TABLA), ErrorNoAutenticado);
  });

  test('un rol no autorizado recibe ErrorPermiso', () => {
    assert.throws(() => exigirPermiso({ rol: ROLES.ADMINISTRADOR }, 'demo:leer', TABLA), ErrorPermiso);
  });

  test('un permiso desconocido se deniega (denegar por defecto)', () => {
    assert.throws(() => exigirPermiso({ rol: ROLES.DUENO }, 'no-existe', TABLA), ErrorPermiso);
  });

  test('un rol autorizado pasa sin excepción', () => {
    assert.doesNotThrow(() => exigirPermiso({ rol: ROLES.VENDEDOR }, 'demo:leer', TABLA));
  });

  test('permisosDe lista solo lo que concede el rol y nada para anónimos', () => {
    assert.deepEqual(permisosDe({ rol: ROLES.DUENO }, TABLA), ['demo:todo']);
    assert.deepEqual(permisosDe({ rol: ROLES.VENDEDOR }, TABLA), ['demo:leer', 'demo:todo']);
    assert.deepEqual(permisosDe(null, TABLA), []);
  });
});

describe('SesionController', () => {
  test('lista los usuarios ficticios con su rol y sin datos sensibles', () => {
    const sistema = crearSistemaDePrueba();
    const lista = sistema.controladores.sesion.listarUsuariosDemo();
    assert.equal(lista.length, 5);
    for (const u of lista) assert.deepEqual(Object.keys(u).sort(), ['id', 'nombre', 'rol', 'rolNombre']);
  });

  test('inicia sesión con un usuario existente', () => {
    const sistema = crearSistemaDePrueba();
    const dueno = actorConRol(sistema, ROLES.DUENO);
    assert.equal(sistema.controladores.sesion.iniciarSesion(dueno.id).id, dueno.id);
    assert.equal(sistema.controladores.sesion.iniciarSesion(String(dueno.id)).id, dueno.id);
  });

  test('rechaza identificadores inválidos y usuarios inexistentes o inactivos', () => {
    const sistema = crearSistemaDePrueba();
    const sesion = sistema.controladores.sesion;
    for (const malo of [undefined, null, '', 'abc', -1, 0, 1.5, {}]) {
      assert.throws(() => sesion.iniciarSesion(malo), ErrorValidacion, `valor: ${JSON.stringify(malo)}`);
    }
    assert.throws(() => sesion.iniciarSesion(999), ErrorNoEncontrado);

    const usuario = sistema.dao.usuarios.porId(1);
    usuario.activo = false;
    sistema.dao.usuarios.actualizar(usuario);
    assert.throws(() => sesion.iniciarSesion(1), ErrorNoEncontrado);
    assert.equal(sesion.obtenerUsuario(1), null);
  });

  test('describirSesion de un anónimo no concede permisos', () => {
    const sistema = crearSistemaDePrueba();
    assert.deepEqual(sistema.controladores.sesion.describirSesion(null), { usuario: null, permisos: [] });
  });
});

describe('Validaciones reutilizables', () => {
  test('texto recorta espacios y descarta lo que no es texto', () => {
    assert.equal(texto('  hola '), 'hola');
    assert.equal(texto(42), '');
    assert.equal(texto(null), '');
  });

  test('aIdentificador solo acepta enteros positivos', () => {
    assert.equal(aIdentificador(7), 7);
    assert.equal(aIdentificador('7'), 7);
    for (const malo of ['0', '-1', '1.5', 'x', '', null, undefined, 2 ** 60]) assert.equal(aIdentificador(malo), null);
  });

  test('esNumeroPositivo rechaza 0, negativos, NaN, infinito y texto', () => {
    assert.equal(esNumeroPositivo(1), true);
    for (const malo of [0, -5, NaN, Infinity, '10', null]) assert.equal(esNumeroPositivo(malo), false);
  });

  test('esFechaIso valida calendario estricto', () => {
    assert.equal(esFechaIso('2026-11-10'), true);
    assert.equal(esFechaIso('2028-02-29'), true);
    for (const mala of ['2026-02-30', '2026-13-01', '10/11/2026', '2026-1-1', '', null]) assert.equal(esFechaIso(mala), false);
  });

  test('Errores acumula todos los mensajes antes de lanzar', () => {
    const errores = new Errores();
    errores.agregar('a', 'falta a');
    errores.agregar('b', 'falta b');
    try {
      errores.lanzarSiHay();
      assert.fail('debía lanzar');
    } catch (e) {
      assert.ok(e instanceof ErrorValidacion);
      assert.deepEqual(e.detalles.map((d) => d.campo), ['a', 'b']);
    }
    assert.doesNotThrow(() => new Errores().lanzarSiHay());
  });
});
