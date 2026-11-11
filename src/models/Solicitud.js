'use strict';

/**
 * Modelo de datos: solicitud de interés de un cliente por un vehículo (HU06, RF-17).
 * Una solicitud NO reserva ni vende el vehículo: solo registra el interés y su seguimiento.
 */
class Solicitud {
  /**
   * @param {{id: number, vehiculoId: number, nombreCliente: string, telefono?: string, correo?: string,
   *          mensaje?: string, estado: string, fecha: string}} datos
   *        `estado`: uno de ESTADOS_SOLICITUD. `fecha`: instante de registro (ISO 8601, UTC).
   */
  constructor({ id, vehiculoId, nombreCliente, telefono = '', correo = '', mensaje = '', estado, fecha }) {
    this.id = id;
    this.vehiculoId = vehiculoId;
    this.nombreCliente = nombreCliente;
    this.telefono = telefono;
    this.correo = correo;
    this.mensaje = mensaje;
    this.estado = estado;
    this.fecha = fecha;
  }
}

module.exports = Solicitud;
