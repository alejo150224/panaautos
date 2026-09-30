# Estimación del Plan de Proyecto y Modelos de Proceso — Proyecto PANA AUTOS

## 1. Selección y Justificación del Modelo de Proceso

Para desarrollar PANA AUTOS se selecciona **Scrum (Marco Ágil)**, con un enfoque iterativo e incremental y sprints de dos semanas para este proyecto.

La empresa necesita centralizar la consulta del inventario, registrar ventas sin dejar desactualizado el vehículo y organizar la atención de solicitudes. Scrum permite entregar primero estas funcionalidades prioritarias, revisarlas con los usuarios y adaptar el trabajo posterior. Las propuestas de incorporación y la trazabilidad se incorporarán después, conservando la priorización MoSCoW existente.

Con la velocidad asumida de 10 SP por sprint, se propone un **MVP en cuatro semanas** y completar las **diez historias en ocho semanas**. La entrega progresiva permite revisar temprano la consistencia entre ventas e inventario antes de ampliar el sistema. Estos plazos son una previsión, no un avance ya realizado ni una velocidad comprobada.

### 1.1. Comparación de modelos para PANA AUTOS

| Modelo | Enfoque presentado en clase | Valoración para el proyecto |
|---|---|---|
| Cascada | Trabajo lineal y secuencial, cerrando una fase antes de continuar. | Menos conveniente mientras existan reglas que deban validarse con los usuarios. |
| Incremental | Entregas sucesivas de partes funcionales. | Compatible con entregas por módulos; se elige Scrum para organizar además la inspección y adaptación mediante sus eventos. |
| Espiral | Ciclos orientados a identificar y mitigar riesgos. | Su análisis de riesgos resulta útil, pero no se selecciona como marco principal para el alcance acotado de diez historias. |
| **Scrum** | Trabajo iterativo e incremental con backlog, sprints y retroalimentación. | **Seleccionado:** facilita priorizar el MVP, revisar incrementos y ajustar el plan a la capacidad y resultados del equipo. |

### 1.2. Aplicación del marco

El Product Owner ordenará el backlog y aclarará el alcance; el Scrum Master facilitará el trabajo y la resolución de impedimentos; y los Developers realizarán análisis, diseño, implementación y pruebas. Las designaciones personales de Product Owner y Scrum Master deben confirmarse, sin trasladar automáticamente el cargo de Líder Técnico de la clase anterior.

En cada Sprint Planning se definirán objetivo, historias y tareas del Sprint Backlog. Habrá Daily Scrum de 15 minutos por día de trabajo, Sprint Review para inspeccionar el incremento y Retrospective para acordar mejoras. Los Issues y el tablero harán visible el progreso.

Cada sprint incluirá construcción, integración y pruebas. Una historia estará terminada cuando cumpla sus criterios de aceptación, esté integrada con persistencia de datos, haya sido revisada y probada y tenga evidencia de funcionamiento.

---

## 2. Parámetros de Planificación

| Parámetro | Valor |
|---|---|
| Velocidad asumida del equipo (`V`) | **10 SP por sprint** |
| Duración de cada sprint | **2 semanas** |
| Backlog completo | **10 historias: 33 SP** |
| MVP — Must Have | **HU01, HU05, HU06, HU07 y HU08: 18 SP** |
| Extensión — Should Have | **HU02, HU03, HU04, HU09 y HU10: 15 SP** |
| Factor de conversión de clase (`Fc`) | **8 horas por SP** |
| Tarifa de clase (`Th`) | **45.000 COP por hora** |

Se propone **V = 10 SP/sprint** como hipótesis inicial del ejercicio. Permite planificar completa HU05, la historia más grande de 8 SP, y agrupar entregas funcionales sin fraccionar historias. El equipo deberá validar esta previsión con su disponibilidad y con los puntos realmente terminados en cada sprint.

Según el factor de clase, 10 SP equivalen a **80 horas-persona de esfuerzo agregado del equipo**, no a 80 horas por integrante. Esto no demuestra disponibilidad real; debe comprobarse que la dedicación del equipo permita realizar el trabajo técnico y los eventos del sprint.

### 2.1. Puntos del MVP y de la extensión

| Alcance | Historias y puntos | Total |
|---|---|:---:|
| **MVP — Must Have** | HU01: 2; HU05: 8; HU06: 3; HU07: 2; HU08: 3. | **18 SP** |
| **Extensión — Should Have** | HU02: 3; HU03: 2; HU04: 2; HU09: 5; HU10: 3. | **15 SP** |
| **Backlog completo** | HU01–HU10. | **33 SP** |

