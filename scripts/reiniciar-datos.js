'use strict';

/**
 * Restablece los datos de demostración: borra ÚNICAMENTE el archivo local data/panaautos.json
 * (datos ficticios que genera la propia aplicación). El siguiente `npm start` lo vuelve a crear.
 */
const fs = require('node:fs');
const path = require('node:path');

const archivo = path.join(__dirname, '..', 'data', 'panaautos.json');

if (fs.existsSync(archivo)) {
  fs.rmSync(archivo);
  console.log(`Datos de demostración eliminados: ${archivo}`);
} else {
  console.log('No había datos de demostración que reiniciar.');
}
