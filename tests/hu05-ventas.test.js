'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { crearSistemaDePrueba, actorConRol, crearRelojFijo, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const {
  ErrorNoAutenticado, ErrorPermiso, ErrorValidacion, ErrorNoEncontrado, ErrorConflicto,
} = require('../src/controllers/errores');
const VentaController = require('../src/controllers/VentaController');
const { crearSistema } = require('../src/composicion');
const AlmacenamientoMemoria = require('../src/dao/almacenamiento/AlmacenamientoMemoria');
const AlmacenamientoJson = require('../src/dao/almacenamiento/AlmacenamientoJson');
const ErrorAlmacenamiento = require('../src/dao/almacenamiento/ErrorAlmacenamiento');
const { crearDatosFicticios } = require('../src/dao/datosFicticios');
const { ESTADOS_VEHICULO, MODALIDADES_VENTA } = require('../src/models/enums');

/**
 * HU05 — Registrar venta y actualizar inventario (Issue #5, RF-14, 8 SP, Must Have).
 * CA1: exige vehículo, cliente, vendedor, fecha, precio (> 0) y modalidad; si falta algo, error y no registra.
 * CA2: la modalidad queda guardada como "Contado", "Crédito externo" o "Intercambio de vehículo/bienes".
 * CA3: venta + cambio a "Vendido" se confirman juntos (sin operación parcial) y se rechaza otra venta del mismo vehículo.
 */

const datosValidos = (extra = {}) => ({
  vehiculoId: 1, clienteId: 1, fecha: '2026-11-10', precio: 37000000, modalidad: MODALIDADES_VENTA.CONTADO, ...extra,
});
const vendedor = (s) => actorConRol(s, ROLES.VENDEDOR);
const estadoVehiculo = (s, id) => s.dao.vehiculos.porId(id).estado;