### 2.2. Cálculo de sprints y duración del MVP

$$
N_{MVP}=\left\lceil\frac{SP_{MVP}}{V}\right\rceil
=\left\lceil\frac{18}{10}\right\rceil
=\lceil1.8\rceil=2\;\text{sprints}
$$

$$
T_{MVP}=2\;\text{sprints}\times2\;\text{semanas/sprint}=4\;\text{semanas}
$$

### 2.3. Cálculo para el backlog completo

$$
N_{total}=\left\lceil\frac{33}{10}\right\rceil
=\lceil3.3\rceil=4\;\text{sprints}
$$

$$
T_{total}=4\;\text{sprints}\times2\;\text{semanas/sprint}=8\;\text{semanas}
$$

Los cuatro sprints **incluyen los dos del MVP**. La distribución siguiente comprueba que las historias completas caben en ese número de iteraciones sin exceder 10 SP por sprint.

---

## 3. Planificación Detallada de Sprints

### Sprint 1 — Inventario y ventas (Semanas 1 y 2) · Capacidad: 10 SP

**Objetivo:** consultar el inventario y registrar una venta manteniendo actualizado el estado del vehículo.

| Issue | Historia asignada | SP | Esfuerzo | Costo |
|:---:|---|:---:|:---:|---:|
| #1 | HU01 — Consultar inventario centralizado | 2 | 16 h | 720.000 COP |
| #5 | HU05 — Registrar venta y actualizar inventario | 8 | 64 h | 2.880.000 COP |
| **Total** | | **10** | **80 h** | **3.600.000 COP** |

**Carga:** `2 + 8 = 10 SP ≤ 10 SP`.

**Incremento esperado:** el vendedor consulta una unidad, registra la venta y comprueba que figura como vendida. Se verifica el inventario vacío, las validaciones, el guardado conjunto de venta y estado y el rechazo de ventas duplicadas. Se requieren los accesos y datos de base indicados en los supuestos del plan.

### Sprint 2 — Solicitudes y cierre del MVP (Semanas 3 y 4) · Capacidad: 10 SP

**Objetivo:** completar el circuito de recepción, consulta y seguimiento de solicitudes de interés.

| Issue | Historia asignada | SP | Esfuerzo | Costo |
|:---:|---|:---:|:---:|---:|
| #6 | HU06 — Registrar solicitud de interés | 3 | 24 h | 1.080.000 COP |
| #7 | HU07 — Consultar solicitudes de clientes | 2 | 16 h | 720.000 COP |
| #8 | HU08 — Actualizar el estado de una solicitud | 3 | 24 h | 1.080.000 COP |
| **Total** | | **8** | **64 h** | **2.880.000 COP** |

**Carga:** `3 + 2 + 3 = 8 SP ≤ 10 SP`.

**Incremento esperado:** el cliente envía su interés por un vehículo disponible o próximo; el vendedor consulta su contacto y actualiza el estado de atención. Se verifica que la solicitud no reserve ni venda el vehículo y que las funciones anteriores sigan operando.

**Cierre del MVP:** al terminar las cinco historias Must Have, se alcanzan **18 SP, 144 horas, 4 semanas y 6.480.000 COP**.

### Sprint 3 — Propuestas de incorporación (Semanas 5 y 6) · Capacidad: 10 SP

**Objetivo:** digitalizar la presentación de propuestas y la decisión del dueño.

| Issue | Historia asignada | SP | Esfuerzo | Costo |
|:---:|---|:---:|:---:|---:|
| #2 | HU02 — Registrar propuesta de incorporación | 3 | 24 h | 1.080.000 COP |
| #3 | HU03 — Aprobar propuesta de incorporación | 2 | 16 h | 720.000 COP |
| #4 | HU04 — Rechazar propuesta de incorporación | 2 | 16 h | 720.000 COP |
| **Total** | | **7** | **56 h** | **2.520.000 COP** |

**Carga:** `3 + 2 + 2 = 7 SP ≤ 10 SP`.

**Incremento esperado:** el vendedor presenta una propuesta y el dueño puede aprobarla o rechazarla. Se desarrolla primero el registro y después las decisiones. El resultado no incorpora automáticamente un vehículo al inventario ni añade una aprobación a la importación.

### Sprint 4 — Trazabilidad y cierre del backlog (Semanas 7 y 8) · Capacidad: 10 SP

