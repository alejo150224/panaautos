'use strict';

const fs = require('node:fs');
const path = require('node:path');
const AlmacenamientoMemoria = require('./AlmacenamientoMemoria');
const ErrorAlmacenamiento = require('./ErrorAlmacenamiento');

/**
 * Adaptador de almacenamiento durable sobre un archivo JSON local.
 * Decisión técnica (DOCS/11, D-03): el Definition of Done del repositorio exige "persistencia de
 * datos" y HU09 exige conservar el historial al volver a iniciar sesión; un adaptador local sencillo
 * lo cumple sin conectar bases de datos reales ni añadir dependencias. Mantiene la separación DAO:
 * cambiar a otra base solo exige otro adaptador con la misma interfaz.
 *
 * Escritura atómica: se escribe un archivo temporal y se renombra. Si el guardado falla, la
 * transacción se revierte. LIMITACIÓN: no hay bloqueo entre procesos; dos procesos escribiendo el
 * mismo archivo pueden pisarse. Use una sola instancia del servidor por archivo.
 */
class AlmacenamientoJson extends AlmacenamientoMemoria {
  /**
   * @param {string} ruta ruta del archivo JSON.
   * @param {{semilla?: () => object}} [opciones] genera los datos iniciales si el archivo no existe.
   * @throws {ErrorAlmacenamiento} si el archivo existe pero no es un JSON de objeto (no se sobrescribe).
   */
  constructor(ruta, { semilla } = {}) {
    const existe = fs.existsSync(ruta);
    let datos = {};
    if (existe) {
      try {
        datos = JSON.parse(fs.readFileSync(ruta, 'utf8'));
      } catch (causa) {
        throw new ErrorAlmacenamiento(
          `El archivo de datos "${ruta}" no contiene JSON válido; no se sobrescribe. ` +
            'Revíselo o bórrelo manualmente (npm run demo:reiniciar).',
          { cause: causa },
        );
      }
      if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
        throw new ErrorAlmacenamiento(`El archivo de datos "${ruta}" no tiene la estructura esperada.`);
      }
    } else if (semilla) {
      datos = semilla();
    }
    super(datos);
    this._ruta = ruta;
    if (!existe) this._persistir(this._datos);
  }

  /** @returns {string} ruta del archivo de datos. */
  get ruta() {
    return this._ruta;
  }

  /**
   * Escribe el estado completo de forma atómica (archivo temporal + renombrado).
   * @param {object} datos
   * @throws {ErrorAlmacenamiento} si no se puede escribir.
   */
  _persistir(datos) {
    const temporal = `${this._ruta}.tmp`;
    try {
      fs.mkdirSync(path.dirname(this._ruta), { recursive: true });
      fs.writeFileSync(temporal, `${JSON.stringify(datos, null, 2)}\n`, 'utf8');
      fs.renameSync(temporal, this._ruta);
    } catch (causa) {
      throw new ErrorAlmacenamiento('No fue posible guardar los datos', { cause: causa });
    }
  }
}

module.exports = AlmacenamientoJson;
