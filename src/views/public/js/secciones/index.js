// Registro de secciones de la interfaz. Cada historia añade aquí su sección.
// Forma: { id, titulo, permiso, montar(contenedor, contexto) }
//   permiso: null = pública (no exige sesión); texto = permiso que concede el controlador.

import { catalogo } from './catalogo.js'; // HU06 (pública)
import { inventario } from './inventario.js'; // HU01
import { ventas } from './ventas.js'; // HU05

export const SECCIONES = [
  catalogo,
  inventario,
  ventas,
];
