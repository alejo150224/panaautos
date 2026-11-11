'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { crearSistemaDePrueba, actorConRol, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const { ErrorNoAutenticado, ErrorPermiso, ErrorValidacion } = require('../src/controllers/errores');

/**
 * HU10 — Consultar y filtrar historial de acciones (Issue #10, RF-24, 3 SP, Should Have).
 * CA1: el dueño y el administrador consultan; los demás roles son denegados.
 * CA2: el listado muestra usuario, acción, fecha y hora, tipo de elemento e identificador.
 * CA3: filtros por usuario, rango de fechas y tipo combinables (cumplen todos); sin coincidencias → mensaje.
 */

const propuesta = { marca: 'Mazda', modelo: '3', anio: 2020, origen: 'Compra directa', precioEstimado: 70000000 };
const venta = { vehiculoId: 1, clienteId: 1, fecha: '2026-11-09', precio: 37000000, modalidad: 'Contado' };

/**
 * Historial de prueba con 4 entradas en instantes controlados (hora de Colombia = UTC-5):
 *  1. 2026-11-08 10:00 local · Laura (1)  · Registro de propuesta  · Propuesta
 *  2. 2026-11-08 22:30 local · Andrés (4) · Aprobación de propuesta · Propuesta   (= 2026-11-09T03:30Z)
 *  3. 2026-11-09 11:00 local · Carlos (2) · Registro de venta       · Venta
 *  4. 2026-11-10 10:00 local · Laura (1)  · Cambio de estado        · Solicitud
 */
function sistemaConHistorial() {
  const s = crearSistemaDePrueba();
  s.reloj.fijar('2026-11-08T15:00:00.000Z');
  s.controladores.propuestas.registrarPropuesta(s.dao.usuarios.porId(1), propuesta);
  s.reloj.fijar('2026-11-09T03:30:00.000Z');
  s.controladores.propuestas.aprobarPropuesta(s.dao.usuarios.porId(4), 1);
  s.reloj.fijar('2026-11-09T16:00:00.000Z');
  s.controladores.ventas.registrarVenta(s.dao.usuarios.porId(2), venta);
  s.reloj.fijar('2026-11-10T14:00:00.000Z');
  s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 2, nombre: 'Ana', telefono: '3001234567' });
  s.controladores.solicitudes.actualizarEstado(s.dao.usuarios.porId(1), 1, 'En contacto');
  return s;
}
const dueno = (s) => actorConRol(s, ROLES.DUENO);
const ids = (r) => r.entradas.map((e) => e.id);

describe('HU10 · CA1 — solo dueño y administrador', () => {
  for (const rol of [ROLES.DUENO, ROLES.ADMINISTRADOR]) {
    test(`el rol "${rol}" puede consultar`, () => {
      const s = sistemaConHistorial();
      assert.equal(s.controladores.historial.consultarHistorial(actorConRol(s, rol)).entradas.length, 4);
      assert.doesNotThrow(() => s.controladores.historial.obtenerOpcionesDeFiltro(actorConRol(s, rol)));
    });
  }

  for (const rol of [ROLES.VENDEDOR, ROLES.ENCARGADO_INVENTARIO]) {
    test(`el rol "${rol}" es denegado`, () => {
      const s = sistemaConHistorial();
      assert.throws(() => s.controladores.historial.consultarHistorial(actorConRol(s, rol)), ErrorPermiso);
      assert.throws(() => s.controladores.historial.obtenerOpcionesDeFiltro(actorConRol(s, rol)), ErrorPermiso);
    });
  }

  test('anónimos y clientes son denegados', () => {
    const s = sistemaConHistorial();
    assert.throws(() => s.controladores.historial.consultarHistorial(null), ErrorNoAutenticado);
    assert.throws(() => s.controladores.historial.consultarHistorial({ id: 9, rol: 'cliente' }), ErrorPermiso);
  });
});

describe('HU10 · CA2 — contenido del listado', () => {
  test('cada fila muestra usuario, acción, fecha y hora, tipo de elemento e identificador', () => {
    const s = sistemaConHistorial();
    const e = s.controladores.historial.consultarHistorial(dueno(s)).entradas.find((x) => x.accion === 'Registro de venta');
    assert.deepEqual(
      [e.usuarioNombre, e.accion, e.fechaHora, e.tipoElemento, e.elementoId],
      ['Carlos Ruiz (demo)', 'Registro de venta', '2026-11-09T16:00:00.000Z', 'Venta', 1],
    );
  });

  test('ordena de la más reciente a la más antigua', () => {
    const s = sistemaConHistorial();
    assert.deepEqual(ids(s.controladores.historial.consultarHistorial(dueno(s))), [4, 3, 2, 1]);
  });

  test('sin historial muestra "No hay acciones registradas"', () => {
    const s = crearSistemaDePrueba();
    assert.deepEqual(s.controladores.historial.consultarHistorial(dueno(s)), { entradas: [], mensaje: 'No hay acciones registradas' });
  });

  test('las filas devueltas son copias: alterarlas no cambia el historial', () => {
    const s = sistemaConHistorial();
    const r = s.controladores.historial.consultarHistorial(dueno(s));
    r.entradas[0].accion = 'Manipulada';
    assert.notEqual(s.dao.historial.todos().at(-1).accion, 'Manipulada');
  });

  test('ofrece como opciones de filtro los usuarios y los tipos de elemento', () => {
    const s = sistemaConHistorial();
    const o = s.controladores.historial.obtenerOpcionesDeFiltro(dueno(s));
    assert.equal(o.usuarios.length, 5);
    assert.deepEqual(o.tiposElemento, ['Propuesta', 'Venta', 'Solicitud']);
  });
});

