'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { crearSistemaDePrueba, actorConRol, ROLES } = require('./helpers/sistema');
const { iniciarServidor } = require('./helpers/http');

describe('Servidor HTTP: sesión, seguridad básica y archivos estáticos', () => {
  let sistema;
  let servidor;

  before(async () => {
    sistema = crearSistemaDePrueba();
    servidor = await iniciarServidor(sistema.controladores);
  });
  after(() => servidor.cerrar());

  test('sirve la interfaz con cabeceras de seguridad', async () => {
    const r = await servidor.crearCliente().get('/');
    assert.equal(r.estado, 200);
    assert.match(r.texto, /<title>PANA AUTOS/);
    assert.match(r.cabeceras.get('content-security-policy'), /default-src 'self'/);
    assert.equal(r.cabeceras.get('x-content-type-options'), 'nosniff');
  });

  test('no sirve archivos fuera de la carpeta pública (path traversal)', async () => {
    const cliente = servidor.crearCliente();
    for (const ruta of ['/../servidor.js', '/..%2fservidor.js', '/js/../../servidor.js', '/%2e%2e/index.js', '/etc/passwd']) {
      const r = await cliente.get(ruta);
      assert.equal(r.estado, 404, ruta);
    }
  });

  test('solo permite GET/HEAD en archivos estáticos', async () => {
    const r = await servidor.crearCliente().post('/index.html', {});
    assert.equal(r.estado, 405);
  });

  test('ruta de API inexistente devuelve 404 y método no permitido devuelve 405 con Allow', async () => {
    const cliente = servidor.crearCliente();
    assert.equal((await cliente.get('/api/no-existe')).estado, 404);
    const r = await cliente.pedir('PUT', '/api/sesion', {});
    assert.equal(r.estado, 405);
    assert.match(r.cabeceras.get('allow'), /GET/);
  });

  test('sin sesión, GET /api/sesion devuelve permisos vacíos', async () => {
    const r = await servidor.crearCliente().get('/api/sesion');
    assert.equal(r.estado, 200);
    assert.deepEqual(r.json, { usuario: null, permisos: [] });
  });

  test('iniciar y cerrar sesión; la cookie es HttpOnly y SameSite=Strict', async () => {
    const cliente = servidor.crearCliente();
    const dueno = actorConRol(sistema, ROLES.DUENO);
    const login = await cliente.iniciarSesion(dueno.id);
    assert.match(login.cabeceras.get('set-cookie'), /HttpOnly/);
    assert.match(login.cabeceras.get('set-cookie'), /SameSite=Strict/);
    assert.equal(login.json.usuario.rol, ROLES.DUENO);

    assert.equal((await cliente.get('/api/sesion')).json.usuario.id, dueno.id);
    await cliente.delete('/api/sesion');
    assert.equal((await cliente.get('/api/sesion')).json.usuario, null);
  });

  test('iniciar sesión con usuario inexistente o inválido falla', async () => {
    const cliente = servidor.crearCliente();
    assert.equal((await cliente.post('/api/sesion', { usuarioId: 999 })).estado, 404);
    assert.equal((await cliente.post('/api/sesion', { usuarioId: 'abc' })).estado, 400);
    assert.equal((await cliente.post('/api/sesion', {})).estado, 400);
  });

  test('una cookie inventada no otorga sesión', async () => {
    const r = await servidor.crearCliente().get('/api/sesion', { Cookie: 'pana_sid=inventada' });
    assert.deepEqual(r.json, { usuario: null, permisos: [] });
  });

  test('JSON inválido devuelve 400 y un cuerpo enorme devuelve 413', async () => {
    const cliente = servidor.crearCliente();
    assert.equal((await cliente.pedir('POST', '/api/sesion', '{no es json')).estado, 400);
    const grande = JSON.stringify({ usuarioId: 1, basura: 'x'.repeat(100 * 1024) });
    assert.equal((await cliente.pedir('POST', '/api/sesion', grande)).estado, 413);
  });

  test('rechaza peticiones que cambian datos desde otro origen (defensa CSRF adicional)', async () => {
    const r = await servidor.crearCliente().post('/api/sesion', { usuarioId: 1 }, { Origin: 'http://sitio-malicioso.example' });
    assert.equal(r.estado, 403);
  });
});
