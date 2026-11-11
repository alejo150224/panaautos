'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { crearSistemaDePrueba, actorConRol, crearRelojFijo, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const { ErrorNoAutenticado, ErrorPermiso, ErrorNoEncontrado, ErrorValidacion } = require('../src/controllers/errores');
const { crearSistema } = require('../src/composicion');
const AlmacenamientoJson = require('../src/dao/almacenamiento/AlmacenamientoJson');
const { crearDatosFicticios } = require('../src/dao/datosFicticios');

/**
 * HU08 — Actualizar el estado de una solicitud (Issue #8, RF-18, 3 SP, Must Have).
 * CA1: el vendedor autorizado puede elegir Nueva / En contacto / En negociación / Atendida / Cerrada.
 * CA2: el nuevo estado se conserva al volver a consultar, sin modificar contacto ni vehículo.
 * CA3: un cliente o usuario sin permiso de gestión no puede modificar el estado.
 */

const vendedor = (s) => actorConRol(s, ROLES.VENDEDOR);
function sistemaConSolicitud() {
  const s = crearSistemaDePrueba();
  s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 1, nombre: 'Ana Prueba', telefono: '3001234567', correo: 'ana@example.com', mensaje: 'Hola' });
  return s;
}
const ESTADOS = ['Nueva', 'En contacto', 'En negociación', 'Atendida', 'Cerrada'];

describe('HU08 · CA1 — los cinco estados permitidos', () => {
  for (const estado of ESTADOS.filter((e) => e !== 'Nueva')) {
    test(`el vendedor puede cambiar a "${estado}"`, () => {
      const s = sistemaConSolicitud();
      const r = s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, estado);
      assert.deepEqual(r, { id: 1, estado, estadoAnterior: 'Nueva', cambio: true });
    });
  }

  test('puede volver a "Nueva" y recorrer todos los estados en cualquier orden', () => {
    const s = sistemaConSolicitud();
    for (const estado of ['Cerrada', 'Nueva', 'Atendida', 'En contacto', 'En negociación']) {
      s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, estado);
      assert.equal(s.dao.solicitudes.porId(1).estado, estado);
    }
  });

  for (const malo of ['Aprobada', 'nueva', 'EN CONTACTO', '', null, undefined, 3, 'Reservada']) {
    test(`rechaza un estado que no es uno de los cinco: ${JSON.stringify(malo)}`, () => {
      const s = sistemaConSolicitud();
      assert.throws(() => s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, malo), ErrorValidacion);
      assert.equal(s.dao.solicitudes.porId(1).estado, 'Nueva');
    });
  }

  test('solicitud inexistente → no encontrado; identificador inválido → validación', () => {
    const s = sistemaConSolicitud();
    assert.throws(() => s.controladores.solicitudes.actualizarEstado(vendedor(s), 99, 'Cerrada'), ErrorNoEncontrado);
    assert.throws(() => s.controladores.solicitudes.actualizarEstado(vendedor(s), 'x', 'Cerrada'), ErrorValidacion);
  });

  test('fijar el mismo estado no es un cambio', () => {
    const s = sistemaConSolicitud();
    assert.equal(s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, 'Nueva').cambio, false);
  });
});

