'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { crearSistemaDePrueba, actorConRol, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const { ErrorValidacion, ErrorNoEncontrado, ErrorConflicto } = require('../src/controllers/errores');
const { MENSAJE_CONFIRMACION } = require('../src/controllers/SolicitudController');
const { ESTADOS_VEHICULO } = require('../src/models/enums');

/**
 * HU06 — Registrar solicitud de interés (Issue #6, RF-17, 3 SP, Must Have).
 * CA1: formulario desde un vehículo disponible/próximo, identificando vehículo y condición actual.
 * CA2: exige nombre y al menos un medio de contacto; si falta, indica qué completar y no guarda.
 * CA3: solicitud válida queda asociada al vehículo y contacto con estado "Nueva", con confirmación,
 *      sin reserva, venta ni cambio de estado del vehículo.
 */

const valida = (extra = {}) => ({ vehiculoId: 1, nombre: 'Ana Prueba', telefono: '3001234567', correo: 'ana@example.com', mensaje: 'Quiero más información', ...extra });

describe('HU06 · CA1 — el catálogo público identifica el vehículo y su condición', () => {
  test('muestra solo vehículos Disponible y Próximo a ingresar, con su condición actual', () => {
    const s = crearSistemaDePrueba();
    const { vehiculos, mensaje } = s.controladores.catalogo.listarCatalogo();
    assert.equal(mensaje, null);
    assert.deepEqual(vehiculos.map((v) => v.id), [1, 2, 3, 5, 6, 7]);
    assert.ok(vehiculos.every((v) => [ESTADOS_VEHICULO.DISPONIBLE, ESTADOS_VEHICULO.PROXIMO].includes(v.estado)));
    assert.equal(vehiculos.find((v) => v.id === 5).estado, 'Próximo a ingresar');
  });

  test('un vehículo vendido ya no aparece en el catálogo público', () => {
    const s = crearSistemaDePrueba();
    s.dao.vehiculos.cambiarEstado(1, ESTADOS_VEHICULO.VENDIDO);
    assert.equal(s.controladores.catalogo.listarCatalogo().vehiculos.some((v) => v.id === 1), false);
  });

  test('el catálogo vacío informa con un mensaje', () => {
    const s = crearSistemaDePrueba({ conInventario: false });
    assert.equal(s.controladores.catalogo.listarCatalogo().mensaje, 'No hay vehículos disponibles por ahora');
  });

  test('se puede enviar solicitud sobre un vehículo próximo a ingresar', () => {
    const s = crearSistemaDePrueba();
    assert.equal(s.controladores.solicitudes.registrarSolicitud(valida({ vehiculoId: 5 })).vehiculoEstado, 'Próximo a ingresar');
  });

  test('no se acepta solicitud sobre un vehículo vendido ni inexistente', () => {
    const s = crearSistemaDePrueba();
    assert.throws(() => s.controladores.solicitudes.registrarSolicitud(valida({ vehiculoId: 4 })), ErrorConflicto);
    assert.throws(() => s.controladores.solicitudes.registrarSolicitud(valida({ vehiculoId: 999 })), ErrorNoEncontrado);
    assert.equal(s.dao.solicitudes.todos().length, 0);
  });
});

describe('HU06 · CA2 — nombre y al menos un medio de contacto', () => {
  const casos = [
    ['sin nombre', { nombre: '' }, 'nombre'],
    ['nombre solo con espacios', { nombre: '   ' }, 'nombre'],
    ['sin teléfono ni correo', { telefono: '', correo: '' }, 'contacto'],
    ['contacto solo con espacios', { telefono: '  ', correo: ' ' }, 'contacto'],
    ['correo con formato inválido', { telefono: '', correo: 'no-es-correo' }, 'correo'],
    ['teléfono con letras', { telefono: 'abc1234567', correo: '' }, 'telefono'],
    ['teléfono demasiado corto', { telefono: '12345', correo: '' }, 'telefono'],
    ['sin vehículo', { vehiculoId: null }, 'vehiculoId'],
    ['mensaje demasiado largo', { mensaje: 'x'.repeat(501) }, 'mensaje'],
  ];
  for (const [nombre, cambio, campo] of casos) {
    test(`${nombre}: indica qué completar y no guarda la solicitud`, () => {
      const s = crearSistemaDePrueba();
      assert.throws(() => s.controladores.solicitudes.registrarSolicitud(valida(cambio)), (e) => {
        assert.ok(e instanceof ErrorValidacion);
        assert.ok(e.detalles.some((d) => d.campo === campo), `se esperaba error en ${campo}: ${JSON.stringify(e.detalles)}`);
        return true;
      });
      assert.equal(s.dao.solicitudes.todos().length, 0);
    });
  }

  test('basta con el teléfono o con el correo', () => {
    const s = crearSistemaDePrueba();
    assert.doesNotThrow(() => s.controladores.solicitudes.registrarSolicitud(valida({ correo: '' })));
    assert.doesNotThrow(() => s.controladores.solicitudes.registrarSolicitud(valida({ telefono: '' })));
    assert.equal(s.dao.solicitudes.todos().length, 2);
  });

  test('el mensaje de error indica qué debe completarse', () => {
    const s = crearSistemaDePrueba();
    try {
      s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 1 });
      assert.fail('debía lanzar');
    } catch (e) {
      const mensajes = e.detalles.map((d) => d.mensaje);
      assert.ok(mensajes.includes('Debe completar su nombre'));
      assert.ok(mensajes.includes('Debe completar al menos un medio de contacto: teléfono o correo'));
    }
  });

  for (const malo of [null, undefined, 'texto', 5, []]) {
    test(`una entrada que no es objeto (${JSON.stringify(malo)}) se rechaza con error de validación`, () => {
      const s = crearSistemaDePrueba();
      assert.throws(() => s.controladores.solicitudes.registrarSolicitud(malo), ErrorValidacion);
    });
  }
});

