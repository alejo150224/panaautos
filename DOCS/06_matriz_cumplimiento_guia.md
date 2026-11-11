# Matriz de cumplimiento de la guía y trazabilidad (material de apoyo)

> Corte: 2026-11-10 · Guía: *GUÍA PRÁCTICA DE LABORATORIO: GESTIÓN ÁGIL Y DESARROLLO MANTENIBLE* (12 páginas).
> **Criterio de estado:** *Comprobado* = se verificó con una orden o prueba ejecutada. *Implementado* = existe pero su verificación no es automática. *Parcial*. *Pendiente* = no hecho o no verificable aún. Nada planificado se marca como Comprobado.
> Los ejemplos de boletería de la guía (fila virtual, QR, zonas, mapa) **no** son nuestras funcionalidades y no se implementaron.

## A. Requisitos de la guía

| # | Requisito de la guía | Pág. | Evidencia existente | Brecha | Acción / archivo | Estado | Cómo comprobarlo |
|---|---|:-:|---|---|---|---|---|
| 1 | Activar la pestaña Projects del repositorio | 1–2 | `gh repo view` → `hasProjectsEnabled: true` | — | — | **Comprobado** | `gh repo view alejo150224/panaautos --json hasProjectsEnabled` |
| 2 | Crear el proyecto con la plantilla **Iterative development** | 2 | Tablero #4 existe; estados (Backlog/Ready/In progress/In review/Done) y vistas coinciden con la plantilla ([evidencia](evidencias/tablero_2026-11-10.md)) | La API no declara qué plantilla se usó (inferido) | Confirmar en la interfaz | **Parcial** | `gh project view 4 --owner alejo150224` |
| 3 | Nombre `[NombreProyecto] - Gestión Ágil` | 2 | Se llama «Pana Autos - Gestión Ágil» | Solo difiere en mayúsculas del nombre solicitado | — | **Comprobado** | `gh project list --owner alejo150224` |
| 4 | Campo Story Points (renombrar *Estimate* es opcional) | 2 | Existe el campo numérico **Story Points** | Ningún Issue tiene valor | Asignar tras aprobar | **Parcial** | `gh project field-list 4 --owner alejo150224` |
| 5 | Campo Iteration con **3 sprints de 2 semanas** (eliminar Sprint 4–6) | 2 | Campo «Sprints» con **4** iteraciones de 14 días llamadas «Sprints 1–4» (inicio 2026-11-04) | Son 4, no 3; nombres distintos; adaptación `DOCS/07` sin aprobar | Aprobar `DOCS/07`; respaldar y ajustar | **Pendiente** | Settings → Fields → Sprints |
| 6 | Importar Issues al backlog en vista Tabla (la guía importa #1–#5; aquí #1–#10) | 2–3 | Los 10 Issues están en el tablero, sin duplicados | — | — | **Comprobado** | `gh project item-list 4 --owner alejo150224` |
| 7 | Asignar Iteration y Story Points por Issue | 3 | SP documentados en `DOCS/03` | Ambos campos están **vacíos** en los 10 ítems | Asignar tras aprobar el plan | **Pendiente** | Columnas Sprints y Story Points |
| 8 | Verificar *Current iteration* y su suma de SP | 3 | Vista con filtro `iteration:@current`; la vigente hoy es «Sprints 1» | Sin ítems asignados, la vista está vacía | Tras asignar | **Pendiente** | Pestaña Current iteration |
| 9 | Clonar el repositorio y trabajar en carpeta propia | 4 | Clon en `Claude-Workspace/panaautos-ingsoft`, remoto `alejo150224/panaautos` | — | — | **Comprobado** | `git remote -v` |
| 10 | Configurar identidad Git (incidencia #1) | 4 | `user.name/email` configurados **solo en el repo local**, con autorización del usuario | Identidad global sin configurar (intencional) | — | **Comprobado** | `git config --local --list \| grep user` |
| 11 | Prohibido modificar `main`; una rama por incremento que referencie el Issue | 3–5 | 10 ramas `feature/issue-N-…` + 1 `chore/…` + 1 `docs/…`; `main` sin commits nuevos | — | — | **Comprobado** | `gh api repos/alejo150224/panaautos/branches`; `main` sigue en a3a8add |
| 12 | Estructura `src/controllers`, `models`, `dao`, `views` y `tests` | 5 | Carpetas creadas; prueba de arquitectura | — | `tests/arquitectura.test.js` | **Comprobado** | `npm test` |
| 13 | Modelo, DAO y Facade/Controller con responsabilidad única | 5–8 | Modelos solo describen datos; DAO solo acceso; controladores son fachadas | — | `src/…` ver `DOCS/08` | **Comprobado** | `tests/arquitectura.test.js` (dependencias entre capas) |
| 14 | Contratos JSDoc y modularización CommonJS (`module.exports`) | 5–8, 12 | JSDoc en métodos públicos; `'use strict'` + `require`/`module.exports` | No hay linter que mida cobertura de JSDoc | Revisión manual | **Implementado** | Leer `src/controllers/*.js` |
| 15 | Persistencia simulada integrada con DAO | 6–7 | Adaptadores memoria y JSON local con la misma interfaz | — | `src/dao/almacenamiento/` | **Comprobado** | `tests/almacenamiento.test.js` |
| 16 | Guardar los archivos: sin archivos vacíos (incidencia #2) | 9 | Ningún archivo de `src`, `tests`, `scripts` ni `.github` tiene 0 bytes | No hay prueba automática de esto | — | **Comprobado** (verificación puntual) | `find src tests scripts .github -type f -size 0` |
| 17 | Commit `feat: [N SP] … (#N)` | 9 | Los 10 commits de historia siguen el formato | — | — | **Comprobado** | `git log --oneline` |
| 18 | `git push origin <rama>` antes de abrir el PR (incidencia #3) | 9–10 | 12 ramas publicadas el 2026-11-10 tras revisar remoto, diff y secretos | — | — | **Comprobado** | `git ls-remote --heads origin` |
| 19 | PR `base: main ← compare: rama`, título y `Closes #N` | 10 | 12 PR en **borrador** (#11–#22), apilados (base = rama anterior) | Falta revisión humana; `Closes #N` solo actúa al integrarse en `main` | Revisar e integrar con aprobación | **Parcial** | `gh pr list -R alejo150224/panaautos` |
| 20 | Mover tarjeta a In review; Merge; borrar rama (opcional) | 10 | — | Requiere aprobación expresa para integrar en `main` | Pedir aprobación del lote de PR | **Pendiente** | Tablero y `git log main` |
| 21 | Al integrar, GitHub cierra el Issue y mueve a Done | 9 | Activadas: *Item closed*, *Auto-close issue*, *Pull request merged* | El efecto real no se ha comprobado | Verificar tras la primera integración | **Parcial** | Estado del Issue y del tablero |
| 22 | Insights → Burn-up por suma de Story Points agrupado por Iteration | 10–11 | — | La API no expone Insights; sin SP ni iteraciones asignados no habría datos | Configurar en la interfaz web tras asignar | **Pendiente** | Insights del tablero |
| 23 | Velocidad real y % de cumplimiento | 11 | Fórmula aplicada en `DOCS/05` | Sin Sprint aprobado ni historias en Done | Calcular al cierre real | **Parcial** | `DOCS/05` §1 |
| 24 | Informe `DOCS/05_informe_gestion_y_productividad.md` con 5 apartados | 11–12 | Creado como **provisional** | Falta captura real del Burn-up y cierre | Actualizar al cierre | **Parcial** | Abrir el archivo |
| 25 | Uso opcional de IA en consola (`gh copilot`) | 3–4 | Se usó Claude Code; reconocido en `README` y `DOCS/05` | — | — | **No aplica** (opcional) | — |

## B. Trazabilidad HU → criterio → código → prueba → rama → evidencia

Todas las historias están **implementadas y probadas localmente**, con rama y commit, pero **ninguna está integrada, revisada por pares ni cerrada** (no cumple la *definición de terminado* de `DOCS/04` §1.2). PR en borrador (apilados): HU01 #12 · HU05 #13 · HU06 #14 · HU07 #15 · HU08 #16 · HU02 #17 · HU03 #18 · HU04 #19 · HU09 #20 · HU10 #21 · habilitante #11 · documentación #22. Evidencia común: salida de `npm test` (registro en `DOCS/evidencias/registro_pruebas.md`) y recorrido manual de la interfaz en navegador el 2026-11-10.

| HU · Issue · rama (commit) | Criterio de aceptación | Código | Prueba (bloque `describe` / archivo) |
|---|---|---|---|
| **HU01 · #1** · `feature/issue-1-consultar-inventario` (54f2cbd) | CA1 listado con id, marca, modelo, año, precio y estado | `InventarioController.listarInventario` | `hu01-inventario.test.js` · CA1 |
| | CA2 una nueva consulta muestra el estado guardado más reciente | `listarInventario` (sin caché) + `VehiculoDAO` | · CA2 (incluye reinicio con JSON) |
| | CA3 mensaje exacto "No hay vehículos registrados" | `MENSAJE_INVENTARIO_VACIO` | · CA3 |
| **HU05 · #5** · `feature/issue-5-registrar-venta` (41d7d95) | CA1 exige vehículo, cliente, vendedor, fecha, precio > 0, modalidad | `VentaController._validar` | `hu05-ventas.test.js` · CA1 |
| | CA2 modalidad Contado / Crédito externo / Intercambio de vehículo/bienes | `MODALIDADES_VENTA` | · CA2 |
| | CA3 venta + "Vendido" juntos; rechaza segunda venta | `VentaController.registrarVenta` (transacción) | · CA3 (fallos inyectados, 25 intentos, 20 HTTP en paralelo, reinicio) |
| **HU06 · #6** · `feature/issue-6-registrar-solicitud` (da07f77) | CA1 formulario desde vehículo disponible/próximo con su condición | `CatalogoController`; `catalogo.js` | `hu06-solicitud.test.js` · CA1 |
| | CA2 exige nombre y un medio de contacto, indica qué completar | `SolicitudController._validar` | · CA2 |
| | CA3 estado "Nueva", confirmación, sin reserva/venta/cambio | `SolicitudController.registrarSolicitud` | · CA3 |
| **HU07 · #7** · `feature/issue-7-consultar-solicitudes` (d0f4fe4) | CA1 listado id, cliente, vehículo, fecha, estado | `listarSolicitudes` | `hu07-consultar-solicitudes.test.js` · CA1 |
| | CA2 detalle con contacto y vehículo | `obtenerSolicitud` | · CA2 |
| | CA3 mensaje "No hay solicitudes registradas" | `MENSAJE_SIN_SOLICITUDES` | · CA3 |
| **HU08 · #8** · `feature/issue-8-actualizar-estado-solicitud` (7d2aa95) | CA1 cinco estados permitidos | `actualizarEstado` + `ESTADOS_SOLICITUD` | `hu08-estado-solicitud.test.js` · CA1 |
| | CA2 conserva el estado sin tocar contacto ni vehículo | `actualizarEstado` (solo cambia `estado`) | · CA2 |
| | CA3 sin permiso de gestión no modifica | `exigirPermiso('solicitudes:gestionar')` | · CA3 |
| **HU02 · #2** · `feature/issue-2-registrar-propuesta` (e2de143) | CA1 campos obligatorios y orígenes permitidos | `PropuestaController._validar` | `hu02-registrar-propuesta.test.js` · CA1 |
| | CA2 id, autor, fecha y estado "Pendiente" | `registrarPropuesta` | · CA2 |
| | CA3 disponible para el dueño; no incorpora el vehículo | `listarPropuestas`/`obtenerPropuesta` | · CA3 |
| **HU03 · #3** · `feature/issue-3-aprobar-propuesta` (e0bba3a) | CA1 el dueño consulta la propuesta pendiente | `obtenerPropuesta` | `hu03-aprobar-propuesta.test.js` · CA1 |
| | CA2 pasa a "Aprobada" y se conserva | `aprobarPropuesta` → `_decidir` | · CA2 (incluye reinicio) |
| | CA3 solo Dueño; no incorpora el vehículo | `exigirPermiso('propuestas:decidir')` | · CA3 |
| **HU04 · #4** · `feature/issue-4-rechazar-propuesta` (966a972) | CA1 solo el dueño puede rechazar | `rechazarPropuesta` | `hu04-rechazar-propuesta.test.js` · CA1 |
| | CA2 pasa a "Rechazada" y se conserva | `_decidir` | · CA2 |
| | CA3 conserva datos, sale de pendientes, no incorpora | `listarPropuestas({estado})` | · CA3 |
| **HU09 · #9** · `feature/issue-9-registro-automatico-acciones` (e7124c7) | CA1 entrada automática por cada operación completada | `Auditor.registrar` (en cada transacción) | `hu09-registro-automatico.test.js` · CA1 |
| | CA2 usuario, acción, fecha y hora, tipo e id | `EntradaHistorial` | · CA2 |
| | CA3 se conserva tras cerrar sesión/reiniciar; sin editar ni eliminar | `HistorialDAO` (solo agregar), entradas congeladas | · CA3 |
| **HU10 · #10** · `feature/issue-10-consultar-historial` (6eddc45) | CA1 solo dueño y administrador | `exigirPermiso('historial:consultar')` | `hu10-consultar-historial.test.js` · CA1 |
| | CA2 listado con usuario, acción, fecha, tipo e id | `consultarHistorial` | · CA2 |
| | CA3 filtros combinables; mensaje sin coincidencias | `_normalizarFiltros` + filtro en `consultarHistorial` | · CA3 (prueba de propiedad) |

**Trabajo técnico habilitante** (no es historia ni suma SP; supuesto declarado en `DOCS/03` §2.3): rama `chore/soporte-arquitectura-tres-capas` (a133714 base, fed8f8f CI, ab80d28 corrección del menú) — capas, almacenamiento transaccional, roles/sesión de demostración, servidor local, datos ficticios y CI.
