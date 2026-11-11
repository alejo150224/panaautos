# Registro de pruebas ejecutadas

> Todas las ejecuciones son **locales** (macOS, Node v22.14.0), con almacenamiento aislado (memoria o carpetas temporales). **No hay resultados de CI de GitHub verificados**: el workflow existe en `.github/workflows/ci.yml` y los PR #11–#22 están abiertos, pero al corte GitHub no registraba ejecuciones (Actions habilitado). Por verificar. "Número de pruebas" no es cobertura: no se midió cobertura de código.

**Comando:** `npm test` (equivale a `node --test "tests/**/*.test.js"`) · **Fecha:** 2026-11-10

| Rama | Commit | Pruebas acumuladas | Resultado |
|---|---|---:|---|
| `chore/soporte-arquitectura-tres-capas` | ab80d28 | 61 | 61 pasan · 0 fallan |
| `feature/issue-1-consultar-inventario` | 54f2cbd | 82 | 82 pasan · 0 fallan |
| `feature/issue-5-registrar-venta` | 41d7d95 | 149 | 149 pasan · 0 fallan |
| `feature/issue-6-registrar-solicitud` | da07f77 | 184 | 184 pasan · 0 fallan |
| `feature/issue-7-consultar-solicitudes` | d0f4fe4 | 198 | 198 pasan · 0 fallan |
| `feature/issue-8-actualizar-estado-solicitud` | 7d2aa95 | 223 | 223 pasan · 0 fallan |
| `feature/issue-2-registrar-propuesta` | e2de143 | 262 | 262 pasan · 0 fallan |
| `feature/issue-3-aprobar-propuesta` | e0bba3a | 274 | 274 pasan · 0 fallan |
| `feature/issue-4-rechazar-propuesta` | 966a972 | 288 | 288 pasan · 0 fallan |
| `feature/issue-9-registro-automatico-acciones` | e7124c7 | 314 | 314 pasan · 0 fallan |
| `feature/issue-10-consultar-historial` | 6eddc45 | 346 | 346 pasan · 0 fallan |

## Incidentes durante las pruebas (corregidos, no ocultados)

1. **HU08 (prueba):** una aserción comparaba un objeto plano con una instancia del modelo (`deepStrictEqual` compara prototipos). Falló 1 prueba; se corrigió la prueba (comparar `{ ...antes }`), sin quitar ninguna aserción.
2. **Menú de la interfaz vacío tras iniciar sesión:** defecto real de `app.js` (`replaceChildren` recibía un arreglo). Lo detectó el recorrido manual en el navegador, no las pruebas de servidor. Se corrigió (commit `ab80d28`) y se añadió una prueba estática que impide repetirlo.
3. **Mensajes de commit** de HU03, HU04, HU07 y HU08 declaraban un número de pruebas nuevas estimado de forma incorrecta; se reescribieron con la cifra real antes de publicar.

## Verificación de que una prueba clave detecta el defecto (mutación manual)

Se sustituyó el almacenamiento transaccional por uno que ejecuta sin revertir y se repitió el escenario "falla el cambio de estado después de guardar la venta": con el mutante quedó **1 venta guardada**, mientras que la prueba real exige **0**; por tanto la prueba de atomicidad de HU05 detectaría ese defecto.

## Verificaciones manuales en navegador (2026-11-10, servidor local, datos ficticios)

- Vendedor: registra una venta (precio autocompletado) → aviso de confirmación → el inventario muestra el vehículo "Vendido".
- Dueño: ve "Historial" con la entrada "Registro de venta"; propuesta registrada por el encargado → rechazo con confirmación en pantalla → "Rechazada"; filtros de historial por tipo.
- Anónimo: solo ve el catálogo; formulario público sin contacto muestra el error y con correo muestra la confirmación; el vendedor ve la solicitud, el detalle y cambia el estado.
- Administrador: menú Inventario e Historial (sin Propuestas ni Ventas).
- **Capturas de pantalla:** pendientes (no se generan imágenes simuladas; ver `DOCS/12`).
