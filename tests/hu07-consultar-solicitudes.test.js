'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { crearSistemaDePrueba, actorConRol, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const { ErrorNoAutenticado, ErrorPermiso, ErrorNoEncontrado, ErrorValidacion } = require('../src/controllers/errores');

/**
 * HU07 — Consultar solicitudes de clientes (Issue #7, RF-18, 2 SP, Must Have).
 * CA1: listado con identificador, nombre del cliente, vehículo de interés, fecha y estado.
 * CA2: al seleccionar una solicitud, datos de contacto y vehículo asociado.
 * CA3: sin solicitudes, mensaje exacto "No hay solicitudes registradas".
 */

const vendedor = (s) => actorConRol(s, ROLES.VENDEDOR);
function conSolicitudes() {
  const s = crearSistemaDePrueba();
  s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 1, nombre: 'Ana Prueba', telefono: '3001234567', correo: 'ana@example.com', mensaje: 'Hola' });
  s.reloj.avanzar(60 * 1000);
  s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 5, nombre: 'Beto Prueba', correo: 'beto@example.com' });
  return s;
}

describe('HU07 · CA1 — listado para el vendedor autorizado', () => {
  test('muestra identificador, cliente, vehículo de interés, fecha y estado', () => {
    const s = conSolicitudes();
    const { solicitudes, mensaje } = s.controladores.solicitudes.listarSolicitudes(vendedor(s));
    assert.equal(mensaje, null);
    assert.equal(solicitudes.length, 2);
    for (const fila of solicitudes) assert.deepEqual(Object.keys(fila), ['id', 'nombreCliente', 'vehiculo', 'fecha', 'estado']);
    const ana = solicitudes.find((f) => f.nombreCliente === 'Ana Prueba');
    assert.deepEqual(ana, {
      id: 1, nombreCliente: 'Ana Prueba', vehiculo: { id: 1, descripcion: 'Chevrolet Spark GT 2021' },
      fecha: '2026-11-10T15:00:00.000Z', estado: 'Nueva',
    });
  });

  test('las más recientes aparecen primero', () => {
    const s = conSolicitudes();
    assert.deepEqual(s.controladores.solicitudes.listarSolicitudes(vendedor(s)).solicitudes.map((f) => f.id), [2, 1]);
  });

  test('el listado no expone teléfono, correo ni mensaje (solo el detalle)', () => {
    const s = conSolicitudes();
    const fila = s.controladores.solicitudes.listarSolicitudes(vendedor(s)).solicitudes[0];
    for (const campo of ['telefono', 'correo', 'mensaje']) assert.equal(campo in fila, false);
  });

  test('consulta privada: anónimos y otros roles no pueden listar', () => {
    const s = conSolicitudes();
    assert.throws(() => s.controladores.solicitudes.listarSolicitudes(null), ErrorNoAutenticado);
    for (const rol of [ROLES.DUENO, ROLES.ADMINISTRADOR, ROLES.ENCARGADO_INVENTARIO]) {
      assert.throws(() => s.controladores.solicitudes.listarSolicitudes(actorConRol(s, rol)), ErrorPermiso, rol);
    }
    assert.throws(() => s.controladores.solicitudes.listarSolicitudes({ id: 8, rol: 'cliente' }), ErrorPermiso);
  });
});

describe('HU07 · CA2 — detalle con contacto y vehículo asociado', () => {
  test('muestra los datos de contacto y el vehículo', () => {
    const s = conSolicitudes();
    const d = s.controladores.solicitudes.obtenerSolicitud(vendedor(s), 1);
    assert.equal(d.nombreCliente, 'Ana Prueba');
    assert.equal(d.telefono, '3001234567');
    assert.equal(d.correo, 'ana@example.com');
    assert.equal(d.mensaje, 'Hola');
    assert.deepEqual(d.vehiculo, { id: 1, marca: 'Chevrolet', modelo: 'Spark GT', anio: 2021, precio: 38500000, estado: 'Disponible' });
  });

  test('acepta el identificador como texto (parámetro de URL)', () => {
    const s = conSolicitudes();
    assert.equal(s.controladores.solicitudes.obtenerSolicitud(vendedor(s), '2').nombreCliente, 'Beto Prueba');
  });

  test('identificador inexistente → no encontrado; inválido → validación', () => {
    const s = conSolicitudes();
    assert.throws(() => s.controladores.solicitudes.obtenerSolicitud(vendedor(s), 99), ErrorNoEncontrado);
    for (const malo of ['abc', 0, -1, null]) {
      assert.throws(() => s.controladores.solicitudes.obtenerSolicitud(vendedor(s), malo), ErrorValidacion);
    }
  });

  test('el detalle exige rol Vendedor', () => {
    const s = conSolicitudes();
    assert.throws(() => s.controladores.solicitudes.obtenerSolicitud(null, 1), ErrorNoAutenticado);
    assert.throws(() => s.controladores.solicitudes.obtenerSolicitud(actorConRol(s, ROLES.DUENO), 1), ErrorPermiso);
  });

  test('el detalle refleja el estado actual del vehículo asociado', () => {
    const s = conSolicitudes();
    s.dao.vehiculos.cambiarEstado(1, 'Vendido');
    assert.equal(s.controladores.solicitudes.obtenerSolicitud(vendedor(s), 1).vehiculo.estado, 'Vendido');
  });
});

describe('HU07 · CA3 — mensaje exacto sin solicitudes', () => {
  test('"No hay solicitudes registradas"', () => {
    const s = crearSistemaDePrueba();
    const r = s.controladores.solicitudes.listarSolicitudes(vendedor(s));
    assert.deepEqual(r, { solicitudes: [], mensaje: 'No hay solicitudes registradas' });
  });
});

describe('HU07 · capa de vistas (HTTP)', () => {
  let s;
  let servidor;
  before(async () => {
    s = conSolicitudes();
    servidor = await iniciarServidor(s.controladores);
  });
  after(() => servidor.cerrar());

  test('sin sesión: 401 en listado y detalle', async () => {
    const c = servidor.crearCliente();
    assert.equal((await c.get('/api/solicitudes')).estado, 401);
    assert.equal((await c.get('/api/solicitudes/1')).estado, 401);
  });

  test('el dueño recibe 403 (la consulta es del vendedor)', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(actorConRol(s, ROLES.DUENO).id);
    assert.equal((await c.get('/api/solicitudes')).estado, 403);
  });

  test('el vendedor obtiene listado (200), detalle (200), 404 e id inválido (400)', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(1);
    assert.equal((await c.get('/api/solicitudes')).json.solicitudes.length, 2);
    assert.equal((await c.get('/api/solicitudes/1')).json.telefono, '3001234567');
    assert.equal((await c.get('/api/solicitudes/77')).estado, 404);
    assert.equal((await c.get('/api/solicitudes/abc')).estado, 400);
  });

  test('una solicitud pública nueva aparece de inmediato en la consulta del vendedor', async () => {
    const publico = servidor.crearCliente();
    const r = await publico.post('/api/solicitudes', { vehiculoId: 2, nombre: 'Nuevo Interesado', telefono: '3009998877' });
    assert.equal(r.estado, 201);
    const c = servidor.crearCliente();
    await c.iniciarSesion(1);
    assert.ok((await c.get('/api/solicitudes')).json.solicitudes.some((f) => f.id === r.json.id));
  });
});
