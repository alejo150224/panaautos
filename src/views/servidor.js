'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  ErrorValidacion,
  ErrorNoAutenticado,
  ErrorPermiso,
  ErrorNoEncontrado,
  ErrorConflicto,
} = require('../controllers/errores');
const { crearRutas } = require('./rutas');

/**
 * Capa de PRESENTACIÓN (HTTP). Recibe únicamente los controladores (fachadas): nunca los DAO.
 * Responsabilidad: traducir peticiones HTTP a llamadas del controlador y errores de negocio a
 * respuestas. Sirve la interfaz estática de `public/`. Escucha solo en 127.0.0.1 (ver index.js).
 */

const RAIZ_PUBLICA = path.join(__dirname, 'public');
const COOKIE_SESION = 'pana_sid';
const LIMITE_CUERPO = 64 * 1024;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};
const CABECERAS_SEGURIDAD = {
  'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

/** Error HTTP propio de esta capa (cuerpo demasiado grande, JSON inválido, etc.). */
class ErrorHttp extends Error {
  constructor(estado, codigo, mensaje) {
    super(mensaje);
    this.estado = estado;
    this.codigo = codigo;
  }
}

/** Convierte '/api/solicitudes/:id' en { metodo, regex, nombres, manejador }. */
function compilarRuta(ruta) {
  const nombres = [];
  const patron = ruta.ruta.replace(/:([A-Za-z]+)/g, (_, nombre) => {
    nombres.push(nombre);
    return '([^/]+)';
  });
  return { ...ruta, regex: new RegExp(`^${patron}$`), nombres };
}

/** @returns {Promise<object>} cuerpo JSON (objeto vacío si no hay cuerpo). */
function leerCuerpo(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    let tamano = 0;
    let excedido = false;
    req.on('data', (parte) => {
      tamano += parte.length;
      if (tamano > LIMITE_CUERPO) {
        if (!excedido) reject(new ErrorHttp(413, 'CUERPO_GRANDE', 'El cuerpo de la petición es demasiado grande'));
        excedido = true;
        return;
      }
      partes.push(parte);
    });
    req.on('error', reject);
    req.on('end', () => {
      if (excedido) return;
      const crudo = Buffer.concat(partes).toString('utf8').trim();
      if (!crudo) return resolve({});
      try {
        const dato = JSON.parse(crudo);
        resolve(dato !== null && typeof dato === 'object' && !Array.isArray(dato) ? dato : {});
      } catch {
        reject(new ErrorHttp(400, 'JSON_INVALIDO', 'El cuerpo no es un JSON válido'));
      }
    });
  });
}

