'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { crearSistemaDePrueba, actorConRol, crearRelojFijo, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');
const VentaController = require('../src/controllers/VentaController');
const Auditor = require('../src/controllers/Auditor');
const { crearSistema } = require('../src/composicion');
const AlmacenamientoJson = require('../src/dao/almacenamiento/AlmacenamientoJson');
const { crearDatosFicticios } = require('../src/dao/datosFicticios');

/**
 * HU09 — Conservar registro automático de acciones (Issue #9, RF-22, 5 SP, Should Have).
 * CA1: registro de propuesta, aprobación/rechazo, registro de venta y cambio de estado de solicitud,
 *      cuando se completan correctamente, generan una entrada automática.
 * CA2: cada entrada identifica usuario, acción, fecha y hora, tipo de elemento e id del registro.
 * CA3: las entradas se conservan tras cerrar y volver a iniciar sesión y la aplicación no permite
 *      editarlas ni eliminarlas.
 */

const propuesta = { marca: 'Mazda', modelo: '3', anio: 2020, origen: 'Compra directa', precioEstimado: 70000000 };
const venta = { vehiculoId: 1, clienteId: 1, fecha: '2026-11-10', precio: 37000000, modalidad: 'Contado' };
const vendedor = (s) => actorConRol(s, ROLES.VENDEDOR);
const dueno = (s) => actorConRol(s, ROLES.DUENO);
const historial = (s) => s.dao.historial.todos();

describe('HU09 · CA1 — cada operación completada genera una entrada', () => {
  test('el sistema nuevo empieza sin historial (no se inventan eventos retrospectivos)', () => {
    const s = crearSistemaDePrueba(); // incluye un vehículo "Vendido" previo al sistema
    assert.equal(historial(s).length, 0);
  });

  test('registro de propuesta', () => {
    const s = crearSistemaDePrueba();
    const p = s.controladores.propuestas.registrarPropuesta(vendedor(s), propuesta);
    assert.deepEqual(historial(s).map((e) => [e.accion, e.tipoElemento, e.elementoId]), [['Registro de propuesta', 'Propuesta', p.id]]);
  });

  test('aprobación de propuesta', () => {
    const s = crearSistemaDePrueba();
    s.controladores.propuestas.registrarPropuesta(vendedor(s), propuesta);
    s.controladores.propuestas.aprobarPropuesta(dueno(s), 1);
    const ultima = historial(s).at(-1);
    assert.deepEqual([ultima.accion, ultima.tipoElemento, ultima.elementoId, ultima.usuarioId], ['Aprobación de propuesta', 'Propuesta', 1, dueno(s).id]);
  });

  test('rechazo de propuesta', () => {
    const s = crearSistemaDePrueba();
    s.controladores.propuestas.registrarPropuesta(vendedor(s), propuesta);
    s.controladores.propuestas.rechazarPropuesta(dueno(s), 1);
    assert.equal(historial(s).at(-1).accion, 'Rechazo de propuesta');
  });

  test('registro de venta', () => {
    const s = crearSistemaDePrueba();
    const v = s.controladores.ventas.registrarVenta(vendedor(s), venta);
    const e = historial(s)[0];
    assert.deepEqual([e.accion, e.tipoElemento, e.elementoId, e.usuarioId], ['Registro de venta', 'Venta', v.id, vendedor(s).id]);
  });

  test('cambio de estado de solicitud', () => {
    const s = crearSistemaDePrueba();
    s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 1, nombre: 'Ana', telefono: '3001234567' });
    s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, 'En contacto');
    const e = historial(s)[0];
    assert.deepEqual([e.accion, e.tipoElemento, e.elementoId, e.detalle], ['Cambio de estado de solicitud', 'Solicitud', 1, 'Nueva → En contacto']);
  });

  test('un recorrido completo deja una entrada por operación, en orden y con identificadores crecientes', () => {
    const s = crearSistemaDePrueba();
    s.controladores.propuestas.registrarPropuesta(vendedor(s), propuesta);
    s.reloj.avanzar(1000);
    s.controladores.propuestas.aprobarPropuesta(dueno(s), 1);
    s.reloj.avanzar(1000);
    s.controladores.ventas.registrarVenta(vendedor(s), venta);
    s.reloj.avanzar(1000);
    s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 2, nombre: 'Ana', correo: 'ana@example.com' });
    s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, 'Cerrada');
    const h = historial(s);
    assert.deepEqual(h.map((e) => e.id), [1, 2, 3, 4]);
    assert.deepEqual(h.map((e) => e.accion), ['Registro de propuesta', 'Aprobación de propuesta', 'Registro de venta', 'Cambio de estado de solicitud']);
    const fechas = h.map((e) => e.fechaHora);
    assert.deepEqual(fechas, [...fechas].sort());
  });

  test('las operaciones que FALLAN no dejan entrada (validación, permiso, conflicto, inexistente)', () => {
    const s = crearSistemaDePrueba();
    const intentos = [
      () => s.controladores.propuestas.registrarPropuesta(vendedor(s), {}),
      () => s.controladores.propuestas.registrarPropuesta(dueno(s), propuesta),
      () => s.controladores.propuestas.aprobarPropuesta(dueno(s), 99),
      () => s.controladores.ventas.registrarVenta(vendedor(s), { ...venta, precio: 0 }),
      () => s.controladores.ventas.registrarVenta(dueno(s), venta),
      () => s.controladores.ventas.registrarVenta(vendedor(s), { ...venta, vehiculoId: 4 }), // ya vendido
      () => s.controladores.solicitudes.actualizarEstado(vendedor(s), 99, 'Cerrada'),
      () => s.controladores.solicitudes.actualizarEstado(dueno(s), 1, 'Cerrada'),
    ];
    for (const intento of intentos) assert.throws(intento);
    assert.equal(historial(s).length, 0);
  });

  test('la segunda decisión rechazada y la segunda venta rechazada no agregan entradas', () => {
    const s = crearSistemaDePrueba();
    s.controladores.propuestas.registrarPropuesta(vendedor(s), propuesta);
    s.controladores.propuestas.aprobarPropuesta(dueno(s), 1);
    s.controladores.ventas.registrarVenta(vendedor(s), venta);
    const antes = historial(s).length;
    assert.throws(() => s.controladores.propuestas.rechazarPropuesta(dueno(s), 1));
    assert.throws(() => s.controladores.ventas.registrarVenta(vendedor(s), venta));
    assert.equal(historial(s).length, antes);
  });

  test('fijar el mismo estado de solicitud (sin cambio) y las consultas no generan entradas', () => {
    const s = crearSistemaDePrueba();
    s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 1, nombre: 'Ana', telefono: '3001234567' }); // público: no está en HU09
    s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, 'Nueva');
    s.controladores.solicitudes.listarSolicitudes(vendedor(s));
    s.controladores.solicitudes.obtenerSolicitud(vendedor(s), 1);
    s.controladores.inventario.listarInventario(vendedor(s));
    s.controladores.propuestas.listarPropuestas(dueno(s));
    assert.equal(historial(s).length, 0);
  });

  test('ATOMICIDAD: si no se puede guardar la entrada de historial, la operación se revierte', () => {
    const s = crearSistemaDePrueba();
    const auditorQueFalla = new Auditor({ historialDAO: { agregar: () => { throw new Error('fallo del historial'); } }, reloj: s.reloj });
    const ventas = new VentaController({
      ventaDAO: s.dao.ventas, vehiculoDAO: s.dao.vehiculos, clienteDAO: s.dao.clientes,
      almacenamiento: s.almacenamiento, reloj: s.reloj, auditor: auditorQueFalla,
    });
    assert.throws(() => ventas.registrarVenta(vendedor(s), venta), /fallo del historial/);
    assert.equal(s.dao.ventas.todos().length, 0, 'no debe quedar una venta sin su registro de historial');
    assert.equal(s.dao.vehiculos.porId(1).estado, 'Disponible');
  });
});