describe('HU06 · CA3 — solicitud "Nueva" con confirmación y sin efectos sobre el vehículo', () => {
  test('guarda vehículo, contacto y estado "Nueva", y devuelve la confirmación', () => {
    const s = crearSistemaDePrueba();
    const r = s.controladores.solicitudes.registrarSolicitud(valida());
    assert.equal(r.mensaje, MENSAJE_CONFIRMACION);
    assert.equal(r.estado, 'Nueva');
    const guardada = s.dao.solicitudes.porId(r.id);
    assert.deepEqual(
      { v: guardada.vehiculoId, n: guardada.nombreCliente, t: guardada.telefono, c: guardada.correo, e: guardada.estado, f: guardada.fecha },
      { v: 1, n: 'Ana Prueba', t: '3001234567', c: 'ana@example.com', e: 'Nueva', f: '2026-11-10T15:00:00.000Z' },
    );
  });

  test('NO reserva, NO vende y NO cambia el estado del vehículo', () => {
    const s = crearSistemaDePrueba();
    const antes = s.dao.vehiculos.todos();
    s.controladores.solicitudes.registrarSolicitud(valida());
    assert.deepEqual(s.dao.vehiculos.todos(), antes);
    assert.equal(s.dao.ventas.todos().length, 0);
  });

  test('varias solicitudes del mismo vehículo son válidas (el interés no bloquea)', () => {
    const s = crearSistemaDePrueba();
    s.controladores.solicitudes.registrarSolicitud(valida());
    s.controladores.solicitudes.registrarSolicitud(valida({ nombre: 'Otra Persona' }));
    assert.equal(s.dao.solicitudes.todos().length, 2);
  });

  test('recorta espacios del nombre y los contactos', () => {
    const s = crearSistemaDePrueba();
    const r = s.controladores.solicitudes.registrarSolicitud(valida({ nombre: '  Ana  ', correo: ' ana@example.com ' }));
    assert.equal(s.dao.solicitudes.porId(r.id).nombreCliente, 'Ana');
    assert.equal(s.dao.solicitudes.porId(r.id).correo, 'ana@example.com');
  });

  test('un cliente sin sesión puede registrar (no se exige actor)', () => {
    const s = crearSistemaDePrueba();
    assert.doesNotThrow(() => s.controladores.solicitudes.registrarSolicitud(valida()));
    assert.ok(actorConRol(s, ROLES.VENDEDOR));
  });
});

describe('HU06 · capa de vistas (HTTP)', () => {
  let s;
  let servidor;
  before(async () => {
    s = crearSistemaDePrueba();
    servidor = await iniciarServidor(s.controladores);
  });
  after(() => servidor.cerrar());

  test('GET /api/catalogo es público', async () => {
    const r = await servidor.crearCliente().get('/api/catalogo');
    assert.equal(r.estado, 200);
    assert.equal(r.json.vehiculos.length, 6);
  });

  test('POST /api/solicitudes sin sesión responde 201 con la confirmación', async () => {
    const r = await servidor.crearCliente().post('/api/solicitudes', valida());
    assert.equal(r.estado, 201);
    assert.equal(r.json.estado, 'Nueva');
    assert.equal(r.json.mensaje, 'Solicitud registrada. Nos pondremos en contacto con usted.');
  });

  test('POST con datos incompletos responde 400 y no guarda', async () => {
    const antes = s.dao.solicitudes.todos().length;
    const r = await servidor.crearCliente().post('/api/solicitudes', { vehiculoId: 1, nombre: '' });
    assert.equal(r.estado, 400);
    assert.equal(s.dao.solicitudes.todos().length, antes);
  });

  test('el texto con HTML se guarda como texto (no se interpreta) y no altera la respuesta', async () => {
    const r = await servidor.crearCliente().post('/api/solicitudes', valida({ nombre: '<img src=x onerror=alert(1)>' }));
    assert.equal(r.estado, 201);
    assert.equal(s.dao.solicitudes.porId(r.json.id).nombreCliente, '<img src=x onerror=alert(1)>');
  });
});
