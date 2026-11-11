'use strict';

const { ROLES, ESTADOS_VEHICULO } = require('../models/enums');

/**
 * Datos 100 % ficticios y reproducibles para demostración y pruebas.
 * No provienen de ninguna base real ni del otro proyecto (Laravel). Los correos usan el dominio
 * reservado example.com y los teléfonos son inventados. No contienen contraseñas ni tokens.
 *
 * El vehículo 4 figura "Vendido" como dato histórico previo al sistema: no tiene registro de venta
 * ni de auditoría porque no se inventan eventos retrospectivos.
 *
 * @param {{conInventario?: boolean}} [opciones] con `conInventario: false` se obtiene el caso vacío (HU01).
 * @returns {object} estado inicial completo del almacenamiento.
 */
function crearDatosFicticios({ conInventario = true } = {}) {
  const usuarios = [
    { id: 1, nombre: 'Laura Gómez (demo)', rol: ROLES.VENDEDOR, activo: true },
    { id: 2, nombre: 'Carlos Ruiz (demo)', rol: ROLES.VENDEDOR, activo: true },
    { id: 3, nombre: 'Marta Ortiz (demo)', rol: ROLES.ENCARGADO_INVENTARIO, activo: true },
    { id: 4, nombre: 'Andrés Pérez (demo)', rol: ROLES.DUENO, activo: true },
    { id: 5, nombre: 'Sofía Rojas (demo)', rol: ROLES.ADMINISTRADOR, activo: true },
  ];

  const clientes = [
    { id: 1, nombre: 'Camila Herrera', telefono: '3001110001', correo: 'camila.herrera@example.com' },
    { id: 2, nombre: 'Julián Torres', telefono: '3001110002', correo: 'julian.torres@example.com' },
    { id: 3, nombre: 'Valentina Mora', telefono: '3001110003', correo: '' },
    { id: 4, nombre: 'Esteban Cruz', telefono: '', correo: 'esteban.cruz@example.com' },
    { id: 5, nombre: 'Daniela Salazar', telefono: '3001110005', correo: 'daniela.salazar@example.com' },
  ];

  const vehiculos = conInventario
    ? [
        { id: 1, marca: 'Chevrolet', modelo: 'Spark GT', anio: 2021, precio: 38500000, estado: ESTADOS_VEHICULO.DISPONIBLE },
        { id: 2, marca: 'Renault', modelo: 'Duster', anio: 2020, precio: 62000000, estado: ESTADOS_VEHICULO.DISPONIBLE },
        { id: 3, marca: 'Mazda', modelo: 'CX-30', anio: 2022, precio: 98000000, estado: ESTADOS_VEHICULO.DISPONIBLE },
        { id: 4, marca: 'Kia', modelo: 'Picanto', anio: 2019, precio: 32000000, estado: ESTADOS_VEHICULO.VENDIDO },
        { id: 5, marca: 'Toyota', modelo: 'Hilux', anio: 2023, precio: 175000000, estado: ESTADOS_VEHICULO.PROXIMO },
        { id: 6, marca: 'Nissan', modelo: 'Versa', anio: 2021, precio: 54000000, estado: ESTADOS_VEHICULO.DISPONIBLE },
        { id: 7, marca: 'Hyundai', modelo: 'Tucson', anio: 2022, precio: 112000000, estado: ESTADOS_VEHICULO.PROXIMO },
      ]
    : [];

  return {
    secuencias: {
      usuarios: usuarios.length,
      clientes: clientes.length,
      vehiculos: vehiculos.length,
    },
    usuarios,
    clientes,
    vehiculos,
  };
}

module.exports = { crearDatosFicticios };