describe('HU09 · CA2 — contenido de cada entrada', () => {
  test('identifica usuario, acción, fecha y hora, tipo de elemento e identificador del registro', () => {
    const s = crearSistemaDePrueba();
    s.controladores.ventas.registrarVenta(s.dao.usuarios.porId(2), venta);
    const e = historial(s)[0];
    assert.deepEqual({ ...e }, {
      id: 1,
      usuarioId: 2,
      usuarioNombre: 'Carlos Ruiz (demo)',
      usuarioRol: 'vendedor',
      accion: 'Registro de venta',
      fechaHora: '2026-11-10T15:00:00.000Z',
      tipoElemento: 'Venta',
      elementoId: 1,
      detalle: 'Vehículo #1 vendido · Contado',
    });
  });

  test('el responsable es el usuario con sesión, no un dato enviado por el cliente', () => {
    const s = crearSistemaDePrueba();
    s.controladores.ventas.registrarVenta(s.dao.usuarios.porId(1), { ...venta, vendedorId: 2, usuarioId: 4 });
    assert.equal(historial(s)[0].usuarioId, 1);
  });

  test('no guarda contraseñas, tokens ni datos personales del cliente', () => {
    const s = crearSistemaDePrueba();
    s.controladores.solicitudes.registrarSolicitud({ vehiculoId: 1, nombre: 'Persona Secreta', telefono: '3009990000', correo: 'secreta@example.com' });
    s.controladores.solicitudes.actualizarEstado(vendedor(s), 1, 'En contacto');
    s.controladores.ventas.registrarVenta(vendedor(s), venta);
    const texto = JSON.stringify(historial(s));
    for (const prohibido of ['Persona Secreta', '3009990000', 'secreta@example.com', 'password', 'contraseña', 'token', 'pana_sid', 'cookie']) {
      assert.equal(texto.toLowerCase().includes(prohibido.toLowerCase()), false, prohibido);
    }
  });

  test('conserva el nombre y rol del responsable aunque el usuario cambie después', () => {
    const s = crearSistemaDePrueba();
    s.controladores.ventas.registrarVenta(vendedor(s), venta);
    const u = s.dao.usuarios.porId(1);
    u.nombre = 'Nombre Nuevo';
    s.dao.usuarios.actualizar(u);
    assert.equal(historial(s)[0].usuarioNombre, 'Laura Gómez (demo)');
  });
});

