'use strict';

const { crearServidor } = require('../../src/views/servidor');

/**
 * Levanta el servidor real en un puerto efímero de 127.0.0.1 y devuelve un cliente HTTP con
 * "jar" de cookies (una sesión por cliente). Es una prueba de integración de la capa de vistas.
 *
 * @param {object} controladores fachadas del sistema.
 * @returns {Promise<{url: string, cerrar: () => Promise<void>, crearCliente: () => object}>}
 */
async function iniciarServidor(controladores) {
  const servidor = crearServidor(controladores, { registrarError: () => {} });
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  const url = `http://127.0.0.1:${servidor.address().port}`;

  function crearCliente() {
    let cookie = null;
    async function pedir(metodo, ruta, cuerpo, cabeceras = {}) {
      const respuesta = await fetch(url + ruta, {
        method: metodo,
        headers: {
          ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
          ...cabeceras,
        },
        body: cuerpo === undefined ? undefined : typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
      });
      const set = respuesta.headers.get('set-cookie');
      if (set) cookie = set.startsWith('pana_sid=;') ? null : set.split(';')[0];
      const texto = await respuesta.text();
      let json = null;
      try {
        json = JSON.parse(texto);
      } catch {
        /* respuesta no JSON (archivos estáticos) */
      }
      return { estado: respuesta.status, cabeceras: respuesta.headers, json, texto };
    }
    return {
      pedir,
      get: (ruta, cabeceras) => pedir('GET', ruta, undefined, cabeceras),
      post: (ruta, cuerpo, cabeceras) => pedir('POST', ruta, cuerpo ?? {}, cabeceras),
      patch: (ruta, cuerpo) => pedir('PATCH', ruta, cuerpo ?? {}),
      delete: (ruta) => pedir('DELETE', ruta, {}),
      /** Abre sesión con el usuario ficticio indicado. */
      async iniciarSesion(usuarioId) {
        const r = await pedir('POST', '/api/sesion', { usuarioId });
        if (r.estado !== 200) throw new Error(`No se pudo iniciar sesión: ${r.estado}`);
        return r;
      },
    };
  }

  return {
    url,
    crearCliente,
    cerrar: () => new Promise((resolver) => servidor.close(resolver)),
  };
}

module.exports = { iniciarServidor };
