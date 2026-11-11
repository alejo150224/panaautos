'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { crearSistemaDePrueba, actorConRol, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const { ErrorNoAutenticado, ErrorPermiso } = require('../src/controllers/errores');
const { MENSAJE_INVENTARIO_VACIO } = require('../src/controllers/InventarioController');
const { crearSistema } = require('../src/composicion');
const AlmacenamientoJson = require('../src/dao/almacenamiento/AlmacenamientoJson');
const { crearDatosFicticios } = require('../src/dao/datosFicticios');
const { ESTADOS_VEHICULO } = require('../src/models/enums');

/**
 * HU01 — Consultar inventario centralizado (Issue #1, RF-09, 2 SP, Must Have).
 * CA1: listado con identificador, marca, modelo, año, precio y estado para personal autorizado.
 * CA2: tras modificar el estado, una nueva consulta muestra el estado guardado más reciente.
 * CA3: sin vehículos, el mensaje exacto "No hay vehículos registrados".
 */

describe('HU01 · CA1 — listado con los campos requeridos para personal autorizado', () => {
  test('el vendedor ve cada vehículo con identificador, marca, modelo, año, precio y estado', () => {
    const sistema = crearSistemaDePrueba();
    const { vehiculos, mensaje } = sistema.controladores.inventario.listarInventario(actorConRol(sistema, ROLES.VENDEDOR));

    assert.equal(mensaje, null);
    assert.equal(vehiculos.length, sistema.dao.vehiculos.todos().length);
    for (const v of vehiculos) {
      assert.deepEqual(Object.keys(v), ['id', 'marca', 'modelo', 'anio', 'precio', 'estado']);
      assert.ok(Number.isInteger(v.id) && v.id > 0);
      assert.ok(v.marca && v.modelo);
      assert.ok(Number.isInteger(v.anio));
      assert.ok(v.precio > 0);
      assert.ok(Object.values(ESTADOS_VEHICULO).includes(v.estado));
    }
    assert.deepEqual(vehiculos[0], {
      id: 1, marca: 'Chevrolet', modelo: 'Spark GT', anio: 2021, precio: 38500000, estado: 'Disponible',
    });
  });

  test('el listado sale ordenado por identificador', () => {
    const sistema = crearSistemaDePrueba();
    const ids = sistema.controladores.inventario.listarInventario(actorConRol(sistema, ROLES.VENDEDOR)).vehiculos.map((v) => v.id);
    assert.deepEqual(ids, [...ids].sort((a, b) => a - b));
  });

  for (const rol of Object.values(ROLES)) {
    test(`el personal interno con rol "${rol}" puede consultar`, () => {
      const sistema = crearSistemaDePrueba();
      assert.doesNotThrow(() => sistema.controladores.inventario.listarInventario(actorConRol(sistema, rol)));
    });
  }

  test('un usuario anónimo (cliente sin sesión) no puede consultar el inventario interno', () => {
    const sistema = crearSistemaDePrueba();
    assert.throws(() => sistema.controladores.inventario.listarInventario(null), ErrorNoAutenticado);
    assert.throws(() => sistema.controladores.inventario.listarInventario(undefined), ErrorNoAutenticado);
  });

  test('un actor con un rol desconocido (p. ej. cliente) recibe ErrorPermiso', () => {
    const sistema = crearSistemaDePrueba();
    assert.throws(() => sistema.controladores.inventario.listarInventario({ id: 99, rol: 'cliente' }), ErrorPermiso);
  });

  test('modificar la lista devuelta no altera el inventario guardado', () => {
    const sistema = crearSistemaDePrueba();
    const actor = actorConRol(sistema, ROLES.VENDEDOR);
    const primera = sistema.controladores.inventario.listarInventario(actor);
    primera.vehiculos[0].estado = 'Alterado';
    primera.vehiculos.pop();
    const segunda = sistema.controladores.inventario.listarInventario(actor);
    assert.equal(segunda.vehiculos[0].estado, 'Disponible');
    assert.equal(segunda.vehiculos.length, sistema.dao.vehiculos.todos().length);
  });
});

