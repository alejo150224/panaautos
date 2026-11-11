'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Pruebas de arquitectura: comprueban automáticamente las reglas de las tres capas
 * (presentación, lógica de negocio, acceso a datos) leyendo los `require` de cada archivo.
 *
 * Reglas verificadas:
 *  - views  → solo pueden depender de controllers (nunca de dao ni de models de forma directa).
 *  - controllers → pueden depender de models, dao (tipos) y otros controllers; nunca de views.
 *  - dao → solo de models y de su propio paquete; nunca de controllers ni views.
 *  - models → no dependen de ninguna otra capa del sistema.
 */

const RAIZ = path.join(__dirname, '..', 'src');

function archivosJs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const completa = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'public' ? [] : archivosJs(completa);
    return e.name.endsWith('.js') ? [completa] : [];
  });
}

/** Devuelve las capas internas que requiere un archivo. */
function capasRequeridas(archivo) {
  const codigo = fs.readFileSync(archivo, 'utf8');
  const capas = new Set();
  for (const [, ruta] of codigo.matchAll(/require\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
    const destino = path.relative(RAIZ, path.resolve(path.dirname(archivo), ruta));
    const capa = destino.split(path.sep)[0];
    if (['models', 'dao', 'controllers', 'views'].includes(capa)) capas.add(capa);
  }
  return capas;
}

const PERMITIDAS = {
  models: new Set([]),
  dao: new Set(['models', 'dao']),
  controllers: new Set(['models', 'dao', 'controllers']),
  views: new Set(['controllers', 'views']),
};

describe('Arquitectura en tres capas', () => {
  for (const capa of Object.keys(PERMITIDAS)) {
    const dir = path.join(RAIZ, capa);
    for (const archivo of archivosJs(dir)) {
      const nombre = path.relative(RAIZ, archivo);
      test(`${nombre} respeta las dependencias permitidas de la capa ${capa}`, () => {
        const requeridas = capasRequeridas(archivo);
        // Se permite depender de la propia capa (mismo directorio de primer nivel).
        const ilegales = [...requeridas].filter((c) => c !== capa && !PERMITIDAS[capa].has(c));
        assert.deepEqual(ilegales, [], `${nombre} no debe depender de: ${ilegales.join(', ')}`);
      });
    }
  }

  test('ningún archivo de dao ni de models genera HTML', () => {
    for (const capa of ['dao', 'models']) {
      for (const archivo of archivosJs(path.join(RAIZ, capa))) {
        const codigo = fs.readFileSync(archivo, 'utf8');
        assert.equal(/<\/?(div|table|tr|td|p|span|html|body)\b/i.test(codigo), false, `${archivo} no debe generar HTML`);
      }
    }
  });

  test('la capa de vistas no contiene reglas de negocio de ventas ni de estados', () => {
    for (const archivo of archivosJs(path.join(RAIZ, 'views'))) {
      const codigo = fs.readFileSync(archivo, 'utf8');
      assert.equal(/ESTADOS_VEHICULO|\.cambiarEstado\(/.test(codigo), false, `${archivo} no debe manipular estados de negocio`);
    }
  });

  test('la estructura de carpetas requerida por la guía existe', () => {
    for (const carpeta of ['models', 'dao', 'controllers', 'views']) {
      assert.ok(fs.statSync(path.join(RAIZ, carpeta)).isDirectory(), `falta src/${carpeta}`);
    }
    assert.ok(fs.statSync(path.join(RAIZ, '..', 'tests')).isDirectory());
  });
});