describe('HU08 · CA2 — el estado se conserva y no se alteran contacto ni vehículo', () => {
  test('al volver a consultar aparece el nuevo estado y todo lo demás queda igual', () => {
    const s = sistemaConSolicitud();
    const antes = s.dao.solicitudes.porId(1);
    const vehiculoAntes = s.dao.vehiculos.porId(1);
    s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, 'En negociación');

    const despues = s.dao.solicitudes.porId(1);
    assert.equal(despues.estado, 'En negociación');
    assert.deepEqual({ ...despues, estado: antes.estado }, { ...antes }, 'solo cambia el estado');
    assert.deepEqual(s.dao.vehiculos.porId(1), vehiculoAntes, 'el vehículo no cambia');
    assert.equal(s.controladores.solicitudes.obtenerSolicitud(vendedor(s), 1).estado, 'En negociación');
    assert.equal(s.controladores.solicitudes.listarSolicitudes(vendedor(s)).solicitudes[0].estado, 'En negociación');
  });

  test('cerrar una solicitud no vende ni reserva el vehículo', () => {
    const s = sistemaConSolicitud();
    s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, 'Cerrada');
    assert.equal(s.dao.vehiculos.porId(1).estado, 'Disponible');
    assert.equal(s.dao.ventas.todos().length, 0);
  });

  test('el estado se conserva tras reiniciar (almacenamiento JSON)', () => {
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'panaautos-hu08-'));
    const ruta = path.join(carpeta, 'datos.json');
    const semilla = () => crearDatosFicticios();
    try {
      const s1 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }), reloj: crearRelojFijo() });
      s1.controladores.solicitudes.registrarSolicitud({ vehiculoId: 2, nombre: 'Ana', telefono: '3001234567' });
      s1.controladores.solicitudes.actualizarEstado(s1.dao.usuarios.porId(1), 1, 'Atendida');
      const s2 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }), reloj: crearRelojFijo() });
      assert.equal(s2.controladores.solicitudes.obtenerSolicitud(s2.dao.usuarios.porId(1), 1).estado, 'Atendida');
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });
});

describe('HU08 · CA3 — solo quien gestiona puede modificar', () => {
  test('un anónimo (cliente) no puede', () => {
    const s = sistemaConSolicitud();
    assert.throws(() => s.controladores.solicitudes.actualizarEstado(null, 1, 'Cerrada'), ErrorNoAutenticado);
    assert.throws(() => s.controladores.solicitudes.actualizarEstado({ id: 9, rol: 'cliente' }, 1, 'Cerrada'), ErrorPermiso);
    assert.equal(s.dao.solicitudes.porId(1).estado, 'Nueva');
  });

  for (const rol of [ROLES.DUENO, ROLES.ADMINISTRADOR, ROLES.ENCARGADO_INVENTARIO]) {
    test(`el rol "${rol}" no puede modificar el estado`, () => {
      const s = sistemaConSolicitud();
      assert.throws(() => s.controladores.solicitudes.actualizarEstado(actorConRol(s, rol), 1, 'Cerrada'), ErrorPermiso);
      assert.equal(s.dao.solicitudes.porId(1).estado, 'Nueva');
    });
  }
});

describe('HU08 · capa de vistas (HTTP): PATCH /api/solicitudes/:id/estado', () => {
  let s;
  let servidor;
  before(async () => {
    s = sistemaConSolicitud();
    servidor = await iniciarServidor(s.controladores);
  });
  after(() => servidor.cerrar());

  test('sin sesión 401 y con rol dueño 403; el estado no cambia', async () => {
    assert.equal((await servidor.crearCliente().patch('/api/solicitudes/1/estado', { estado: 'Cerrada' })).estado, 401);
    const d = servidor.crearCliente();
    await d.iniciarSesion(actorConRol(s, ROLES.DUENO).id);
    assert.equal((await d.patch('/api/solicitudes/1/estado', { estado: 'Cerrada' })).estado, 403);
    assert.equal(s.dao.solicitudes.porId(1).estado, 'Nueva');
  });

  test('el vendedor cambia el estado (200) y la consulta lo refleja', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(1);
    const r = await c.patch('/api/solicitudes/1/estado', { estado: 'En contacto' });
    assert.equal(r.estado, 200);
    assert.equal(r.json.cambio, true);
    assert.equal((await c.get('/api/solicitudes/1')).json.estado, 'En contacto');
  });

  test('estado inválido → 400; solicitud inexistente → 404', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(1);
    assert.equal((await c.patch('/api/solicitudes/1/estado', { estado: 'Inventado' })).estado, 400);
    assert.equal((await c.patch('/api/solicitudes/55/estado', { estado: 'Cerrada' })).estado, 404);
  });
});