/** @returns {{estado: number, cuerpo: object}} respuesta HTTP equivalente a un error. */
function traducirError(error, registrarError) {
  if (error instanceof ErrorValidacion) {
    return { estado: 400, cuerpo: { error: { codigo: 'VALIDACION', mensaje: error.message, detalles: error.detalles } } };
  }
  if (error instanceof ErrorNoAutenticado) {
    return { estado: 401, cuerpo: { error: { codigo: 'NO_AUTENTICADO', mensaje: error.message } } };
  }
  if (error instanceof ErrorPermiso) {
    return { estado: 403, cuerpo: { error: { codigo: 'SIN_PERMISO', mensaje: error.message } } };
  }
  if (error instanceof ErrorNoEncontrado) {
    return { estado: 404, cuerpo: { error: { codigo: 'NO_ENCONTRADO', mensaje: error.message } } };
  }
  if (error instanceof ErrorConflicto) {
    return { estado: 409, cuerpo: { error: { codigo: 'CONFLICTO', mensaje: error.message } } };
  }
  if (error instanceof ErrorHttp) {
    return { estado: error.estado, cuerpo: { error: { codigo: error.codigo, mensaje: error.message } } };
  }
  registrarError(error);
  return { estado: 500, cuerpo: { error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error interno. Intente de nuevo.' } } };
}

function leerCookie(req, nombre) {
  const crudo = req.headers.cookie ?? '';
  for (const par of crudo.split(';')) {
    const [clave, ...resto] = par.trim().split('=');
    if (clave === nombre) return resto.join('=');
  }
  return null;
}

function enviarJson(res, estado, cuerpo, cabeceras = {}) {
  const datos = JSON.stringify(cuerpo);
  res.writeHead(estado, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(datos),
    'Cache-Control': 'no-store',
    ...CABECERAS_SEGURIDAD,
    ...cabeceras,
  });
  res.end(datos);
}

/**
 * Crea el servidor HTTP de la aplicación.
 *
 * @param {object} controladores fachadas de negocio (SesionController, etc.).
 * @param {{registrarError?: (e: unknown) => void}} [opciones]
 * @returns {import('node:http').Server} servidor sin iniciar (llame a `listen`).
 */
function crearServidor(controladores, { registrarError = (e) => console.error(e) } = {}) {
  /** Sesiones de demostración en memoria: token → id de usuario. Se pierden al reiniciar. */
  const sesiones = new Map();

  const rutasSesion = [
    {
      metodo: 'GET',
      ruta: '/api/usuarios-demo',
      manejador: () => ({ estado: 200, cuerpo: controladores.sesion.listarUsuariosDemo() }),
    },
    {
      metodo: 'GET',
      ruta: '/api/sesion',
      manejador: ({ actor }) => ({ estado: 200, cuerpo: controladores.sesion.describirSesion(actor) }),
    },
    {
      metodo: 'POST',
      ruta: '/api/sesion',
      manejador: ({ cuerpo }) => {
        const usuario = controladores.sesion.iniciarSesion(cuerpo.usuarioId);
        const token = crypto.randomBytes(24).toString('hex');
        sesiones.set(token, usuario.id);
        return {
          estado: 200,
          cuerpo: controladores.sesion.describirSesion(usuario),
          cabeceras: { 'Set-Cookie': `${COOKIE_SESION}=${token}; HttpOnly; SameSite=Strict; Path=/` },
        };
      },
    },
    {
      metodo: 'DELETE',
      ruta: '/api/sesion',
      manejador: ({ token }) => {
        sesiones.delete(token);
        return {
          estado: 200,
          cuerpo: { ok: true },
          cabeceras: { 'Set-Cookie': `${COOKIE_SESION}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0` },
        };
      },
    },
  ];

  const rutas = [...rutasSesion, ...crearRutas(controladores)].map(compilarRuta);

  /** Resuelve el actor de la petición a partir de la cookie de sesión. */
  function resolverActor(req) {
    const token = leerCookie(req, COOKIE_SESION);
    const usuarioId = token ? sesiones.get(token) : undefined;
    if (usuarioId === undefined) return { token: null, actor: null };
    const actor = controladores.sesion.obtenerUsuario(usuarioId);
    if (!actor) sesiones.delete(token);
    return { token, actor };
  }

  async function manejarApi(req, res, url) {
    const candidatas = rutas
      .map((ruta) => ({ ruta, coincidencia: ruta.regex.exec(url.pathname) }))
      .filter((c) => c.coincidencia);
    if (candidatas.length === 0) throw new ErrorHttp(404, 'RUTA_NO_ENCONTRADA', 'La ruta solicitada no existe');

    const elegida = candidatas.find((c) => c.ruta.metodo === req.method);
    if (!elegida) {
      const permitidos = [...new Set(candidatas.map((c) => c.ruta.metodo))].join(', ');
      const error = new ErrorHttp(405, 'METODO_NO_PERMITIDO', 'Método no permitido para esta ruta');
      error.permitidos = permitidos;
      throw error;
    }

    if (!['GET', 'HEAD'].includes(req.method) && req.headers.origin) {
      let mismoOrigen = false;
      try {
        mismoOrigen = new URL(req.headers.origin).host === req.headers.host;
      } catch {
        mismoOrigen = false;
      }
      if (!mismoOrigen) throw new ErrorHttp(403, 'ORIGEN_NO_PERMITIDO', 'Origen no permitido');
    }

    const params = {};
    elegida.ruta.nombres.forEach((nombre, i) => {
      params[nombre] = decodeURIComponent(elegida.coincidencia[i + 1]);
    });
    const query = Object.fromEntries(url.searchParams.entries());
    const cuerpo = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await leerCuerpo(req) : {};
    const { token, actor } = resolverActor(req);

    const respuesta = elegida.ruta.manejador({ actor, params, query, cuerpo, token });
    enviarJson(res, respuesta.estado, respuesta.cuerpo, respuesta.cabeceras);
  }

  async function servirEstatico(req, res, url) {
    if (!['GET', 'HEAD'].includes(req.method)) {
      throw new ErrorHttp(405, 'METODO_NO_PERMITIDO', 'Método no permitido');
    }
    const ruta = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!/^\/[A-Za-z0-9_\-/]+\.(js|css|svg|html)$/.test(ruta) || ruta.includes('..')) {
      throw new ErrorHttp(404, 'RUTA_NO_ENCONTRADA', 'Recurso no encontrado');
    }
    const archivo = path.join(RAIZ_PUBLICA, ruta);
    if (!archivo.startsWith(RAIZ_PUBLICA + path.sep)) {
      throw new ErrorHttp(404, 'RUTA_NO_ENCONTRADA', 'Recurso no encontrado');
    }
    let contenido;
    try {
      contenido = await fs.promises.readFile(archivo);
    } catch {
      throw new ErrorHttp(404, 'RUTA_NO_ENCONTRADA', 'Recurso no encontrado');
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo)],
      'Content-Length': contenido.length,
      'Cache-Control': 'no-cache',
      ...CABECERAS_SEGURIDAD,
    });
    res.end(req.method === 'HEAD' ? undefined : contenido);
  }

  return http.createServer(async (req, res) => {
    try {
      let url;
      try {
        url = new URL(req.url, 'http://localhost');
      } catch {
        throw new ErrorHttp(400, 'URL_INVALIDA', 'La dirección solicitada no es válida');
      }
      if (url.pathname.startsWith('/api/')) await manejarApi(req, res, url);
      else await servirEstatico(req, res, url);
    } catch (error) {
      const { estado, cuerpo } = traducirError(error, registrarError);
      const cabeceras = error.permitidos ? { Allow: error.permitidos } : {};
      if (!res.headersSent) enviarJson(res, estado, cuerpo, cabeceras);
      else res.end();
    }
  });
}

module.exports = { crearServidor };