describe('HU05 · CA1 — datos obligatorios y precio mayor que cero', () => {
  for (const campo of ['vehiculoId', 'clienteId', 'fecha', 'precio', 'modalidad']) {
    test(`si falta "${campo}" informa el error y no registra la venta ni cambia el vehículo`, () => {
      const s = crearSistemaDePrueba();
      const datos = datosValidos();
      delete datos[campo];
      assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datos), (e) => {
        assert.ok(e instanceof ErrorValidacion);
        assert.ok(e.detalles.some((d) => d.campo === campo));
        return true;
      });
      assert.equal(s.dao.ventas.todos().length, 0);
      assert.equal(estadoVehiculo(s, 1), ESTADOS_VEHICULO.DISPONIBLE);
    });
  }

  for (const precio of [0, -1, -100000, NaN, Infinity, '37000000', null, undefined, {}]) {
    test(`rechaza un precio inválido: ${String(precio)}`, () => {
      const s = crearSistemaDePrueba();
      assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ precio })), ErrorValidacion);
      assert.equal(s.dao.ventas.todos().length, 0);
      assert.equal(estadoVehiculo(s, 1), ESTADOS_VEHICULO.DISPONIBLE);
    });
  }

  test('informa todos los errores a la vez cuando faltan varios datos', () => {
    const s = crearSistemaDePrueba();
    try {
      s.controladores.ventas.registrarVenta(vendedor(s), {});
      assert.fail('debía lanzar');
    } catch (e) {
      assert.ok(e instanceof ErrorValidacion);
      assert.deepEqual(e.detalles.map((d) => d.campo).sort(), ['clienteId', 'fecha', 'modalidad', 'precio', 'vehiculoId']);
    }
  });

  for (const fecha of ['', '10/11/2026', '2026-02-30', '2026-11-11', '2030-01-01', 20261110, null]) {
    test(`rechaza una fecha inválida o futura: ${JSON.stringify(fecha)}`, () => {
      const s = crearSistemaDePrueba(); // el reloj fijo marca el 2026-11-10 (hora de Colombia)
      assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ fecha })), ErrorValidacion);
      assert.equal(s.dao.ventas.todos().length, 0);
    });
  }

  test('acepta la fecha de hoy y fechas pasadas', () => {
    const s = crearSistemaDePrueba();
    assert.equal(s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ fecha: '2026-11-10' })).fecha, '2026-11-10');
    assert.equal(s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ vehiculoId: 2, fecha: '2026-01-05' })).fecha, '2026-01-05');
  });

  test('la fecha "hoy" se calcula en la zona horaria de Colombia, no en UTC', () => {
    // 02:00 UTC del 11-nov = 21:00 del 10-nov en Colombia: el 11-nov todavía es futuro.
    const s = crearSistemaDePrueba({ reloj: crearRelojFijo('2026-11-11T02:00:00.000Z') });
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ fecha: '2026-11-11' })), ErrorValidacion);
    assert.doesNotThrow(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ fecha: '2026-11-10' })));
  });

  test('el vendedor de la venta es el usuario con sesión', () => {
    const s = crearSistemaDePrueba();
    const segundo = s.dao.usuarios.porId(2);
    const venta = s.controladores.ventas.registrarVenta(segundo, datosValidos());
    assert.equal(venta.vendedorId, 2);
    assert.equal(s.dao.ventas.porId(venta.id).vendedorId, 2);
  });

  test('ignora un "vendedorId" enviado por el cliente (no se puede suplantar a otro vendedor)', () => {
    const s = crearSistemaDePrueba();
    const venta = s.controladores.ventas.registrarVenta(s.dao.usuarios.porId(1), datosValidos({ vendedorId: 2 }));
    assert.equal(venta.vendedorId, 1);
  });

  test('solo el rol Vendedor registra ventas; los demás roles y anónimos son rechazados sin efectos', () => {
    const s = crearSistemaDePrueba();
    assert.throws(() => s.controladores.ventas.registrarVenta(null, datosValidos()), ErrorNoAutenticado);
    for (const rol of [ROLES.DUENO, ROLES.ADMINISTRADOR, ROLES.ENCARGADO_INVENTARIO]) {
      assert.throws(() => s.controladores.ventas.registrarVenta(actorConRol(s, rol), datosValidos()), ErrorPermiso, rol);
    }
    assert.throws(() => s.controladores.ventas.registrarVenta({ id: 77, rol: 'cliente' }, datosValidos()), ErrorPermiso);
    assert.equal(s.dao.ventas.todos().length, 0);
    assert.equal(estadoVehiculo(s, 1), ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('vehículo o cliente inexistentes producen "no encontrado" y no dejan rastro', () => {
    const s = crearSistemaDePrueba();
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ vehiculoId: 999 })), ErrorNoEncontrado);
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ clienteId: 999 })), ErrorNoEncontrado);
    assert.equal(s.dao.ventas.todos().length, 0);
    assert.equal(estadoVehiculo(s, 1), ESTADOS_VEHICULO.DISPONIBLE);
  });
});

describe('HU05 · CA2 — modalidad de compra', () => {
  for (const modalidad of ['Contado', 'Crédito externo', 'Intercambio de vehículo/bienes']) {
    test(`guarda la modalidad "${modalidad}" tal como se seleccionó`, () => {
      const s = crearSistemaDePrueba();
      const venta = s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ modalidad }));
      assert.equal(s.dao.ventas.porId(venta.id).modalidad, modalidad);
    });
  }

  for (const modalidad of ['contado', 'Crédito', 'Financiación propia', 'Tarjeta', '', 5]) {
    test(`rechaza una modalidad que no es una de las tres permitidas: ${JSON.stringify(modalidad)}`, () => {
      const s = crearSistemaDePrueba();
      assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ modalidad })), ErrorValidacion);
      assert.equal(s.dao.ventas.todos().length, 0);
    });
  }

  test('el formulario ofrece exactamente las tres modalidades', () => {
    const s = crearSistemaDePrueba();
    assert.deepEqual(s.controladores.ventas.obtenerOpcionesDeVenta(vendedor(s)).modalidades, [
      'Contado', 'Crédito externo', 'Intercambio de vehículo/bienes',
    ]);
  });
});

