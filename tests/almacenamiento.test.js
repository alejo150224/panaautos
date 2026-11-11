'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const AlmacenamientoMemoria = require('../src/dao/almacenamiento/AlmacenamientoMemoria');
const AlmacenamientoJson = require('../src/dao/almacenamiento/AlmacenamientoJson');
const ErrorAlmacenamiento = require('../src/dao/almacenamiento/ErrorAlmacenamiento');
const VehiculoDAO = require('../src/dao/VehiculoDAO');
const { crearDatosFicticios } = require('../src/dao/datosFicticios');
const { ESTADOS_VEHICULO } = require('../src/models/enums');

function carpetaTemporal() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'panaautos-test-'));
}

describe('Almacenamiento en memoria: transacciones atómicas', () => {
  test('confirma todos los cambios de una transacción exitosa', () => {
    const alm = new AlmacenamientoMemoria(crearDatosFicticios());
    const dao = new VehiculoDAO(alm);
    alm.transaccion(() => {
      dao.cambiarEstado(1, ESTADOS_VEHICULO.VENDIDO);
      dao.cambiarEstado(2, ESTADOS_VEHICULO.VENDIDO);
    });
    assert.equal(dao.porId(1).estado, ESTADOS_VEHICULO.VENDIDO);
    assert.equal(dao.porId(2).estado, ESTADOS_VEHICULO.VENDIDO);
  });

  test('revierte TODO si la función lanza una excepción (sin operación parcial)', () => {
    const alm = new AlmacenamientoMemoria(crearDatosFicticios());
    const dao = new VehiculoDAO(alm);
    assert.throws(() =>
      alm.transaccion(() => {
        dao.cambiarEstado(1, ESTADOS_VEHICULO.VENDIDO);
        throw new Error('fallo intermedio');
      }), /fallo intermedio/);
    assert.equal(dao.porId(1).estado, ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('revierte si falla la persistencia (simula disco lleno)', () => {
    class AlmacenamientoQueFalla extends AlmacenamientoMemoria {
      _persistir() {
        throw new ErrorAlmacenamiento('disco lleno');
      }
    }
    const alm = new AlmacenamientoQueFalla(crearDatosFicticios());
    const dao = new VehiculoDAO(alm);
    assert.throws(() => dao.cambiarEstado(1, ESTADOS_VEHICULO.VENDIDO), ErrorAlmacenamiento);
    assert.equal(dao.porId(1).estado, ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('las transacciones anidadas se unen a la externa', () => {
    const alm = new AlmacenamientoMemoria(crearDatosFicticios());
    const dao = new VehiculoDAO(alm);
    assert.throws(() =>
      alm.transaccion(() => {
        dao.cambiarEstado(1, ESTADOS_VEHICULO.VENDIDO); // transacción interna
        throw new Error('la externa falla');
      }));
    assert.equal(dao.porId(1).estado, ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('rechaza funciones asíncronas dentro de una transacción', () => {
    const alm = new AlmacenamientoMemoria(crearDatosFicticios());
    assert.throws(() => alm.transaccion(async () => 1), /síncronas/);
  });

  test('siguienteId no funciona fuera de una transacción', () => {
    const alm = new AlmacenamientoMemoria(crearDatosFicticios());
    assert.throws(() => alm.siguienteId('vehiculos'), ErrorAlmacenamiento);
  });

  test('los identificadores no se reutilizan aunque falle una inserción', () => {
    const alm = new AlmacenamientoMemoria(crearDatosFicticios());
    const dao = new VehiculoDAO(alm);
    const base = { marca: 'X', modelo: 'Y', anio: 2020, precio: 1, estado: ESTADOS_VEHICULO.DISPONIBLE };
    const primero = dao.insertar(base);
    assert.throws(() =>
      alm.transaccion(() => {
        dao.insertar(base);
        throw new Error('cancelada');
      }));
    const segundo = dao.insertar(base);
    assert.equal(segundo.id, primero.id + 1);
  });
});

describe('DAO: devuelve copias y no expone el estado interno', () => {
  test('modificar una entidad devuelta no altera los datos guardados', () => {
    const alm = new AlmacenamientoMemoria(crearDatosFicticios());
    const dao = new VehiculoDAO(alm);
    const copia = dao.porId(1);
    copia.estado = ESTADOS_VEHICULO.VENDIDO;
    assert.equal(dao.porId(1).estado, ESTADOS_VEHICULO.DISPONIBLE);
  });

  test('actualizar un id inexistente falla de forma explícita', () => {
    const dao = new VehiculoDAO(new AlmacenamientoMemoria(crearDatosFicticios()));
    assert.throws(() => dao.cambiarEstado(999, ESTADOS_VEHICULO.VENDIDO), /No existe/);
  });
});

describe('Almacenamiento JSON: persistencia durable (aislada en carpeta temporal)', () => {
  test('crea el archivo con la semilla y conserva los cambios al volver a abrirlo', () => {
    const carpeta = carpetaTemporal();
    const ruta = path.join(carpeta, 'datos.json');
    try {
      const primera = new AlmacenamientoJson(ruta, { semilla: () => crearDatosFicticios() });
      new VehiculoDAO(primera).cambiarEstado(1, ESTADOS_VEHICULO.VENDIDO);

      // "Reinicio": una instancia nueva lee el archivo y NO vuelve a sembrar.
      const segunda = new AlmacenamientoJson(ruta, { semilla: () => crearDatosFicticios() });
      assert.equal(new VehiculoDAO(segunda).porId(1).estado, ESTADOS_VEHICULO.VENDIDO);
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });

  test('si el guardado falla, la transacción se revierte y el archivo no cambia', () => {
    const carpeta = carpetaTemporal();
    const ruta = path.join(carpeta, 'datos.json');
    try {
      const alm = new AlmacenamientoJson(ruta, { semilla: () => crearDatosFicticios() });
      const dao = new VehiculoDAO(alm);
      const antes = fs.readFileSync(ruta, 'utf8');
      alm._ruta = path.join(carpeta, 'no-existe', '\0invalida'); // ruta imposible de escribir
      assert.throws(() => dao.cambiarEstado(1, ESTADOS_VEHICULO.VENDIDO), ErrorAlmacenamiento);
      assert.equal(dao.porId(1).estado, ESTADOS_VEHICULO.DISPONIBLE);
      assert.equal(fs.readFileSync(ruta, 'utf8'), antes);
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });

  test('un archivo corrupto no se sobrescribe y se informa el problema', () => {
    const carpeta = carpetaTemporal();
    const ruta = path.join(carpeta, 'datos.json');
    try {
      fs.writeFileSync(ruta, '{ esto no es json');
      assert.throws(() => new AlmacenamientoJson(ruta, { semilla: () => crearDatosFicticios() }), /no contiene JSON válido/);
      assert.equal(fs.readFileSync(ruta, 'utf8'), '{ esto no es json');
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });

  test('no deja archivos temporales después de guardar', () => {
    const carpeta = carpetaTemporal();
    const ruta = path.join(carpeta, 'datos.json');
    try {
      const alm = new AlmacenamientoJson(ruta, { semilla: () => crearDatosFicticios() });
      new VehiculoDAO(alm).cambiarEstado(2, ESTADOS_VEHICULO.VENDIDO);
      assert.deepEqual(fs.readdirSync(carpeta), ['datos.json']);
    } finally {
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });
});

describe('Datos ficticios', () => {
  test('incluyen vehículos en los tres estados y no contienen secretos', () => {
    const datos = crearDatosFicticios();
    const estados = new Set(datos.vehiculos.map((v) => v.estado));
    assert.deepEqual([...estados].sort(), Object.values(ESTADOS_VEHICULO).sort());
    const texto = JSON.stringify(datos).toLowerCase();
    for (const prohibido of ['password', 'contraseña', 'token', 'secret']) {
      assert.equal(texto.includes(prohibido), false, `no debe contener "${prohibido}"`);
    }
  });

  test('la variante vacía no tiene vehículos', () => {
    const datos = crearDatosFicticios({ conInventario: false });
    assert.deepEqual(datos.vehiculos, []);
    assert.equal(datos.secuencias.vehiculos, 0);
  });
});