describe('HU01 · CA2 — una nueva consulta muestra el estado guardado más reciente', () => {
  test('tras cambiar el estado de un vehículo, la siguiente consulta lo refleja', () => {
    const sistema = crearSistemaDePrueba();
    const actor = actorConRol(sistema, ROLES.VENDEDOR);
    const estadoDe = (id) => sistema.controladores.inventario.listarInventario(actor).vehiculos.find((v) => v.id === id).estado;

    assert.equal(estadoDe(1), ESTADOS_VEHICULO.DISPONIBLE);
    sistema.dao.vehiculos.cambiarEstado(1, ESTADOS_VEHICULO.VENDIDO);
    assert.equal(estadoDe(1), ESTADOS_VEHICULO.VENDIDO);
    sistema.dao.vehiculos.cambiarEstado(1, ESTADOS_VEHICULO.DISPONIBLE);
    assert.equal(estadoDe(1), ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('el estado actualizado se conserva en el almacenamiento durable y se ve tras reabrirlo', () => {
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'panaautos-hu01-'));
    const ruta = path.join(carpeta, 'datos.json');
    try {
      const semilla = () => crearDatosFicticios();
      const sistema1 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }) });
      sistema1.dao.vehiculos.cambiarEstado(2, ESTADOS_VEHICULO.VENDIDO);

      // Se simula un reinicio del servidor: sistema nuevo sobre el mismo archivo.
      const sistema2 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }) });
      const actor = actorConRol(sistema2, ROLES.VENDEDOR);
      const vehiculo = sistema2.controladores.inventario.listarInventario(actor).vehiculos.find((v) => v.id === 2);
      assert.equal(vehiculo.estado, ESTADOS_VEHICULO.VENDIDO);
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });
});

describe('HU01 · CA3 — mensaje exacto cuando no hay vehículos', () => {
  test('con el inventario vacío se muestra exactamente "No hay vehículos registrados"', () => {
    const sistema = crearSistemaDePrueba({ conInventario: false });
    const resultado = sistema.controladores.inventario.listarInventario(actorConRol(sistema, ROLES.VENDEDOR));
    assert.deepEqual(resultado.vehiculos, []);
    assert.equal(resultado.mensaje, 'No hay vehículos registrados');
    assert.equal(MENSAJE_INVENTARIO_VACIO, 'No hay vehículos registrados');
  });

  test('con vehículos no se devuelve mensaje de vacío', () => {
    const sistema = crearSistemaDePrueba();
    assert.equal(sistema.controladores.inventario.listarInventario(actorConRol(sistema, ROLES.VENDEDOR)).mensaje, null);
  });
});

describe('HU01 · capa de vistas (HTTP): GET /api/inventario', () => {
  let servidor;
  let sistema;
  let sistemaVacio;
  let servidorVacio;

  before(async () => {
    sistema = crearSistemaDePrueba();
    servidor = await iniciarServidor(sistema.controladores);
    sistemaVacio = crearSistemaDePrueba({ conInventario: false });
    servidorVacio = await iniciarServidor(sistemaVacio.controladores);
  });
  after(async () => {
    await servidor.cerrar();
    await servidorVacio.cerrar();
  });

  test('sin sesión responde 401', async () => {
    const r = await servidor.crearCliente().get('/api/inventario');
    assert.equal(r.estado, 401);
    assert.equal(r.json.error.codigo, 'NO_AUTENTICADO');
  });

  test('con sesión de vendedor responde 200 con el listado completo', async () => {
    const cliente = servidor.crearCliente();
    await cliente.iniciarSesion(actorConRol(sistema, ROLES.VENDEDOR).id);
    const r = await cliente.get('/api/inventario');
    assert.equal(r.estado, 200);
    assert.equal(r.json.vehiculos.length, 7);
    assert.equal(r.json.mensaje, null);
  });

  test('el permiso de inventario figura en la sesión del personal y no en la de un anónimo', async () => {
    const cliente = servidor.crearCliente();
    assert.deepEqual((await cliente.get('/api/sesion')).json.permisos, []);
    const r = await cliente.iniciarSesion(actorConRol(sistema, ROLES.ENCARGADO_INVENTARIO).id);
    assert.ok(r.json.permisos.includes('inventario:consultar'));
  });

  test('el estado cambiado en el almacenamiento aparece en la siguiente petición', async () => {
    const cliente = servidor.crearCliente();
    await cliente.iniciarSesion(actorConRol(sistema, ROLES.VENDEDOR).id);
    sistema.dao.vehiculos.cambiarEstado(6, ESTADOS_VEHICULO.PROXIMO);
    const r = await cliente.get('/api/inventario');
    assert.equal(r.json.vehiculos.find((v) => v.id === 6).estado, ESTADOS_VEHICULO.PROXIMO);
  });

  test('con el inventario vacío devuelve el mensaje exacto', async () => {
    const cliente = servidorVacio.crearCliente();
    await cliente.iniciarSesion(actorConRol(sistemaVacio, ROLES.VENDEDOR).id);
    const r = await cliente.get('/api/inventario');
    assert.equal(r.estado, 200);
    assert.deepEqual(r.json, { vehiculos: [], mensaje: 'No hay vehículos registrados' });
  });

  test('la API de inventario es de solo lectura: POST/PUT/DELETE no están permitidos', async () => {
    const cliente = servidor.crearCliente();
    await cliente.iniciarSesion(actorConRol(sistema, ROLES.VENDEDOR).id);
    for (const metodo of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      assert.equal((await cliente.pedir(metodo, '/api/inventario', {})).estado, 405, metodo);
    }
  });
});