describe('HU09 · CA3 — conservación y restricciones de edición', () => {
  test('el DAO del historial es de solo agregar: no ofrece actualizar ni eliminar', () => {
    const s = crearSistemaDePrueba();
    for (const metodo of ['actualizar', 'eliminar', 'borrar', 'insertar', 'modificar', 'limpiar']) {
      assert.equal(typeof s.dao.historial[metodo], 'undefined', metodo);
    }
  });

  test('las entradas devueltas están congeladas: no se pueden editar', () => {
    const s = crearSistemaDePrueba();
    s.controladores.ventas.registrarVenta(vendedor(s), venta);
    const e = historial(s)[0];
    assert.throws(() => { e.accion = 'Otra cosa'; }, TypeError);
    assert.throws(() => { delete e.usuarioId; }, TypeError);
    assert.equal(historial(s)[0].accion, 'Registro de venta');
  });

  test('alterar el arreglo devuelto no modifica el historial guardado', () => {
    const s = crearSistemaDePrueba();
    s.controladores.ventas.registrarVenta(vendedor(s), venta);
    const lista = historial(s);
    lista.pop();
    assert.equal(historial(s).length, 1);
  });

  test('los controladores no exponen operaciones para editar o borrar el historial', () => {
    const s = crearSistemaDePrueba();
    const nombres = Object.values(s.controladores).flatMap((c) => Object.getOwnPropertyNames(Object.getPrototypeOf(c)));
    assert.equal(nombres.some((n) => /historial/i.test(n) && /(editar|actualizar|eliminar|borrar|modificar)/i.test(n)), false);
  });

  test('se conserva tras cerrar y volver a iniciar sesión (HTTP, sesiones distintas)', async () => {
    const s = crearSistemaDePrueba();
    const servidor = await iniciarServidor(s.controladores);
    try {
      const v = servidor.crearCliente();
      await v.iniciarSesion(1);
      assert.equal((await v.post('/api/ventas', venta)).estado, 201);
      await v.delete('/api/sesion'); // cierra sesión
      assert.equal((await v.get('/api/sesion')).json.usuario, null);
      await v.iniciarSesion(2); // otra persona inicia sesión
      assert.equal(historial(s).length, 1);
      assert.equal(historial(s)[0].usuarioId, 1);
    } finally {
      await servidor.cerrar();
    }
  });

  test('se conserva tras reiniciar el servidor (almacenamiento JSON) y sigue creciendo', () => {
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'panaautos-hu09-'));
    const ruta = path.join(carpeta, 'datos.json');
    const semilla = () => crearDatosFicticios();
    try {
      const s1 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }), reloj: crearRelojFijo() });
      s1.controladores.ventas.registrarVenta(s1.dao.usuarios.porId(1), venta);
      const s2 = crearSistema({ almacenamiento: new AlmacenamientoJson(ruta, { semilla }), reloj: crearRelojFijo() });
      assert.deepEqual(s2.dao.historial.todos().map((e) => [e.id, e.accion]), [[1, 'Registro de venta']]);
      s2.controladores.propuestas.registrarPropuesta(s2.dao.usuarios.porId(1), propuesta);
      assert.deepEqual(s2.dao.historial.todos().map((e) => e.id), [1, 2]);
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });

  test('la API no ofrece rutas para editar o eliminar entradas', async () => {
    const s = crearSistemaDePrueba();
    const servidor = await iniciarServidor(s.controladores);
    try {
      const d = servidor.crearCliente();
      await d.iniciarSesion(dueno(s).id);
      for (const metodo of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        for (const ruta of ['/api/historial', '/api/historial/1']) {
          const r = await d.pedir(metodo, ruta, {});
          assert.ok([404, 405].includes(r.estado), `${metodo} ${ruta} → ${r.estado}`);
        }
      }
    } finally {
      await servidor.cerrar();
    }
  });

  test('las operaciones por HTTP dejan su entrada con el responsable de la sesión', async () => {
    const s = crearSistemaDePrueba();
    const servidor = await iniciarServidor(s.controladores);
    try {
      const v = servidor.crearCliente();
      await v.iniciarSesion(1);
      await v.post('/api/propuestas', propuesta);
      const d = servidor.crearCliente();
      await d.iniciarSesion(dueno(s).id);
      await d.post('/api/propuestas/1/aprobar');
      assert.deepEqual(historial(s).map((e) => [e.accion, e.usuarioId]), [['Registro de propuesta', 1], ['Aprobación de propuesta', dueno(s).id]]);
    } finally {
      await servidor.cerrar();
    }
  });
});
