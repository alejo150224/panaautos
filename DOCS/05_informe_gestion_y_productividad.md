# Informe de Gestión y Productividad - Sprint 1

> **ESTADO: PROVISIONAL — corte de seguimiento del 2026-11-11. No es el cierre del Sprint 1 (cierra el 2026-11-17).**
> El plan de tres sprints (`DOCS/07`) se aplicó al tablero por instrucción del usuario y falta su validación por el equipo. Las cifras de abajo son del corte, no del cierre de la iteración.
> Asistencia de IA: el código, las pruebas y estos documentos fueron generados con ayuda de **Claude Code** (Anthropic) a solicitud del equipo; la revisión de pares humana **aún no ha ocurrido** y no se atribuye a ningún integrante.

## 1. Resumen de la Iteración

* **Sprint Activo:** Sprint 1 (iteración «Sprint 1» del tablero: **2026-11-04 al 2026-11-17**). El plan de tres sprints (alternativa A, `DOCS/07`) se aplicó al tablero el 2026-11-11 por instrucción del usuario, **sin Sprint Planning documentado ni validación del equipo**.
* **Velocidad Planeada:** Sprint 1 = **10 SP** (HU01 + HU05): coincide con la línea base (`DOCS/04`) y con la suma de la iteración vigente del tablero. Hipótesis pendiente de validación del equipo.
* **Velocidad Lograda (Real):** **10 SP** (HU01 = 2 SP y HU05 = 8 SP): ambas están en la columna *Done* tras integrarse en `main` (PR #12 y #13, 2026-11-11) y cerrarse sus Issues. **Matiz:** la «revisión» fue **autorrevisión asistida por IA, no revisión de pares humana**; si el equipo exige revisión de pares en la definición de terminado de `DOCS/04`, estas historias deberían revisarse de forma retroactiva.
* **Porcentaje de Cumplimiento:** 10 SP logrados / 10 SP planeados × 100 = **100 %**, con corte al 2026-11-11. Es **provisional** (el sprint cierra el 2026-11-17) y su denominador es la planeación del tablero, pendiente de validación del equipo. No se copian las cifras del ejemplo de la guía (12 SP, 2 SP, 16,6 %).
* **Trabajo construido pero no terminado:** 23 SP de las historias de los Sprints 2 y 3 (HU06, HU07, HU08, HU02, HU03, HU04, HU09, HU10) con código y pruebas locales en PR en borrador (#14–#21), en *In review* y **sin integrar**: no cuentan como velocidad lograda ni se adelantan al Sprint 1.
* **Distinción de planes:** *plan inicial* = `DOCS/04` (4 sprints, 10/8/7/8 SP); *cambio de alcance* = ninguno aplicado; *adaptación* = alternativa A de `DOCS/07` aplicada al tablero el 2026-11-11 (pendiente de validación); *avance al corte* = lo de este informe; *cierre real* = pendiente (2026-11-17).

## 2. Métricas y Seguimiento del Avance

* **Gráfico Burn-up:** **no disponible.** Con el corte actual, un Burn-up por Iteration mostraría 10 SP completados en el Sprint 1 (de 10) y 0 en los Sprints 2 y 3 (alcance total 33 SP). La API no expone Insights: la configuración (Y = suma de Story Points, X = Iteration) y la captura las hace el usuario en la web. No se reconstruye un historial diario a partir del estado actual ni se presenta un gráfico local como si fuera de GitHub Insights. *Pendiente:* configurar Insights → Burn up por suma de Story Points agrupado por Iteration y pegar la captura auténtica.
* **Evidencia disponible:** 346 pruebas locales en verde en la rama `feature/issue-10-consultar-historial` y 149 en `main` tras la integración (`DOCS/evidencias/registro_pruebas.md`); **CI de GitHub: 3 ejecuciones en verde sobre `main`** (push de los merges #11, #12 y #13: runs 43059538428, 43059578124 y 43059601019); recorrido manual de la interfaz (2026-11-10). El CI aún no se ha visto sobre un PR abierto.
* **Análisis de Desviaciones:**
  * *Plan vs. guía:* la guía pide 3 iteraciones; el plan vigente tiene 4 (`DOCS/07`).
  * *Tablero:* tenía 4 iteraciones y ningún Story Points. El 2026-11-11 se configuró con 3 sprints de 14 días (Sprint 1: 10 SP, Sprint 2: 11 SP, Sprint 3: 12 SP), Story Points e iteración asignados y las 10 tarjetas en *In review* (cada una tiene su PR en borrador). Respaldo previo: `DOCS/evidencias/tablero_respaldo_2026-11-10.json`.
  * *Habilitantes no presupuestados:* acceso por roles, datos base de vehículos y clientes, catálogo público mínimo, almacenamiento y servidor local. `DOCS/03` §2.3 los trataba como **supuestos**; aquí se construyeron como trabajo técnico habilitante, **sin Story Points propios** (impacto en esfuerzo real sin estimar).
  * *Defecto detectado:* menú vacío por un error de `app.js`, hallado en pruebas manuales y corregido (`DOCS/evidencias/registro_pruebas.md`).
  * *Revisión de código:* **autorrevisión asistida** en HU01 y HU05 (integradas); sin revisión de pares humana. Los PR #14–#22 siguen en borrador.

## 3. Incremento Entregado (Definition of Done)

"Estado Final" describe el estado **real**; *Done* = integrada en `main`, Issue cerrado y tarjeta en Done (la automatización se verificó el 2026-11-11 con #1 y #5).

| Issue ID | Historia de Usuario | Story Points | Estado Final | Commit / PR de Cierre |
| :--- | :--- | :--- | :--- | :--- |
| #1 | HU01 Consultar inventario centralizado | 2 SP | **Done** (Issue y tarjeta cerrados el 2026-11-11) | Commit 54f2cbd · PR #12 (Merged, merge cbe9ba3) |
| #5 | HU05 Registrar venta y actualizar inventario | 8 SP | **Done** (Issue y tarjeta cerrados el 2026-11-11) | Commit 41d7d95 · PR #13 (Merged, merge 6f5cb6a) |
| #6 | HU06 Registrar solicitud de interés | 3 SP | Implementada y probada localmente · tablero: *In review* · **no Done** | Commit da07f77 · PR #14 (borrador, sin revisar) |
| #7 | HU07 Consultar solicitudes de clientes | 2 SP | Implementada y probada localmente · tablero: *In review* · **no Done** | Commit d0f4fe4 · PR #15 (borrador, sin revisar) |
| #8 | HU08 Actualizar el estado de una solicitud | 3 SP | Implementada y probada localmente · tablero: *In review* · **no Done** | Commit 7d2aa95 · PR #16 (borrador, sin revisar) |
| #2 | HU02 Registrar propuesta de incorporación | 3 SP | Implementada y probada localmente · tablero: *In review* · **no Done** | Commit e2de143 · PR #17 (borrador, sin revisar) |
| #3 | HU03 Aprobar propuesta de incorporación | 2 SP | Implementada y probada localmente · tablero: *In review* · **no Done** | Commit e0bba3a · PR #18 (borrador, sin revisar) |
| #4 | HU04 Rechazar propuesta de incorporación | 2 SP | Implementada y probada localmente · tablero: *In review* · **no Done** | Commit 966a972 · PR #19 (borrador, sin revisar) |
| #9 | HU09 Conservar registro automático de acciones | 5 SP | Implementada y probada localmente · tablero: *In review* · **no Done** | Commit e7124c7 · PR #20 (borrador, sin revisar) |
| #10 | HU10 Consultar y filtrar historial de acciones | 3 SP | Implementada y probada localmente · tablero: *In review* · **no Done** | Commit 6eddc45 · PR #21 (borrador, sin revisar) |
| — | Soporte habilitante (capas, roles, almacenamiento, servidor, CI) | sin SP | Integrado · fuera del backlog | Commits a133714, fed8f8f, ab80d28 · PR #11 (Merged, merge 7ff90a2) |

Totales: **10 SP Done** (HU01 + HU05, Sprint 1) · 23 SP con código en PR en borrador (*In review*) · 33 SP en total. MVP (HU01, HU05–HU08): 10 de 18 SP Done.

## 4. Mantenibilidad del Código Fuente

* **Arquitectura:** tres capas — Presentación (`src/views`), Lógica de negocio (`src/controllers`) y Acceso a datos (`src/dao`) — más `src/models` con las entidades (los modelos no se cuentan como cuarta capa). `src/composicion.js` es la única pieza que conoce todas las capas. Mapa completo en `DOCS/08`.
* **Patrones Usados:**
  * **Facade / Controller:** `VentaController`, `SolicitudController`, `PropuestaController`, `HistorialController`, etc. son la única puerta de entrada de la vista; la vista solo recibe controladores.
  * **DAO:** `DAOBase` y un DAO por entidad. `HistorialDAO` es de solo agregar a propósito.
  * **Adaptador de almacenamiento:** `AlmacenamientoMemoria` (se pierde todo al reiniciar) y `AlmacenamientoJson` (archivo local, escritura atómica); mismas operaciones, intercambiables.
  * **Unidad de trabajo (transacción):** `transaccion()` confirma todos los cambios o ninguno (venta + estado + historial).
* **Buenas Prácticas:** contratos JSDoc en los métodos públicos; modularización CommonJS (`module.exports`); responsabilidad única; validaciones que informan todos los errores a la vez; errores de negocio tipados; permisos por rol con denegación por defecto; cero dependencias de ejecución; pruebas de arquitectura que verifican qué capa puede depender de cuál. **Limitación:** no hay linter ni medición de cobertura.

## 5. Reajustes para el Sprint 2

* **Factores técnicos que afectaron el desempeño:** tablero que tenía 4 iteraciones y ningún Story Points (corregido el 2026-11-11); ausencia de velocidad medida; trabajo habilitante no estimado; sin revisión de pares.
* **Reajuste de la velocidad estimada:** **no se reajusta todavía**: hay un único dato (10 SP Done del Sprint 1 al corte del 2026-11-11, que además se logró con trabajo habilitante sin estimar); se recalculará con el cierre del sprint (2026-11-17). Se aplicó la alternativa A de `DOCS/07` (capacidad hipotética de 12 SP, todas las historias) por instrucción del usuario; **el equipo debe validarla**. La alternativa B (10 SP, HU09/HU10 fuera) sigue disponible.
* **Acciones propuestas:** (1) aprobar la adaptación a tres sprints; (2) configurar Insights (Burn-up) y tomar la captura; (3) abrir y revisar los PR (revisión humana real) e integrar con aprobación; (4) verificar que el cierre del Issue mueva la tarjeta a Done; (5) tomar capturas auténticas del tablero y del Burn-up; (6) estimar aparte los habilitantes si se quieren presupuestar.