describe('HU05 · CA3 — venta y estado "Vendido" juntos; no se vende dos veces', () => {
  test('una venta válida guarda la venta y deja el vehículo en "Vendido"', () => {
    const s = crearSistemaDePrueba();
    const venta = s.controladores.ventas.registrarVenta(vendedor(s), datosValidos());
    assert.equal(venta.vehiculoEstado, ESTADOS_VEHICULO.VENDIDO);
    assert.equal(estadoVehiculo(s, 1), ESTADOS_VEHICULO.VENDIDO);
    assert.deepEqual(
      (({ id, vehiculoId, clienteId, vendedorId, fecha, precio, modalidad, registradaEn }) =>
        ({ id, vehiculoId, clienteId, vendedorId, fecha, precio, modalidad, registradaEn }))(s.dao.ventas.porId(venta.id)),
      {
        id: 1, vehiculoId: 1, clienteId: 1, vendedorId: 1, fecha: '2026-11-10', precio: 37000000,
        modalidad: 'Contado', registradaEn: '2026-11-10T15:00:00.000Z',
      },
    );
  });

  test('la consulta de inventario (HU01) muestra el vehículo vendido tras la venta', () => {
    const s = crearSistemaDePrueba();
    s.controladores.ventas.registrarVenta(vendedor(s), datosValidos());
    const v = s.controladores.inventario.listarInventario(vendedor(s)).vehiculos.find((x) => x.id === 1);
    assert.equal(v.estado, 'Vendido');
  });

  test('rechaza otra venta de un vehículo que ya figura como vendido (y no crea una segunda venta)', () => {
    const s = crearSistemaDePrueba();
    s.controladores.ventas.registrarVenta(vendedor(s), datosValidos());
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ clienteId: 2 })), (e) => {
      assert.ok(e instanceof ErrorConflicto);
      assert.match(e.message, /ya figura como vendido/);
      return true;
    });
    assert.equal(s.dao.ventas.porVehiculo(1).length, 1);
  });

  test('un vehículo que ya estaba "Vendido" desde los datos base tampoco se puede vender', () => {
    const s = crearSistemaDePrueba(); // el vehículo 4 viene como Vendido
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ vehiculoId: 4 })), ErrorConflicto);
    assert.equal(s.dao.ventas.todos().length, 0);
  });

  test('un vehículo "Próximo a ingresar" no se puede vender y conserva su estado', () => {
    const s = crearSistemaDePrueba();
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ vehiculoId: 5 })), /Solo se pueden vender vehículos disponibles/);
    assert.equal(estadoVehiculo(s, 5), ESTADOS_VEHICULO.PROXIMO);
    assert.equal(s.dao.ventas.todos().length, 0);
  });

  test('el reintento del mismo envío (doble clic) no duplica la venta', () => {
    const s = crearSistemaDePrueba();
    const envio = datosValidos();
    s.controladores.ventas.registrarVenta(vendedor(s), envio);
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), envio), ErrorConflicto);
    assert.equal(s.dao.ventas.todos().length, 1);
  });

  test('SIN OPERACIÓN PARCIAL: si falla el cambio de estado, la venta tampoco se guarda', () => {
    const s = crearSistemaDePrueba();
    const vehiculoDAOQueFalla = Object.create(s.dao.vehiculos);
    vehiculoDAOQueFalla.cambiarEstado = () => {
      throw new Error('fallo simulado al actualizar el vehículo');
    };
    const controlador = new VentaController({
      ventaDAO: s.dao.ventas,
      vehiculoDAO: vehiculoDAOQueFalla,
      clienteDAO: s.dao.clientes,
      almacenamiento: s.almacenamiento,
      reloj: s.reloj,
      auditor: s.auditor,
    });
    assert.throws(() => controlador.registrarVenta(vendedor(s), datosValidos()), /fallo simulado/);
    assert.equal(s.dao.ventas.todos().length, 0, 'la venta no debe quedar guardada');
    assert.equal(estadoVehiculo(s, 1), ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('SIN OPERACIÓN PARCIAL: si falla el guardado en disco, no queda venta ni estado cambiado', () => {
    class AlmacenamientoQueFalla extends AlmacenamientoMemoria {
      _persistir() {
        throw new ErrorAlmacenamiento('disco lleno');
      }
    }
    const s = crearSistemaDePrueba({ almacenamiento: new AlmacenamientoQueFalla(crearDatosFicticios()) });
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), datosValidos()), ErrorAlmacenamiento);
    assert.equal(s.dao.ventas.todos().length, 0);
    assert.equal(estadoVehiculo(s, 1), ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('CONCURRENCIA (un proceso): 25 intentos simultáneos sobre el mismo vehículo → exactamente 1 venta', async () => {
    const s = crearSistemaDePrueba();
    const actor = vendedor(s);
    const resultados = await Promise.allSettled(
      Array.from({ length: 25 }, (_, i) =>
        Promise.resolve().then(() => s.controladores.ventas.registrarVenta(actor, datosValidos({ clienteId: (i % 5) + 1 })))),
    );
    assert.equal(resultados.filter((r) => r.status === 'fulfilled').length, 1);
    const rechazos = resultados.filter((r) => r.status === 'rejected');
    assert.equal(rechazos.length, 24);
    assert.ok(rechazos.every((r) => r.reason instanceof ErrorConflicto));
    assert.equal(s.dao.ventas.porVehiculo(1).length, 1);
    assert.equal(estadoVehiculo(s, 1), ESTADOS_VEHICULO.VENDIDO);
  });

  test('ventas de vehículos distintos no se bloquean entre sí', async () => {
    const s = crearSistemaDePrueba();
    const actor = vendedor(s);
    const resultados = await Promise.allSettled([1, 2, 3, 6].map((id) =>
      Promise.resolve().then(() => s.controladores.ventas.registrarVenta(actor, datosValidos({ vehiculoId: id })))));
    assert.ok(resultados.every((r) => r.status === 'fulfilled'));
    assert.equal(s.dao.ventas.todos().length, 4);
  });

  test('los identificadores de venta son únicos y crecientes', () => {
    const s = crearSistemaDePrueba();
    const a = s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ vehiculoId: 1 }));
    const b = s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ vehiculoId: 2 }));
    assert.deepEqual([a.id, b.id], [1, 2]);
  });

  test('PERSISTENCIA (JSON): venta y estado sobreviven a un reinicio y la doble venta sigue bloqueada', () => {
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'panaautos-hu05-'));
    const ruta = path.join(carpeta, 'datos.json');
    const semilla = () => crearDatosFicticios();
    try {
      const s1 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }), reloj: crearRelojFijo() });
      s1.controladores.ventas.registrarVenta(s1.dao.usuarios.porId(1), datosValidos());

      const s2 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }), reloj: crearRelojFijo() });
      assert.equal(s2.dao.ventas.todos().length, 1);
      assert.equal(estadoVehiculo(s2, 1), ESTADOS_VEHICULO.VENDIDO);
      assert.throws(() => s2.controladores.ventas.registrarVenta(s2.dao.usuarios.porId(1), datosValidos()), ErrorConflicto);
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });

  test('LÍMITE DE ALCANCE: no hay campos de pago y una venta por intercambio no crea inventario', () => {
    const s = crearSistemaDePrueba();
    const antes = s.dao.vehiculos.todos().length;
    const venta = s.controladores.ventas.registrarVenta(vendedor(s), datosValidos({ modalidad: MODALIDADES_VENTA.INTERCAMBIO }));
    assert.equal(s.dao.vehiculos.todos().length, antes, 'el bien recibido por intercambio no se incorpora solo');
    for (const campo of ['pago', 'pagado', 'cuotas', 'credito', 'aprobacion', 'tarjeta']) {
      assert.equal(campo in venta, false, `la venta no debe tener "${campo}"`);
    }
  });
});

