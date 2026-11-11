# Informe de Gestión y Productividad - Sprint 1

> **ESTADO: PROVISIONAL — corte de seguimiento del 2026-11-10. No es el cierre del Sprint 1.**
> No hay un Sprint 1 aprobado con fechas (la adaptación a tres sprints está pendiente: ver `DOCS/07`), ni tablero verificado, ni historias integradas. Las cifras de abajo no deben leerse como cierre de iteración.
> Asistencia de IA: el código, las pruebas y estos documentos fueron generados con ayuda de **Claude Code** (Anthropic) a solicitud del equipo; la revisión de pares humana **aún no ha ocurrido** y no se atribuye a ningún integrante.

## 1. Resumen de la Iteración

* **Sprint Activo:** Sprint 1. El tablero define la iteración «Sprints 1» del **2026-11-04 al 2026-11-17** (configuración previa del tablero, sin Sprint Planning documentado ni aprobación del plan de tres sprints). Período real de trabajo: **no acordado**.
* **Velocidad Planeada:** línea base documentada para el Sprint 1 = **10 SP** (HU01 + HU05, `DOCS/04`). Es una propuesta pendiente de validación del equipo; el plan de tres sprints (`DOCS/07`) no está aprobado.
* **Velocidad Lograda (Real):** **0 SP.** Ninguna historia cumple la definición de terminado (criterios + persistencia + revisión + pruebas + evidencia + integración): las diez están implementadas en ramas con PR en borrador (#11–#22) pero **sin revisión humana y sin integrar**.
* **Porcentaje de Cumplimiento:** **no determinable como métrica oficial.** Solo como referencia: 0 SP logrados frente a los 10 SP de la línea base documentada (0 %), sin período de sprint aprobado. No se copian las cifras del ejemplo de la guía (12 SP, 2 SP, 16,6 %).
* **Trabajo construido pero no terminado:** 33 SP de historias con código y pruebas locales en ramas (no cuentan como velocidad lograda).
* **Distinción de planes:** *plan inicial* = `DOCS/04` (4 sprints, 10/8/7/8 SP); *cambio de alcance* = ninguno aplicado; *adaptación propuesta* = `DOCS/07`; *avance al corte* = lo de este informe; *cierre real* = pendiente.

## 2. Métricas y Seguimiento del Avance

* **Gráfico Burn-up:** **no disponible.** Se leyó el tablero (`DOCS/evidencias/tablero_2026-11-10.md`) pero está sin Story Points ni iteraciones asignados, así que no hay historial que graficar, y la API no expone Insights. No se reconstruye un historial diario a partir del estado actual ni se presenta un gráfico local como si fuera de GitHub Insights. *Pendiente:* configurar Insights → Burn up por suma de Story Points agrupado por Iteration y pegar la captura auténtica.
* **Evidencia disponible:** registro de 346 pruebas locales en verde en la rama `feature/issue-10-consultar-historial` y en cada rama intermedia (`DOCS/evidencias/registro_pruebas.md`); recorrido manual de la interfaz en navegador (2026-11-10). Las pruebas son locales, **no** CI: al corte GitHub no ha registrado ejecuciones del workflow en los PR #11–#22 (Actions está habilitado); su resultado está **por verificar**.
* **Análisis de Desviaciones:**
  * *Plan vs. guía:* la guía pide 3 iteraciones; el plan vigente tiene 4 (`DOCS/07`).
  * *Tablero:* existe (#4) con los 10 Issues en Backlog, pero con **4** iteraciones en lugar de 3, sin Story Points y sin iteración asignada; no se modificó (requiere aprobación).
  * *Habilitantes no presupuestados:* acceso por roles, datos base de vehículos y clientes, catálogo público mínimo, almacenamiento y servidor local. `DOCS/03` §2.3 los trataba como **supuestos**; aquí se construyeron como trabajo técnico habilitante, **sin Story Points propios** (impacto en esfuerzo real sin estimar).
  * *Defecto detectado:* menú vacío por un error de `app.js`, hallado en pruebas manuales y corregido (`DOCS/evidencias/registro_pruebas.md`).
  * *Revisión de código:* ninguna aún (PR en borrador sin revisión humana).

## 3. Incremento Entregado (Definition of Done)

"Estado Final" describe el estado **real**; *Done* exige criterios, persistencia, pruebas, revisión e integración confirmadas, y ninguna lo cumple todavía.

| Issue ID | Historia de Usuario | Story Points | Estado Final | Commit / PR de Cierre |
| :--- | :--- | :--- | :--- | :--- |
| #1 | HU01 Consultar inventario centralizado | 2 SP | Implementada y probada localmente · **no Done** | Commit 54f2cbd · PR #12 (borrador, sin revisar) |
| #5 | HU05 Registrar venta y actualizar inventario | 8 SP | Implementada y probada localmente · **no Done** | Commit 41d7d95 · PR #13 (borrador, sin revisar) |
| #6 | HU06 Registrar solicitud de interés | 3 SP | Implementada y probada localmente · **no Done** | Commit da07f77 · PR #14 (borrador, sin revisar) |
| #7 | HU07 Consultar solicitudes de clientes | 2 SP | Implementada y probada localmente · **no Done** | Commit d0f4fe4 · PR #15 (borrador, sin revisar) |
| #8 | HU08 Actualizar el estado de una solicitud | 3 SP | Implementada y probada localmente · **no Done** | Commit 7d2aa95 · PR #16 (borrador, sin revisar) |
| #2 | HU02 Registrar propuesta de incorporación | 3 SP | Implementada y probada localmente · **no Done** | Commit e2de143 · PR #17 (borrador, sin revisar) |
| #3 | HU03 Aprobar propuesta de incorporación | 2 SP | Implementada y probada localmente · **no Done** | Commit e0bba3a · PR #18 (borrador, sin revisar) |
| #4 | HU04 Rechazar propuesta de incorporación | 2 SP | Implementada y probada localmente · **no Done** | Commit 966a972 · PR #19 (borrador, sin revisar) |
| #9 | HU09 Conservar registro automático de acciones | 5 SP | Implementada y probada localmente · **no Done** | Commit e7124c7 · PR #20 (borrador, sin revisar) |
| #10 | HU10 Consultar y filtrar historial de acciones | 3 SP | Implementada y probada localmente · **no Done** | Commit 6eddc45 · PR #21 (borrador, sin revisar) |
| — | Soporte habilitante (capas, roles, almacenamiento, servidor, CI) | sin SP | Implementado · fuera del backlog | Commits a133714, fed8f8f, ab80d28 · PR #11 (borrador) |

Totales: 33 SP con código en ramas · **0 SP Done**. MVP (HU01, HU05–HU08): 18 SP en ramas, 0 SP Done.

## 4. Mantenibilidad del Código Fuente

* **Arquitectura:** tres capas — Presentación (`src/views`), Lógica de negocio (`src/controllers`) y Acceso a datos (`src/dao`) — más `src/models` con las entidades (los modelos no se cuentan como cuarta capa). `src/composicion.js` es la única pieza que conoce todas las capas. Mapa completo en `DOCS/08`.
* **Patrones Usados:**
  * **Facade / Controller:** `VentaController`, `SolicitudController`, `PropuestaController`, `HistorialController`, etc. son la única puerta de entrada de la vista; la vista solo recibe controladores.
  * **DAO:** `DAOBase` y un DAO por entidad. `HistorialDAO` es de solo agregar a propósito.
  * **Adaptador de almacenamiento:** `AlmacenamientoMemoria` (se pierde todo al reiniciar) y `AlmacenamientoJson` (archivo local, escritura atómica); mismas operaciones, intercambiables.
  * **Unidad de trabajo (transacción):** `transaccion()` confirma todos los cambios o ninguno (venta + estado + historial).
* **Buenas Prácticas:** contratos JSDoc en los métodos públicos; modularización CommonJS (`module.exports`); responsabilidad única; validaciones que informan todos los errores a la vez; errores de negocio tipados; permisos por rol con denegación por defecto; cero dependencias de ejecución; pruebas de arquitectura que verifican qué capa puede depender de cuál. **Limitación:** no hay linter ni medición de cobertura.

## 5. Reajustes para el Sprint 2

* **Factores técnicos que afectaron el desempeño:** tablero sin Story Points ni iteraciones asignadas y con 4 iteraciones en vez de 3; ausencia de velocidad medida; trabajo habilitante no estimado; sin revisión de pares y sin resultados de CI verificados.
* **Reajuste de la velocidad estimada:** **no se reajusta con datos**, porque no hay velocidad lograda medida (0 SP Done). Decisión pendiente del equipo entre las alternativas A (12 SP de capacidad, todas las historias) y B (10 SP, HU09/HU10 fuera) de `DOCS/07`.
* **Acciones propuestas:** (1) aprobar la adaptación a tres sprints; (2) configurar el tablero existente «Pana Autos - Gestión Ágil» (Story Points, iteraciones y vista *Current iteration*), con respaldo previo, tras aprobar el plan; (3) abrir y revisar los PR (revisión humana real) e integrar con aprobación; (4) verificar que el cierre del Issue mueva la tarjeta a Done; (5) tomar capturas auténticas del tablero y del Burn-up; (6) estimar aparte los habilitantes si se quieren presupuestar.
