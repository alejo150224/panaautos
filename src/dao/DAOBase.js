'use strict';

/**
 * Clase base de los DAO (Data Access Object). Encapsula el acceso al almacenamiento: la lógica de
 * negocio consume datos sin saber cómo ni dónde se guardan (patrón de la guía, Fase 3).
 * Un DAO NUNCA genera HTML ni aplica reglas comerciales; solo lee y escribe entidades.
 *
 * Los métodos devuelven COPIAS (instancias nuevas del modelo): modificar el resultado no altera los
 * datos guardados hasta llamar a `actualizar`. Toda escritura es una transacción propia y se une
 * a la transacción activa si el controlador abrió una.
 */
class DAOBase {
  /**
   * @param {import('./almacenamiento/AlmacenamientoMemoria')} almacenamiento adaptador de datos.
   * @param {string} coleccion nombre de la colección.
   * @param {new (datos: object) => object} Modelo clase de la entidad.
   */
  constructor(almacenamiento, coleccion, Modelo) {
    this.almacenamiento = almacenamiento;
    this.coleccion = coleccion;
    this.Modelo = Modelo;
  }

  /** @returns {Array<object>} filas vivas de la colección (uso interno). */
  _filas() {
    return this.almacenamiento.coleccion(this.coleccion);
  }

  /**
   * Contrato: retorna todas las entidades.
   * @returns {Array<object>}
   */
  todos() {
    return this._filas().map((fila) => new this.Modelo(fila));
  }

  /**
   * Contrato: busca una entidad por su identificador.
   * @param {number} id
   * @returns {object|null} copia de la entidad, o null si no existe.
   */
  porId(id) {
    const fila = this._filas().find((f) => f.id === id);
    return fila ? new this.Modelo(fila) : null;
  }

  /**
   * Contrato: inserta una entidad nueva asignándole un identificador único y creciente.
   * @param {object} datos campos de la entidad, sin `id`.
   * @returns {object} entidad guardada (con `id`).
   */
  insertar(datos) {
    return this.almacenamiento.transaccion(() => {
      const fila = { ...datos, id: this.almacenamiento.siguienteId(this.coleccion) };
      this._filas().push(fila);
      return new this.Modelo(fila);
    });
  }

  /**
   * Contrato: reemplaza una entidad existente.
   * @param {object} entidad debe incluir `id` de una entidad guardada.
   * @returns {object} entidad actualizada.
   * @throws {Error} si el identificador no existe.
   */
  actualizar(entidad) {
    return this.almacenamiento.transaccion(() => {
      const filas = this._filas();
      const indice = filas.findIndex((f) => f.id === entidad.id);
      if (indice < 0) throw new Error(`No existe ${this.coleccion} con id ${entidad.id}`);
      filas[indice] = { ...entidad };
      return new this.Modelo(filas[indice]);
    });
  }
}

module.exports = DAOBase;