describe('HU05 · formulario de venta (opciones)', () => {
  test('solo ofrece vehículos "Disponible" y todos los clientes registrados', () => {
    const s = crearSistemaDePrueba();
    const opciones = s.controladores.ventas.obtenerOpcionesDeVenta(vendedor(s));
    assert.deepEqual(opciones.vehiculos.map((v) => v.id), [1, 2, 3, 6]);
    assert.equal(opciones.clientes.length, 5);
    assert.equal(opciones.fechaHoy, '2026-11-10');
  });

  test('tras una venta, el vehículo vendido deja de ofrecerse', () => {
    const s = crearSistemaDePrueba();
    s.controladores.ventas.registrarVenta(vendedor(s), datosValidos());
    assert.deepEqual(s.controladores.ventas.obtenerOpcionesDeVenta(vendedor(s)).vehiculos.map((v) => v.id), [2, 3, 6]);
  });

  test('exige rol Vendedor', () => {
    const s = crearSistemaDePrueba();
    assert.throws(() => s.controladores.ventas.obtenerOpcionesDeVenta(null), ErrorNoAutenticado);
    assert.throws(() => s.controladores.ventas.obtenerOpcionesDeVenta(actorConRol(s, ROLES.DUENO)), ErrorPermiso);
  });
});

describe('HU05 · capa de vistas (HTTP): /api/ventas', () => {
  let s;
  let servidor;
  before(async () => {
    s = crearSistemaDePrueba();
    servidor = await iniciarServidor(s.controladores);
  });
  after(() => servidor.cerrar());

  test('sin sesión responde 401 y no cambia nada', async () => {
    const r = await servidor.crearCliente().post('/api/ventas', datosValidos({ vehiculoId: 2 }));
    assert.equal(r.estado, 401);
    assert.equal(estadoVehiculo(s, 2), ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('un dueño recibe 403', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(actorConRol(s, ROLES.DUENO).id);
    const r = await c.post('/api/ventas', datosValidos({ vehiculoId: 2 }));
    assert.equal(r.estado, 403);
    assert.equal(estadoVehiculo(s, 2), ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('datos inválidos → 400 con el detalle de cada campo', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(1);
    const r = await c.post('/api/ventas', { vehiculoId: 2, clienteId: 1, fecha: '2026-11-10', precio: 0, modalidad: 'Contado' });
    assert.equal(r.estado, 400);
    assert.equal(r.json.error.detalles[0].campo, 'precio');
    assert.equal(estadoVehiculo(s, 2), ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('una venta válida responde 201 y el inventario refleja "Vendido"', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(1);
    const r = await c.post('/api/ventas', datosValidos({ vehiculoId: 2 }));
    assert.equal(r.estado, 201);
    assert.equal(r.json.vehiculoEstado, 'Vendido');
    const inv = await c.get('/api/inventario');
    assert.equal(inv.json.vehiculos.find((v) => v.id === 2).estado, 'Vendido');
  });

  test('la segunda venta del mismo vehículo responde 409', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(1);
    const r = await c.post('/api/ventas', datosValidos({ vehiculoId: 2 }));
    assert.equal(r.estado, 409);
    assert.equal(r.json.error.codigo, 'CONFLICTO');
  });

  test('CONCURRENCIA HTTP: 20 peticiones paralelas por el mismo vehículo → un solo 201 y 19 respuestas 409', async () => {
    const clientes = await Promise.all(Array.from({ length: 20 }, async () => {
      const c = servidor.crearCliente();
      await c.iniciarSesion(2);
      return c;
    }));
    const respuestas = await Promise.all(clientes.map((c) => c.post('/api/ventas', datosValidos({ vehiculoId: 3 }))));
    const estados = respuestas.map((r) => r.estado).sort();
    assert.equal(estados.filter((e) => e === 201).length, 1);
    assert.equal(estados.filter((e) => e === 409).length, 19);
    assert.equal(s.dao.ventas.porVehiculo(3).length, 1);
  });

  test('GET /api/ventas/opciones devuelve el formulario solo al vendedor', async () => {
    const vendedorHttp = servidor.crearCliente();
    await vendedorHttp.iniciarSesion(1);
    const ok = await vendedorHttp.get('/api/ventas/opciones');
    assert.equal(ok.estado, 200);
    assert.ok(ok.json.vehiculos.every((v) => v.id !== 2 && v.id !== 3), 'ya vendidos en pruebas anteriores');
    const anonimo = await servidor.crearCliente().get('/api/ventas/opciones');
    assert.equal(anonimo.estado, 401);
  });

  test('no existen rutas para editar o eliminar ventas', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(1);
    for (const metodo of ['PUT', 'PATCH', 'DELETE']) {
      assert.equal((await c.pedir(metodo, '/api/ventas', {})).estado, 405, metodo);
      assert.equal((await c.pedir(metodo, '/api/ventas/1', {})).estado, 404, metodo);
    }
  });
});
