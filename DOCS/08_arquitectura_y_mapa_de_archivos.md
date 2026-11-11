# Arquitectura y mapa de archivos (material de apoyo)

## 1. Las tres capas

```
 Navegador (HTML/CSS/JS)            ← interfaz en src/views/public
        │  HTTP + JSON
 ┌──────▼───────────────┐
 │ PRESENTACIÓN         │ src/views            servidor.js, rutas/*.js, public/
 │  (traduce HTTP)      │ solo conoce controladores
 ├──────────────────────┤
 │ LÓGICA DE NEGOCIO    │ src/controllers      Facade: reglas, permisos, validaciones,
 │  (reglas y fachada)  │                      transacciones y auditoría
 ├──────────────────────┤
 │ ACCESO A DATOS       │ src/dao              DAO por entidad + adaptadores de almacenamiento
 └──────┬───────────────┘
        │  memoria  |  archivo JSON local
 src/models: entidades (Vehiculo, Venta, Solicitud, Propuesta, EntradaHistorial, …) y enums
```

- **La vista no consulta el DAO ni contiene reglas comerciales; el DAO no genera HTML.** Lo verifica `tests/arquitectura.test.js` leyendo los `require` de cada archivo.
- `src/composicion.js` (raíz de composición) crea DAO y controladores y los inyecta; devuelve `controladores` (lo único que ve la vista) y `dao` (para pruebas).
- Los modelos no son una cuarta capa: son los datos que cruzan las tres.

## 2. Qué se pierde al reiniciar según el almacenamiento

| Adaptador | Cuándo se usa | Al reiniciar |
|---|---|---|
| `AlmacenamientoMemoria` | pruebas y `npm run start:memoria` / `start:vacio` | **se pierde todo** (datos, ventas, historial) |
| `AlmacenamientoJson` | `npm start` (archivo `data/panaautos.json`, ignorado por Git) | **se conserva**; las sesiones de demostración (cookies) sí se pierden |

La guía ilustra almacenamiento en memoria. Se añadió el adaptador JSON porque el *Definition of Done* del repositorio exige "persistencia de datos" y HU09 exige conservar el historial al volver a iniciar sesión (decisión D-03 en `DOCS/11`).

## 3. Transacciones, venta y auditoría

`AlmacenamientoMemoria.transaccion(fn)` copia todos los datos en un borrador, ejecuta `fn` sobre el borrador y lo confirma de una vez (en JSON, escribiendo archivo temporal + renombrado). Si `fn` lanza una excepción o el guardado falla, no cambia nada. Como `fn` es **síncrona** y Node ejecuta un solo hilo, dos operaciones del mismo proceso nunca se intercalan. **No hay garantía entre procesos** distintos sobre el mismo archivo.

`VentaController.registrarVenta` guarda la venta, cambia el vehículo a "Vendido" y registra la entrada de historial **dentro de la misma transacción**.

## 4. Mapa de archivos importantes

| Archivo | Responsabilidad |
|---|---|
| `src/index.js` | arranque (opciones `--memoria`, `--vacio`, `--puerto`, `--datos`; escucha solo en 127.0.0.1) |
| `src/composicion.js` | conexión de capas |
| `src/models/enums.js` | roles, estados, modalidades, orígenes, acciones y tipos (textos idénticos a los Issues) |
| `src/models/*.js` | entidades: `Usuario`, `Cliente`, `Vehiculo`, `Venta`, `Solicitud`, `Propuesta`, `EntradaHistorial` |
| `src/dao/DAOBase.js` | lectura/escritura genérica devolviendo copias |
| `src/dao/*DAO.js` | DAO por entidad (`HistorialDAO`: solo agregar) |
| `src/dao/almacenamiento/` | `AlmacenamientoMemoria`, `AlmacenamientoJson`, `ErrorAlmacenamiento` |
| `src/dao/datosFicticios.js` | datos de demostración reproducibles |
| `src/controllers/permisos.js` | tabla permiso → roles (`exigirPermiso`, `permisosDe`) |
| `src/controllers/errores.js`, `validaciones.js`, `tiempo.js` | errores tipados, validadores puros, zona horaria de Colombia |
| `src/controllers/InventarioController.js` | HU01 |
| `src/controllers/VentaController.js` | HU05 |
| `src/controllers/CatalogoController.js`, `SolicitudController.js` | HU06, HU07, HU08 |
| `src/controllers/PropuestaController.js` | HU02, HU03, HU04 |
| `src/controllers/Auditor.js`, `HistorialController.js` | HU09, HU10 |
| `src/controllers/SesionController.js` | sesión de demostración (sin contraseñas) |
| `src/views/servidor.js` | servidor HTTP, sesiones, cabeceras de seguridad, errores → códigos HTTP |
| `src/views/rutas/*.js` | rutas por historia (solo traducen HTTP ⇄ controlador) |
| `src/views/public/` | interfaz en español (sin dependencias; sin `innerHTML`) |
| `tests/*.test.js` | una suite por historia, más almacenamiento, arquitectura, permisos y servidor |
| `.github/workflows/ci.yml` | CI (`npm test`) — aún sin ejecutar en GitHub |

## 5. Seguridad básica aplicada

Servidor solo en `127.0.0.1`; sesión por cookie `HttpOnly` + `SameSite=Strict`; comprobación de `Origin` en peticiones que modifican; cabeceras CSP y `nosniff`; límite de 64 KB de cuerpo; archivos estáticos con lista de extensiones y sin salir de `public/`; la interfaz escribe texto con nodos de texto (los datos de clientes no inyectan HTML). Sin contraseñas ni tokens en el código ni en los datos.