describe('HU10 · CA3 — filtros individuales', () => {
  test('por usuario', () => {
    const s = sistemaConHistorial();
    assert.deepEqual(ids(s.controladores.historial.consultarHistorial(dueno(s), { usuarioId: 1 })), [4, 1]);
    assert.deepEqual(ids(s.controladores.historial.consultarHistorial(dueno(s), { usuarioId: '2' })), [3]);
  });

  test('por tipo de elemento', () => {
    const s = sistemaConHistorial();
    assert.deepEqual(ids(s.controladores.historial.consultarHistorial(dueno(s), { tipoElemento: 'Propuesta' })), [2, 1]);
    assert.deepEqual(ids(s.controladores.historial.consultarHistorial(dueno(s), { tipoElemento: 'Venta' })), [3]);
    assert.deepEqual(ids(s.controladores.historial.consultarHistorial(dueno(s), { tipoElemento: 'Solicitud' })), [4]);
  });

  test('por rango de fechas, con ambos extremos incluidos y en hora de Colombia', () => {
    const s = sistemaConHistorial();
    const h = s.controladores.historial;
    assert.deepEqual(ids(h.consultarHistorial(dueno(s), { desde: '2026-11-08', hasta: '2026-11-08' })), [2, 1]); // la entrada 2 es 22:30 del día 8 en Colombia
    assert.deepEqual(ids(h.consultarHistorial(dueno(s), { desde: '2026-11-09', hasta: '2026-11-09' })), [3]);
    assert.deepEqual(ids(h.consultarHistorial(dueno(s), { desde: '2026-11-09' })), [4, 3]);
    assert.deepEqual(ids(h.consultarHistorial(dueno(s), { hasta: '2026-11-08' })), [2, 1]);
    assert.deepEqual(ids(h.consultarHistorial(dueno(s), { desde: '2026-11-08', hasta: '2026-11-10' })), [4, 3, 2, 1]);
  });

  test('valores vacíos equivalen a "sin filtro"', () => {
    const s = sistemaConHistorial();
    assert.equal(s.controladores.historial.consultarHistorial(dueno(s), { usuarioId: '', desde: '', hasta: '', tipoElemento: '' }).entradas.length, 4);
    assert.equal(s.controladores.historial.consultarHistorial(dueno(s), undefined).entradas.length, 4);
  });
});

describe('HU10 · CA3 — filtros combinados', () => {
  test('usuario + tipo', () => {
    const s = sistemaConHistorial();
    assert.deepEqual(ids(s.controladores.historial.consultarHistorial(dueno(s), { usuarioId: 1, tipoElemento: 'Propuesta' })), [1]);
  });

  test('usuario + tipo + rango', () => {
    const s = sistemaConHistorial();
    const r = s.controladores.historial.consultarHistorial(dueno(s), { usuarioId: 1, tipoElemento: 'Solicitud', desde: '2026-11-10', hasta: '2026-11-10' });
    assert.deepEqual(ids(r), [4]);
  });

  test('PROPIEDAD: para todas las combinaciones, cada resultado cumple TODOS los filtros y no se omite ninguno', () => {
    const s = sistemaConHistorial();
    const todas = s.dao.historial.todos();
    const dia = (iso) => new Date(Date.parse(iso) - 5 * 3600 * 1000).toISOString().slice(0, 10); // día local de Colombia
    for (const usuarioId of [undefined, 1, 2, 4, 5]) {
      for (const tipoElemento of [undefined, 'Propuesta', 'Venta', 'Solicitud']) {
        for (const [desde, hasta] of [[undefined, undefined], ['2026-11-08', undefined], [undefined, '2026-11-09'], ['2026-11-09', '2026-11-10'], ['2026-11-08', '2026-11-08']]) {
          const esperado = todas
            .filter((e) => (usuarioId === undefined || e.usuarioId === usuarioId)
              && (tipoElemento === undefined || e.tipoElemento === tipoElemento)
              && (desde === undefined || dia(e.fechaHora) >= desde)
              && (hasta === undefined || dia(e.fechaHora) <= hasta))
            .map((e) => e.id).sort();
          const obtenido = ids(s.controladores.historial.consultarHistorial(dueno(s), { usuarioId, tipoElemento, desde, hasta })).sort();
          assert.deepEqual(obtenido, esperado, JSON.stringify({ usuarioId, tipoElemento, desde, hasta }));
        }
      }
    }
  });

  test('sin coincidencias muestra un mensaje informativo (distinto al de historial vacío)', () => {
    const s = sistemaConHistorial();
    const r = s.controladores.historial.consultarHistorial(dueno(s), { usuarioId: 2, tipoElemento: 'Propuesta' });
    assert.deepEqual(r, { entradas: [], mensaje: 'No hay acciones que coincidan con los filtros seleccionados' });
    assert.equal(s.controladores.historial.consultarHistorial(dueno(s), { usuarioId: 5 }).mensaje, 'No hay acciones que coincidan con los filtros seleccionados');
  });
});