**Objetivo:** conservar automáticamente las acciones y permitir su revisión por el dueño y el administrador.

| Issue | Historia asignada | SP | Esfuerzo | Costo |
|:---:|---|:---:|:---:|---:|
| #9 | HU09 — Conservar registro automático de acciones | 5 | 40 h | 1.800.000 COP |
| #10 | HU10 — Consultar y filtrar historial de acciones | 3 | 24 h | 1.080.000 COP |
| **Total** | | **8** | **64 h** | **2.880.000 COP** |

**Carga:** `5 + 3 = 8 SP ≤ 10 SP`.

**Incremento esperado:** las operaciones de propuestas, decisiones, ventas y cambios de atención generan registros con responsable, acción, fecha y elemento afectado. Se integra primero la captura de HU09 y después la consulta y los filtros de HU10. Se prueban permisos, conservación del historial y el recorrido completo.

**Limitación de la postergación:** antes de implementar HU09 no habrá auditoría automática completa. Los movimientos anteriores tendrán únicamente la evidencia manual existente; no se inventarán registros retrospectivos. Esta alternativa temporal, igual que el registro manual de propuestas durante el MVP, requiere aceptación del negocio.

### 3.1. Verificación de la distribución

| Sprint | Semanas | Carga / capacidad | Esfuerzo | Costo |
|:---:|:---:|:---:|:---:|---:|
| 1 | 1–2 | 10 / 10 SP | 80 h | 3.600.000 COP |
| 2 | 3–4 | 8 / 10 SP | 64 h | 2.880.000 COP |
| 3 | 5–6 | 7 / 10 SP | 56 h | 2.520.000 COP |
| 4 | 7–8 | 8 / 10 SP | 64 h | 2.880.000 COP |
| **Total** | **8 semanas** | **33 SP asignados** | **264 h** | **11.880.000 COP** |

Cada historia aparece una sola vez, conserva su puntaje y se planifica completa. La capacidad no utilizada no aumenta el costo: se presupuestan **33 SP**, no los 40 SP de capacidad teórica de cuatro sprints.

### 3.2. Dependencias y condiciones de viabilidad

Se mantienen los supuestos de `03_estimacion_y_costos.md`: base web, acceso por roles y registros de vehículos y clientes disponibles. HU06 también requiere un acceso desde la información pública del vehículo. No se afirma que estas capacidades estén implementadas; si falta construirlas, deberán estimarse y añadirse al plan antes de comprometer producción.

HU06, HU07 y HU08 se entregan juntas para no recibir solicitudes que el vendedor no pueda atender. HU02 precede a las decisiones HU03 y HU04 dentro del Sprint 3. HU09 precede a la consulta HU10 dentro del Sprint 4.

Las pruebas e integración se realizan en todos los sprints. Si la velocidad real o una dependencia impiden completar la carga prevista, se revisará el plan sin declarar terminada una historia incompleta.

---

## 4. Resumen Comercial de la Propuesta (Línea Base Final)

| Concepto | MVP | Extensión posterior | Backlog completo |
|---|---:|---:|---:|
| Historias | 5 Must Have | 5 Should Have | 10 |
| Story Points | **18 SP** | **15 SP** | **33 SP** |
| Sprints | **2** | **2 adicionales** | **4 en total** |
| Tiempo | **4 semanas** | **4 semanas adicionales** | **8 semanas desde el inicio** |
| Esfuerzo | **144 horas-persona** | **120 horas-persona** | **264 horas-persona** |
| Inversión estimada | **6.480.000 COP** | **5.400.000 COP** | **11.880.000 COP** |

### 4.1. Comprobación financiera

**MVP:**

- Esfuerzo: `80 + 64 = 144 horas`.
- Costo: `3.600.000 + 2.880.000 = 6.480.000 COP`.
- Verificación: `18 SP × 8 h/SP × 45.000 COP/h = 6.480.000 COP`.

**Backlog completo:**

- Esfuerzo: `80 + 64 + 56 + 64 = 264 horas`.
- Costo: `3.600.000 + 2.880.000 + 2.520.000 + 2.880.000 = 11.880.000 COP`.
- Verificación: `33 SP × 8 h/SP × 45.000 COP/h = 11.880.000 COP`.

El total del backlog **ya incluye el MVP**. Las horas representan esfuerzo agregado, no duración calendario ni horas por cada integrante. No se multiplican nuevamente por el número de personas.

