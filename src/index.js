'use strict';

const path = require('node:path');
const { crearSistema } = require('./composicion');
const { crearServidor } = require('./views/servidor');
const AlmacenamientoMemoria = require('./dao/almacenamiento/AlmacenamientoMemoria');
const AlmacenamientoJson = require('./dao/almacenamiento/AlmacenamientoJson');
const { crearDatosFicticios } = require('./dao/datosFicticios');

/**
 * Punto de arranque del prototipo.
 *
 *   npm start                 → almacenamiento JSON local (data/panaautos.json), puerto 3000
 *   npm run start:memoria     → todo en memoria (se pierde al cerrar)
 *   npm run start:vacio       → en memoria y sin vehículos (demuestra el caso vacío de HU01)
 *
 * Opciones: --memoria  --vacio  --puerto=NNNN  --datos=ruta/archivo.json
 * El servidor escucha SOLO en 127.0.0.1: no es accesible desde otras máquinas.
 */

const HOST = '127.0.0.1';

function leerOpcion(argumentos, nombre) {
  const prefijo = `--${nombre}=`;
  const encontrado = argumentos.find((a) => a.startsWith(prefijo));
  return encontrado ? encontrado.slice(prefijo.length) : undefined;
}

function main(argumentos = process.argv.slice(2)) {
  const enMemoria = argumentos.includes('--memoria');
  const vacio = argumentos.includes('--vacio');
  const puerto = Number(leerOpcion(argumentos, 'puerto') ?? process.env.PORT ?? 3000);
  const semilla = () => crearDatosFicticios({ conInventario: !vacio });

  const rutaDatos = path.resolve(leerOpcion(argumentos, 'datos') ?? path.join(__dirname, '..', 'data', 'panaautos.json'));
  const almacenamiento = enMemoria
    ? new AlmacenamientoMemoria(semilla())
    : new AlmacenamientoJson(rutaDatos, { semilla });

  const sistema = crearSistema({ almacenamiento });
  const servidor = crearServidor(sistema.controladores);

  servidor.listen(puerto, HOST, () => {
    const modo = enMemoria ? 'memoria (se pierde al cerrar)' : `archivo JSON ${rutaDatos}`;
    console.log(`PANA AUTOS (prototipo académico) en http://${HOST}:${puerto}`);
    console.log(`Almacenamiento: ${modo}. Datos ficticios. Ctrl+C para detener.`);
  });
  return servidor;
}

if (require.main === module) main();

module.exports = { main };
