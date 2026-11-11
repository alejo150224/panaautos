# PANA AUTOS
## Sistema web para la gestión y comercialización de vehículos

**Proyecto académico de Ingeniería de Software I — Universidad Mariana.**

Este repositorio reúne los requisitos, las historias de usuario, la priorización, la estimación de costos y el plan de desarrollo del sistema propuesto para PANA AUTOS.

**Alcance de este trabajo:** 10 historias de usuario, identificadas como **HU01–HU10** en GitHub Issues.

> Los puntos, las horas, los costos y las duraciones son estimaciones académicas. No representan gastos ejecutados, funcionalidades terminadas ni una velocidad del equipo ya medida.

[Requisitos](DOCS/01_requisitos.md) · [Priorización](DOCS/02_priorizacion.md) · [Estimación y costos](DOCS/03_estimacion_y_costos.md) · [Plan del proyecto](DOCS/04_plan_de_proyecto_y_modelos.md) · [Historias de usuario](https://github.com/alejo150224/panaautos/issues)

---

## 1. Contexto y propósito

PANA AUTOS es una empresa dedicada a la compra y venta de vehículos. Estos pueden ingresar mediante compra directa, importación o ser proporcionados por empleados. En este último caso, pueden permanecer como propiedad del empleado o ser adquiridos por la empresa.

Actualmente, consultar disponibilidad y comunicar ventas depende de verificaciones manuales y comunicación directa entre el personal y el dueño. El proyecto busca centralizar la información comercial, mantener coherencia entre ventas e inventario y organizar el seguimiento de solicitudes y movimientos.

La propuesta general contempla dos entornos:

| Entorno | Propósito |
|---|---|
| **Público** | Facilitar al cliente la consulta de vehículos disponibles y próximos a ingresar y el registro de solicitudes de interés. |
| **Interno** | Permitir al personal autorizado consultar inventario, gestionar propuestas, registrar ventas, atender solicitudes y revisar el historial de acciones. |

La venta continúa con intervención del vendedor. El sistema registra las modalidades **contado, crédito externo e intercambio de vehículos o bienes**, pero no realiza compras completas en línea ni concede financiación propia.

## 2. Problemas que aborda el proyecto

| Código | Problema identificado | Historias relacionadas |
|---|---|---|
| **P-01** | Consulta manual de disponibilidad mediante preguntas al personal o verificaciones físicas. | HU01 |
| **P-02** | Seguimiento limitado de las propuestas de incorporación y las decisiones del dueño. | HU02, HU03 y HU04 |
| **P-03** | Riesgo de desactualización del inventario después de registrar una venta. | HU05 |
| **P-04** | Solicitudes de clientes sin seguimiento centralizado. | HU06, HU07 y HU08 |
| **P-05** | Dificultad para identificar responsables y revisar los cambios realizados. | HU09 y HU10 |

La relación completa entre **problema, necesidad y requisito funcional** está en [01_requisitos.md](DOCS/01_requisitos.md).

## 3. Actores del sistema

| Actor | Responsabilidades en el proyecto general |
|---|---|
| **Cliente** | Consultar vehículos y registrar solicitudes de interés. |
| **Empleado/Vendedor** | Consultar inventario, presentar propuestas, gestionar clientes y solicitudes y registrar ventas. |
| **Encargado de Inventario** | Registrar vehículos aprobados, su origen y condición de propiedad. |
| **Dueño** | Aprobar o rechazar propuestas y consultar reportes e historial de acciones. |
| **Administrador** | Gestionar usuarios, roles y permisos y consultar información de gestión e historial. |

Estos son perfiles del sistema, no los roles del equipo de trabajo. Sus responsabilidades describen el proyecto general; no todas están incluidas en las diez historias presupuestadas para este seguimiento.

## 4. Product Backlog

El alcance seleccionado contiene diez historias. Cada enlace permite consultar la descripción y los criterios de aceptación del Issue correspondiente.

| Issue / HU | Historia de usuario | MoSCoW | SP | Esfuerzo | Costo estimado |
|---|---|---|---:|---:|---:|
| [#1 · HU01](https://github.com/alejo150224/panaautos/issues/1) | Consultar inventario centralizado | Must Have | 2 | 16 h | $720.000 COP |
| [#2 · HU02](https://github.com/alejo150224/panaautos/issues/2) | Registrar propuesta de incorporación | Should Have | 3 | 24 h | $1.080.000 COP |
| [#3 · HU03](https://github.com/alejo150224/panaautos/issues/3) | Aprobar propuesta de incorporación | Should Have | 2 | 16 h | $720.000 COP |
| [#4 · HU04](https://github.com/alejo150224/panaautos/issues/4) | Rechazar propuesta de incorporación | Should Have | 2 | 16 h | $720.000 COP |
| [#5 · HU05](https://github.com/alejo150224/panaautos/issues/5) | Registrar venta y actualizar inventario | Must Have | 8 | 64 h | $2.880.000 COP |
| [#6 · HU06](https://github.com/alejo150224/panaautos/issues/6) | Registrar solicitud de interés | Must Have | 3 | 24 h | $1.080.000 COP |
| [#7 · HU07](https://github.com/alejo150224/panaautos/issues/7) | Consultar solicitudes de clientes | Must Have | 2 | 16 h | $720.000 COP |
| [#8 · HU08](https://github.com/alejo150224/panaautos/issues/8) | Actualizar el estado de una solicitud | Must Have | 3 | 24 h | $1.080.000 COP |
| [#9 · HU09](https://github.com/alejo150224/panaautos/issues/9) | Conservar registro automático de acciones | Should Have | 5 | 40 h | $1.800.000 COP |
| [#10 · HU10](https://github.com/alejo150224/panaautos/issues/10) | Consultar y filtrar historial de acciones | Should Have | 3 | 24 h | $1.080.000 COP |
| **Total** | **10 historias** | **5 Must / 5 Should** | **33** | **264 h** | **$11.880.000 COP** |

### MVP y extensión

El **Producto Mínimo Viable (MVP)** incluye **HU01, HU05, HU06, HU07 y HU08**. Permite consultar inventario, registrar una venta con actualización del vehículo y completar la recepción, consulta y seguimiento de solicitudes.

La extensión incorpora **HU02, HU03, HU04, HU09 y HU10** para digitalizar propuestas y decisiones y añadir trazabilidad automática consultable.

Las funciones Should Have se postergan, no se eliminan. Durante el MVP se propone un registro manual temporal de propuestas y movimientos, sujeto a aceptación del negocio. Esa alternativa no equivale a auditoría automática ni permite reconstruir retrospectivamente los eventos como si se hubieran capturado.

## 5. Estimación y presupuesto

La **historia pivote es HU01, con 2 SP**. Las demás historias se comparan por complejidad, volumen de trabajo e incertidumbre, utilizando la escala de clase **1, 2, 3, 5, 8, 13 y 20**.

| Parámetro académico | Valor |
|---|---|
| Factor de conversión | 8 horas por Story Point |
| Tarifa por hora | $45.000 COP |
| Velocidad asumida | 10 SP por sprint |
| Duración por sprint | 2 semanas |

**Cálculos:** `Esfuerzo = SP × 8 horas` y `Costo = Esfuerzo × $45.000 COP/hora`.

| Concepto | MVP | Extensión | Backlog completo |
|---|---:|---:|---:|
| Historias | 5 | 5 | 10 |
| Story Points | 18 SP | 15 SP | 33 SP |
| Esfuerzo acumulado | 144 horas-persona | 120 horas-persona | 264 horas-persona |
| Sprints previstos | 2 | 2 adicionales | 4 en total |
| Duración prevista | 4 semanas | 4 semanas adicionales | 8 semanas desde el inicio |
| **Presupuesto estimado** | **$6.480.000 COP** | **$5.400.000 COP** | **$11.880.000 COP** |

**El total ya incluye el MVP.** Las horas representan esfuerzo agregado: no se multiplican nuevamente por los integrantes del equipo.

La votación de Planning Poker documentada es ilustrativa y está pendiente de validación real del equipo. El detalle de cada cálculo y sus supuestos está en [03_estimacion_y_costos.md](DOCS/03_estimacion_y_costos.md).

## 6. Metodología y planificación por sprints

Se propone **Scrum**, con trabajo iterativo e incremental, para revisar entregas funcionales, recibir retroalimentación y adaptar el plan. Cada sprint incluirá análisis, construcción, integración y pruebas.

El **Product Backlog** reúne el trabajo ordenado; el **Sprint Backlog** contiene el objetivo, las historias seleccionadas y el plan para ejecutarlas; y el **incremento** debe ser un resultado integrado y utilizable.

Se prevén Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective. Las responsabilidades de Product Owner, Scrum Master y Developers deben quedar identificadas antes de ejecutar el plan.

| Sprint | Semanas | Historias | Objetivo | Carga | Esfuerzo | Costo |
|---|---|---|---|---:|---:|---:|
| **1** | 1–2 | HU01 y HU05 | Consultar inventario y registrar ventas consistentes. | 10 SP | 80 h | $3.600.000 COP |
| **2** | 3–4 | HU06, HU07 y HU08 | Recibir, consultar y atender solicitudes. Cierre del MVP. | 8 SP | 64 h | $2.880.000 COP |
| **3** | 5–6 | HU02, HU03 y HU04 | Registrar propuestas y conservar la decisión del dueño. | 7 SP | 56 h | $2.520.000 COP |
| **4** | 7–8 | HU09 y HU10 | Capturar, conservar y consultar el historial de acciones. | 8 SP | 64 h | $2.880.000 COP |

Ninguna carga supera los **10 SP por sprint asumidos**. Cada historia se planifica completa y aparece una sola vez. Las semanas son relativas: el inicio y la disponibilidad real del equipo deben confirmarse.

El cálculo del plazo utiliza redondeo hacia arriba: **18/10 → 2 sprints para el MVP** y **33/10 → 4 sprints para el backlog completo**. El plan se ajustará si cambian la capacidad, las dependencias o el alcance.

## 7. Documentación del proyecto

| Documento | Contenido |
|---|---|
| [01_requisitos.md](DOCS/01_requisitos.md) | Descripción del dominio, actores, problemas, necesidades y requisitos funcionales. |
| [02_priorizacion.md](DOCS/02_priorizacion.md) | Priorización MoSCoW, valor de negocio, complejidad cualitativa y alcance del MVP. |
| [03_estimacion_y_costos.md](DOCS/03_estimacion_y_costos.md) | Organización del equipo, historia pivote, simulación de estimación, esfuerzo y presupuesto. |
| [04_plan_de_proyecto_y_modelos.md](DOCS/04_plan_de_proyecto_y_modelos.md) | Justificación de Scrum, velocidad asumida, distribución de sprints y resumen comercial. |
| [05_informe_gestion_y_productividad.md](DOCS/05_informe_gestion_y_productividad.md) | **Provisional.** Informe de gestión y productividad con los cinco apartados de la guía. |
| [06_matriz_cumplimiento_guia.md](DOCS/06_matriz_cumplimiento_guia.md) | Matriz de cumplimiento de la guía y trazabilidad HU → criterio → código → prueba → rama. |
| [07_adaptacion_tres_sprints.md](DOCS/07_adaptacion_tres_sprints.md) | **Propuesta pendiente de aprobación** para adaptar el plan de 4 sprints a los 3 de la guía. |
| [08](DOCS/08_arquitectura_y_mapa_de_archivos.md) · [09](DOCS/09_ruta_de_demostracion_y_datos.md) · [10](DOCS/10_defensa_metodos_y_preguntas.md) · [11](DOCS/11_registro_decisiones_limites_y_pendientes.md) · [12](DOCS/12_registro_continuidad.md) | Material de apoyo: arquitectura, ruta de demostración y datos ficticios, métodos y preguntas de defensa, decisiones/límites/pendientes y registro de continuidad. |
| [evidencias/registro_pruebas.md](DOCS/evidencias/registro_pruebas.md) | Pruebas ejecutadas, fechas, commits y resultados reales. |

Las historias se consultan en [GitHub Issues](https://github.com/alejo150224/panaautos/issues). La pestaña [Projects](https://github.com/alejo150224/panaautos/projects) es el acceso para revisar los tableros del repositorio; este enlace no certifica que las historias ya estén vinculadas a un tablero.

## 8. Equipo y responsabilidades de la sustentación

**Integrantes registrados en el documento de estimación:** Alejandro Rosero, Jose Betancourt, Sammuel Montaño y Jesus Mora.

| Rol evaluado | Responsabilidad en el comité ejecutivo |
|---|---|
| **Product Owner** | Defender la visión del negocio, el MVP, la propuesta comercial y las decisiones de recorte o cambio de alcance. |
| **Líder Técnico / Lead Dev** | Defender Story Points, Fibonacci, velocidad del equipo, arquitectura y riesgos técnicos. |
| **Desarrolladores 1 y 2** | Defender esfuerzo en horas, juicio de expertos, comparación con la pivote, splitting, trazabilidad de Issues y ejecución del Sprint Backlog. |

**Asignación individual pendiente de aclaración:** `03_estimacion_y_costos.md` identifica a la empresa como PO y repite el rol Desarrollador 2. Los integrantes deben acordar y registrar la distribución definitiva. Estos roles de sustentación no sustituyen automáticamente las responsabilidades Scrum.

## 9. Calidad, trazabilidad y límites

### Condiciones de terminado

Según el plan, una historia estará terminada cuando cumpla sus criterios de aceptación, esté integrada con persistencia de datos, haya sido revisada y probada y tenga evidencia de funcionamiento. Una descripción en un Issue no demuestra por sí sola que la funcionalidad esté implementada.

La cadena documental de referencia es:

**Problema → Requisito funcional → Historia/Issue → Prioridad → Story Points → Horas → Costo → Sprint.**

Ejemplo: **P-03 → RF-14 → HU05 / Issue #5 → Must Have → 8 SP → 64 horas → $2.880.000 COP → Sprint 1**.

### Supuestos y exclusiones

El presupuesto de las diez historias supone una base web con acceso por roles, registros de vehículos y clientes y acceso a la información pública del vehículo. No se afirma que esas capacidades estén implementadas; su construcción completa deberá estimarse aparte si hace falta.

No se incluyen pagos en línea, aprobación de créditos, reservas automáticas ni incorporación automática al inventario de bienes recibidos por intercambio. El presupuesto tampoco añade infraestructura, licencias, impuestos, mantenimiento ni margen comercial.

Este README resume el alcance documentado de **HU01–HU10**. No incorpora las trece historias **HU-D** del otro documento ni certifica historias terminadas (véase la sección 10 para el estado real). Los cambios de alcance, estimación o planificación deben mantenerse coherentes entre Issues y los documentos de `DOCS`.

---

## 10. Estado de la implementación y cómo ejecutarla

> **Estado real (corte 2026-11-10):** las diez historias HU01–HU10 tienen código y pruebas automáticas **en ramas de trabajo**, pero **ninguna está integrada en `main`, revisada por pares ni cerrada**; por la definición de terminado de este repositorio, la velocidad lograda es **0 SP**. Las pruebas son locales; la CI de GitHub aún no se ha ejecutado. Ver [`DOCS/05`](DOCS/05_informe_gestion_y_productividad.md) (provisional) y [`DOCS/06`](DOCS/06_matriz_cumplimiento_guia.md).

Prototipo en **Node.js 22+** (JavaScript, CommonJS, JSDoc), sin dependencias que instalar, con arquitectura en tres capas (`src/views`, `src/controllers`, `src/dao`) y entidades en `src/models`. Usa **solo datos ficticios** y escucha únicamente en `127.0.0.1`.

```bash
npm test                  # pruebas automáticas (346 en la rama con las diez historias)
npm start                 # http://127.0.0.1:3000 con persistencia en data/panaautos.json
npm run start:memoria     # todo en memoria (se pierde al cerrar)
npm run start:vacio       # en memoria y sin vehículos (caso vacío de HU01)
npm run demo:reiniciar    # borra solo los datos de demostración
```

Cómo recorrer cada historia: [`DOCS/09`](DOCS/09_ruta_de_demostracion_y_datos.md). Mapa de la arquitectura: [`DOCS/08`](DOCS/08_arquitectura_y_mapa_de_archivos.md).

**Trabajo técnico habilitante (sin Story Points):** acceso por roles con una sesión de demostración sin contraseñas, registros base de vehículos y clientes, un catálogo público mínimo para abrir el formulario de interés, el almacenamiento y el servidor local. `DOCS/03` los trataba como supuestos; ahora existen como código, pero su esfuerzo no estaba presupuestado.

**Asistencia de IA:** el código, las pruebas y la documentación de esta entrega se elaboraron con ayuda de Claude Code. Cada integrante debe revisar y comprender lo que defienda; no se atribuye a ningún integrante una revisión que no haya hecho.