describe('HU10 · validación de filtros', () => {
  const casos = [
    ['usuario inválido', { usuarioId: 'abc' }, 'usuarioId'],
    ['usuario negativo', { usuarioId: -3 }, 'usuarioId'],
    ['tipo desconocido', { tipoElemento: 'Vehículo' }, 'tipoElemento'],
    ['fecha desde con formato inválido', { desde: '08/11/2026' }, 'desde'],
    ['fecha hasta inexistente', { hasta: '2026-02-30' }, 'hasta'],
    ['rango invertido', { desde: '2026-11-10', hasta: '2026-11-01' }, 'rango'],
  ];
  for (const [nombre, filtros, campo] of casos) {
    test(`${nombre} → error de validación en "${campo}"`, () => {
      const s = sistemaConHistorial();
      assert.throws(() => s.controladores.historial.consultarHistorial(dueno(s), filtros), (e) => e instanceof ErrorValidacion && e.detalles.some((d) => d.campo === campo));
    });
  }
});

describe('HU10 · capa de vistas (HTTP)', () => {
  let s;
  let servidor;
  before(async () => {
    s = sistemaConHistorial();
    servidor = await iniciarServidor(s.controladores);
  });
  after(() => servidor.cerrar());

  test('sin sesión 401; vendedor y encargado 403', async () => {
    assert.equal((await servidor.crearCliente().get('/api/historial')).estado, 401);
    for (const rol of [ROLES.VENDEDOR, ROLES.ENCARGADO_INVENTARIO]) {
      const c = servidor.crearCliente();
      await c.iniciarSesion(actorConRol(s, rol).id);
      assert.equal((await c.get('/api/historial')).estado, 403, rol);
      assert.equal((await c.get('/api/historial/opciones')).estado, 403, rol);
    }
  });

  test('dueño y administrador consultan con filtros combinados por la query', async () => {
    for (const rol of [ROLES.DUENO, ROLES.ADMINISTRADOR]) {
      const c = servidor.crearCliente();
      await c.iniciarSesion(actorConRol(s, rol).id);
      const r = await c.get('/api/historial?usuarioId=1&tipoElemento=Propuesta&desde=2026-11-08&hasta=2026-11-08');
      assert.equal(r.estado, 200, rol);
      assert.deepEqual(ids(r.json), [1]);
    }
  });

  test('filtros inválidos → 400; sin coincidencias → 200 con mensaje', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(dueno(s).id);
    assert.equal((await c.get('/api/historial?desde=ayer')).estado, 400);
    const r = await c.get('/api/historial?usuarioId=5');
    assert.equal(r.estado, 200);
    assert.match(r.json.mensaje, /No hay acciones que coincidan/);
  });

  test('el permiso aparece en la sesión del dueño y del administrador, no en la del vendedor', async () => {
    const permisos = async (rol) => {
      const c = servidor.crearCliente();
      return (await c.iniciarSesion(actorConRol(s, rol).id)).json.permisos;
    };
    assert.ok((await permisos(ROLES.DUENO)).includes('historial:consultar'));
    assert.ok((await permisos(ROLES.ADMINISTRADOR)).includes('historial:consultar'));
    assert.equal((await permisos(ROLES.VENDEDOR)).includes('historial:consultar'), false);
  });

  test('RECORRIDO COMPLETO: el vendedor opera, cierra sesión, y el dueño ve su acción en el historial', async () => {
    const v = servidor.crearCliente();
    await v.iniciarSesion(1);
    assert.equal((await v.post('/api/propuestas', propuesta)).estado, 201);
    await v.delete('/api/sesion');
    const d = servidor.crearCliente();
    await d.iniciarSesion(dueno(s).id);
    const r = await d.get('/api/historial?usuarioId=1&tipoElemento=Propuesta');
    assert.equal(r.json.entradas[0].accion, 'Registro de propuesta');
    assert.equal(r.json.entradas[0].usuarioNombre, 'Laura Gómez (demo)');
  });

  test('la consulta es de solo lectura: otros métodos no están permitidos', async () => {
    const c = servidor.crearCliente();
    await c.iniciarSesion(dueno(s).id);
    for (const metodo of ['POST', 'PUT', 'PATCH', 'DELETE']) assert.equal((await c.pedir(metodo, '/api/historial', {})).estado, 405, metodo);
  });
});
