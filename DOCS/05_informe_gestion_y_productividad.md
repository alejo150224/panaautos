# Informe de Gestión y Productividad - Sprint 1

> **ESTADO: PROVISIONAL — corte de seguimiento del 2026-11-11, después de integrar las diez historias. No es el cierre del Sprint 1 (cierra el 2026-11-17).**
> El plan de tres sprints (`DOCS/07`) se aplicó al tablero por instrucción del usuario y falta su validación por el equipo. Las cifras son del corte, no del cierre de la iteración.
> Asistencia de IA: el código, las pruebas y estos documentos fueron generados con ayuda de **Claude Code** (Anthropic) a solicitud del equipo. Todas las integraciones se hicieron con **autorrevisión asistida: no hubo revisión de pares humana** y no se atribuye ninguna a un integrante.

## 1. Resumen de la Iteración

* **Sprint Activo:** Sprint 1 (iteración «Sprint 1» del tablero: **2026-11-04 al 2026-11-17**). El plan de tres sprints (alternativa A, `DOCS/07`) se aplicó al tablero el 2026-11-11 por instrucción del usuario, **sin Sprint Planning documentado ni validación del equipo**.
* **Velocidad Planeada:** Sprint 1 = **10 SP** (HU01 + HU05): coincide con la línea base (`DOCS/04`) y con la suma de la iteración del tablero. Hipótesis pendiente de validación del equipo.
* **Velocidad Lograda (Real):** **10 SP en el Sprint 1** (HU01 = 2 SP y HU05 = 8 SP), ambas en *Done* tras integrarse en `main` (PR #12 y #13). **Además**, las historias asignadas a los Sprints 2 y 3 (**23 SP**: HU06, HU07, HU08, HU02, HU03, HU04, HU09 y HU10) se integraron **por adelantado el mismo 2026-11-11** (PR #14–#21) y también están en Done; **no se suman a la velocidad del Sprint 1** porque pertenecen a otras iteraciones. Total en Done: 33 SP. **Matices:** (1) la «revisión» fue autorrevisión asistida por IA, no revisión de pares humana; (2) integrar tanto en un día **no mide la velocidad del equipo** (el código se generó con IA) y no debe usarse para planificar capacidad.
* **Porcentaje de Cumplimiento:** 10 SP logrados / 10 SP planeados × 100 = **100 %** para el Sprint 1, **provisional** hasta el cierre del 2026-11-17 y con denominador pendiente de validación del equipo. Para los Sprints 2 y 3 no se calcula un porcentaje: su trabajo se adelantó y esas iteraciones aún no han ocurrido. No se copian las cifras del ejemplo de la guía (12 SP, 2 SP, 16,6 %).
* **Backlog:** las diez historias están integradas y cerradas; no queda ninguna historia pendiente. Los pendientes del proyecto no son historias: Burn-up y capturas, revisión de pares humana y validación del equipo (`DOCS/11`).
* **Distinción de planes:** *plan inicial* = `DOCS/04` (4 sprints, 10/8/7/8 SP); *cambio de alcance* = ninguno; *adaptación* = alternativa A de `DOCS/07` aplicada al tablero el 2026-11-11 (pendiente de validación); *avance al corte* = lo de este informe; *cierre real* = pendiente (2026-11-17).

## 2. Métricas y Seguimiento del Avance

* **Gráfico Burn-up:** **no disponible todavía.** Con el estado actual del tablero, un Burn-up por Iteration mostraría Sprint 1: 10 de 10 SP completados; Sprint 2: 11 de 11 y Sprint 3: 12 de 12, completados por adelantado (alcance total 33 SP). La API no expone Insights: la configuración (Y = suma de Story Points, X = Iteration) y la captura las hace el usuario en la web. No se reconstruye un historial diario: todo se integró el 2026-11-11, y no se presenta un gráfico local como si fuera de GitHub Insights. *Pendiente:* configurar Insights → Burn up por suma de Story Points agrupado por Iteration y pegar la captura auténtica.
* **Evidencia disponible:** 346 pruebas locales en verde sobre `main` (`DOCS/evidencias/registro_pruebas.md`); **CI de GitHub en verde** en los 9 pushes a `main` (uno por cada merge) y en los PR de documentación (#22 y #23); recorrido manual de la interfaz en navegador (2026-11-10). Todavía no hay capturas de pantalla.
* **Análisis de Desviaciones:**
  * *Plan vs. guía:* la guía pide 3 iteraciones; el plan vigente tenía 4 (`DOCS/07`).
  * *Tablero:* tenía 4 iteraciones y ningún Story Points. El 2026-11-11 se configuró con 3 sprints de 14 días (Sprint 1: 10 SP, Sprint 2: 11 SP, Sprint 3: 12 SP). Al integrar los PR, las 10 tarjetas pasaron de *In review* a *Done* automáticamente. Respaldo previo: `DOCS/evidencias/tablero_respaldo_2026-11-10.json`.
  * *Integración anticipada:* las historias de los Sprints 2 y 3 se integraron el 2026-11-11, antes de que esas iteraciones empiecen (18-nov y 2-dic). Esos sprints quedan sin alcance de historias asignado.
  * *Habilitantes no presupuestados:* acceso por roles, datos base de vehículos y clientes, catálogo público mínimo, almacenamiento y servidor local. `DOCS/03` §2.3 los trataba como **supuestos**; aquí se construyeron como trabajo técnico habilitante, **sin Story Points propios** (impacto en esfuerzo real sin estimar).
  * *Defecto detectado:* menú vacío por un error de `app.js`, hallado en pruebas manuales y corregido (`DOCS/evidencias/registro_pruebas.md`).
  * *Revisión de código:* **autorrevisión asistida** en las diez historias; sin revisión de pares humana (el repositorio tiene un único colaborador).

## 3. Incremento Entregado (Definition of Done)

"Estado Final" describe el estado **real**: *Done* = integrada en `main`, Issue cerrado y tarjeta en Done (la automatización se verificó con los 10 Issues el 2026-11-11). La definición de terminado de `DOCS/04` pide además «revisada»: aquí fue autorrevisión asistida.

| Issue ID | Historia de Usuario | Story Points | Estado Final | Commit / PR de Cierre |
| :--- | :--- | :--- | :--- | :--- |
| #1 | HU01 Consultar inventario centralizado | 2 SP | **Done** (Sprint 1) | Commit 54f2cbd · PR #12 (Merged, merge cbe9ba3) |
| #5 | HU05 Registrar venta y actualizar inventario | 8 SP | **Done** (Sprint 1) | Commit 41d7d95 · PR #13 (Merged, merge 6f5cb6a) |
| #6 | HU06 Registrar solicitud de interés | 3 SP | **Done** (Sprint 2, adelantada) | Commit da07f77 · PR #14 (Merged, merge 7a976cc) |
| #7 | HU07 Consultar solicitudes de clientes | 2 SP | **Done** (Sprint 2, adelantada) | Commit d0f4fe4 · PR #15 (Merged, merge dc6491f) |
| #8 | HU08 Actualizar el estado de una solicitud | 3 SP | **Done** (Sprint 2, adelantada) | Commit 7d2aa95 · PR #16 (Merged, merge 237f034) |
| #2 | HU02 Registrar propuesta de incorporación | 3 SP | **Done** (Sprint 2, adelantada) | Commit e2de143 · PR #17 (Merged, merge 1c646f7) |
| #3 | HU03 Aprobar propuesta de incorporación | 2 SP | **Done** (Sprint 3, adelantada) | Commit e0bba3a · PR #18 (Merged, merge 86578f9) |
| #4 | HU04 Rechazar propuesta de incorporación | 2 SP | **Done** (Sprint 3, adelantada) | Commit 966a972 · PR #19 (Merged, merge 6eaeb47) |
| #9 | HU09 Conservar registro automático de acciones | 5 SP | **Done** (Sprint 3, adelantada) | Commit e7124c7 · PR #20 (Merged, merge 2f6bb5e) |
| #10 | HU10 Consultar y filtrar historial de acciones | 3 SP | **Done** (Sprint 3, adelantada) | Commit 6eddc45 · PR #21 (Merged, merge 2b66154) |
| — | Soporte habilitante (capas, roles, almacenamiento, servidor, CI) | sin SP | Integrado · fuera del backlog | Commits a133714, fed8f8f, ab80d28 · PR #11 (Merged, merge 7ff90a2) |

Totales: **33 SP Done** = 10 SP del Sprint 1 + 23 SP adelantados de los Sprints 2 y 3. MVP (HU01, HU05–HU08): 18 de 18 SP Done.

## 4. Mantenibilidad del Código Fuente

* **Arquitectura:** tres capas — Presentación (`src/views`), Lógica de negocio (`src/controllers`) y Acceso a datos (`src/dao`) — más `src/models` con las entidades (los modelos no se cuentan como cuarta capa). `src/composicion.js` es la única pieza que conoce todas las capas. Mapa completo en `DOCS/08`.
* **Patrones Usados:**
  * **Facade / Controller:** `VentaController`, `SolicitudController`, `PropuestaController`, `HistorialController`, etc. son la única puerta de entrada de la vista; la vista solo recibe controladores.
  * **DAO:** `DAOBase` y un DAO por entidad. `HistorialDAO` es de solo agregar a propósito.
  * **Adaptador de almacenamiento:** `AlmacenamientoMemoria` (se pierde todo al reiniciar) y `AlmacenamientoJson` (archivo local, escritura atómica); mismas operaciones, intercambiables.
  * **Unidad de trabajo (transacción):** `transaccion()` confirma todos los cambios o ninguno (venta + estado + historial).
* **Buenas Prácticas:** contratos JSDoc en los métodos públicos; modularización CommonJS (`module.exports`); responsabilidad única; validaciones que informan todos los errores a la vez; errores de negocio tipados; permisos por rol con denegación por defecto; cero dependencias de ejecución; pruebas de arquitectura que verifican qué capa puede depender de cuál. **Limitación:** no hay linter ni medición de cobertura.

## 5. Reajustes para el Sprint 2

* **Factores técnicos que afectaron el desempeño:** tablero que tenía 4 iteraciones y ningún Story Points (corregido el 2026-11-11); ausencia de velocidad medida; trabajo habilitante no estimado; integración anticipada de los Sprints 2 y 3 (esas iteraciones quedan sin historias); sin revisión de pares.
* **Reajuste de la velocidad estimada:** **no se reajusta con estos datos.** Los 10 SP del Sprint 1 y los 23 SP adelantados, logrados en un día con código generado por IA, no son una medida de la capacidad humana del equipo. Se recalculará con el cierre del Sprint 1 (2026-11-17) y se validará la alternativa A de `DOCS/07` con el equipo. La alternativa B queda sin objeto inmediato: todas las historias están integradas.
* **Acciones propuestas:** (1) revisión de pares humana de los PR #11–#21 (comentarios y aprobaciones en GitHub); si aparecen defectos, abrir Issues nuevos; (2) configurar Insights (Burn-up) y tomar las capturas auténticas; (3) validar con el equipo el plan de tres sprints, los roles y el Planning Poker real (`DOCS/03`); (4) usar los Sprints 2 y 3 para endurecimiento (limitaciones de `DOCS/11`), ensayo de la sustentación y, si se desea, nuevas historias estimadas aparte; (5) cerrar el PR #22, redundante con el #23; (6) estimar aparte los habilitantes si se quieren presupuestar.
