# Reporte de Priorización MoSCoW, Valor de Negocio y Estimación Empírica — PANA AUTOS

## 1. Matriz de Priorización y Análisis de Valor

| ID Issue | Historia de Usuario | Categoría MoSCoW | Criterio de Impacto Principal | Justificación Estratégica | Estimación Empírica (Cualitativa) |
|---|---|---|---|---|---|
| [#1](https://github.com/alejo150224/panaautos/issues/1) | **HU01 — Consultar inventario centralizado** | **Must Have** | Impacto Operativo | Proporciona al vendedor una consulta centralizada del inventario y del estado actual de los vehículos. Sin ella, se mantiene la dependencia de consultas informales que el primer alcance busca resolver. | **Baja.** Consulta y presentación de registros existentes, control de acceso y manejo del inventario vacío. Debe verificarse que una nueva consulta muestre el estado actualizado. |
| [#2](https://github.com/alejo150224/panaautos/issues/2) | **HU02 — Registrar propuesta de incorporación** | **Should Have** | Impacto Operativo | Organiza las oportunidades de incorporación. Puede postergarse si el dueño y el vendedor mantienen temporalmente un registro manual acordado de propuestas y decisiones, fuera del sistema. | **Media.** Formulario con validaciones, identificación del usuario que presenta la propuesta, fecha y estado inicial, sin incorporar automáticamente el vehículo al inventario. |
| [#3](https://github.com/alejo150224/panaautos/issues/3) | **HU03 — Aprobar propuesta de incorporación** | **Should Have** | Impacto Operativo | Permite conservar la aprobación del dueño. Se implementará junto con el registro de propuestas; durante el primer alcance, la decisión continuará documentándose mediante el procedimiento manual acordado. | **Baja.** Consulta de una propuesta pendiente, validación del rol Dueño y cambio persistente a Aprobada. Supone disponible la base de propuestas y permisos. |
| [#4](https://github.com/alejo150224/panaautos/issues/4) | **HU04 — Rechazar propuesta de incorporación** | **Should Have** | Impacto Operativo | Conserva las decisiones negativas y evita confundir propuestas rechazadas con pendientes. Se posterga junto con HU02 y HU03, manteniendo temporalmente un registro manual de decisiones. | **Baja.** Validación del rol Dueño, cambio a Rechazada y conservación de la propuesta para consulta. Comparte la base técnica del flujo de aprobación. |
| [#5](https://github.com/alejo150224/panaautos/issues/5) | **HU05 — Registrar venta y actualizar inventario** | **Must Have** | Impacto Financiero / Monetario | Registra los datos económicos de una venta concretada y mantiene su coherencia con el inventario. No procesa pagos ni concede créditos; su valor financiero está en el control de la operación registrada. | **Alta.** Debe guardar la venta y cambiar el vehículo a Vendido como una sola operación, evitar resultados parciales y rechazar ventas duplicadas, incluso ante intentos simultáneos. |
| [#6](https://github.com/alejo150224/panaautos/issues/6) | **HU06 — Registrar solicitud de interés** | **Must Have** | Impacto en Experiencia de Usuario (UX) | Habilita el contacto inicial digital sin exigir desplazamiento. Es imprescindible para el entorno público elegido en este primer alcance, aunque no cierre una venta por internet. | **Media.** Formulario público, validación de datos de contacto, asociación con un vehículo disponible o próximo y confirmación sin generar reservas ni ventas. |
| [#7](https://github.com/alejo150224/panaautos/issues/7) | **HU07 — Consultar solicitudes de clientes** | **Must Have** | Impacto Operativo | Hace utilizables las solicitudes recibidas: el vendedor puede conocer el vehículo de interés y los datos para contactar al cliente. Recibir solicitudes sin poder consultarlas dejaría incompleto el circuito de atención. | **Baja.** Listado y detalle de solicitudes, consulta de datos relacionados, control de acceso y mensaje cuando no existen registros. |
| [#8](https://github.com/alejo150224/panaautos/issues/8) | **HU08 — Actualizar el estado de una solicitud** | **Must Have** | Impacto Operativo | Permite distinguir las solicitudes nuevas, en contacto, en negociación, atendidas y cerradas. Evita que el seguimiento continúe dependiendo únicamente de la memoria del vendedor. | **Media.** Validación de estados permitidos, permisos de modificación, persistencia del cambio y conservación de los demás datos de la solicitud. |
| [#9](https://github.com/alejo150224/panaautos/issues/9) | **HU09 — Conservar registro automático de acciones** | **Should Have** | Impacto Operativo | Aporta trazabilidad y evidencia de los movimientos. Se propone después del primer piloto, aceptando temporalmente que no habrá historial automático completo y que los movimientos deberán documentarse manualmente. | **Media.** Integración del registro automático en varias operaciones, identificación del responsable, conservación de las entradas y restricciones de edición y eliminación. |
| [#10](https://github.com/alejo150224/panaautos/issues/10) | **HU10 — Consultar y filtrar historial de acciones** | **Should Have** | Impacto Operativo | Facilita la revisión de movimientos por el dueño y el administrador. Se implementará junto con HU09; sin registros de auditoría, la pantalla de consulta no tendría información útil. | **Media.** Consulta de auditoría, filtros combinables por usuario, fechas y tipo de elemento, y acceso restringido al dueño y al administrador. |

### 1.1. Criterios de clasificación

- **Must Have:** indispensable para el primer alcance definido de inventario, ventas y atención digital de solicitudes.
- **Should Have:** importante para el producto completo, pero postergable mediante una alternativa manual explícita y temporal.
- **Could Have:** mejora deseable que se realizaría solo con capacidad sobrante.
- **Won't Have:** funcionalidad excluida de la iteración actual.

No se asignan historias a Could Have ni Won't Have en esta propuesta. Las diez historias seleccionadas son esenciales para el primer alcance o importantes para completar los cinco problemas del proyecto. Se crearán las cuatro etiquetas solicitadas, aunque dos no tengan Issues asignados.

La categoría de impacto y la prioridad son distintas: HU06 aporta principalmente valor de UX, pero se considera Must Have porque el canal público de solicitudes es parte del objetivo del primer alcance.

### 1.2. Criterios de estimación

- **Baja:** consultas, formularios o cambios simples sobre una base técnica existente, con validaciones acotadas.
- **Media:** combinación de validaciones, permisos, relaciones entre datos o integración con varias operaciones.
- **Alta:** mayor riesgo de inconsistencias, necesidad de coordinar cambios y pruebas de fallos o concurrencia.

Las estimaciones deben contrastarse con los conocimientos reales del equipo. No se ha fijado una tecnología, velocidad de desarrollo ni equivalencia entre complejidad y horas. Baja complejidad no significa bajo valor de negocio.

## 2. Alcance del Producto Mínimo Viable (MVP)

### 2.1. Historias incluidas

Para este taller se propone un MVP de consulta de inventario, registro de ventas y atención digital de solicitudes, compuesto por las historias clasificadas como Must Have:

| Issue | Historia | Capacidad incluida |
|---|---|---|
| #1 | HU01 | Consultar vehículos registrados y su estado actual. |
| #5 | HU05 | Registrar una venta y actualizar el vehículo como vendido. |
| #6 | HU06 | Recibir solicitudes sobre vehículos disponibles o próximos. |
| #7 | HU07 | Consultar las solicitudes y los datos de contacto. |
| #8 | HU08 | Actualizar el estado de atención de cada solicitud. |

**Justificación de selección:** se atienden los problemas P-01 y P-03, y se cubre el circuito de recepción, consulta y seguimiento de solicitudes de P-04. Las propuestas de incorporación (P-02) y la auditoría (P-05) no se consideran resueltas en este primer alcance.

### 2.2. Funcionalidades postergadas

| Historias | Funcionalidad | Alternativa temporal propuesta |
|---|---|---|
| HU02, HU03 y HU04 | Registrar, aprobar y rechazar propuestas. | Registro manual acordado entre vendedor y dueño, conservando la propuesta y su decisión fuera del sistema. |
| HU09 y HU10 | Registrar y consultar el historial automático. | Registro manual de movimientos relevantes. Esta alternativa no equivale a una auditoría automática ni permite recuperar de forma automática acciones pasadas. |

Las alternativas manuales requieren aceptación del responsable del negocio. Si la auditoría desde el primer día es obligatoria para PANA AUTOS, HU09 y HU10 deben reclasificarse como Must Have y ajustarse el MVP.

### 2.3. Dependencias y condiciones de viabilidad

Este documento prioriza las diez historias seleccionadas, no todo el desarrollo del proyecto. Antes de utilizar el MVP con datos reales deberán estar disponibles la autenticación y autorización del personal, los registros de vehículos y clientes y una ficha pública desde la que enviar solicitudes.

No se presupone que esas capacidades ya estén implementadas ni que su esfuerzo sea cero. Para una demostración académica pueden prepararse cuentas y registros de prueba; para producción, las capacidades faltantes deben identificarse, estimarse y planificarse antes del lanzamiento.

HU06, HU07 y HU08 se incluyen juntas para que el canal de solicitudes tenga recepción, consulta y seguimiento. HU02, HU03 y HU04 se planifican como un conjunto coherente. HU10 requiere los registros generados por HU09.

HU09 no se considerará terminada hasta que cubra todas las operaciones indicadas en sus criterios de aceptación, incluidas las propuestas cuando se implementen. En HU05 debe validarse con el negocio qué estados permiten registrar una venta, especialmente el tratamiento de vehículos reservados.

### 2.4. Límites del producto

La solución registra ventas concretadas por el vendedor. No procesa pagos en línea, no otorga financiación propia, no aprueba créditos externos y no incorpora automáticamente al inventario los bienes recibidos por intercambio. Una solicitud de interés no genera una reserva ni una venta.

## 3. Etiquetas de Prioridad en GitHub Issues

| Etiqueta | Categoría | Issues que deben tenerla |
|---|---|---|
| `must-have` | Must Have | #1, #5, #6, #7 y #8. |
| `should-have` | Should Have | #2, #3, #4, #9 y #10. |
| `could-have` | Could Have | Sin asignaciones en esta versión. |
| `wont-have` | Won't Have | Sin asignaciones en esta versión. |

Cada Issue debe tener exactamente una etiqueta MoSCoW. Pueden conservarse otras etiquetas de tema o tipo de trabajo. La prioridad no indica que la historia esté implementada.

**Resumen:** 5 Must Have, 5 Should Have, 0 Could Have y 0 Won't Have.

## 4. Coevaluación y Feedback Cruzado

**Estado:** pendiente de realizar. No se registra una validación por otro equipo hasta contar con evidencia de la revisión.

| Aspecto | Registro |
|---|---|
| Equipo que revisa PANA AUTOS | Pendiente. |
| Representante y fecha | Pendiente. |
| Issues revisados | Pendiente. |
| Observaciones sobre valor de negocio y MoSCoW | Pendiente. |
| Observaciones sobre complejidad y dependencias | Pendiente. |
| Ajustes aceptados o rechazados y justificación | Pendiente. |
| Enlace al comentario o evidencia de la revisión | Pendiente. |
| Backlog de otro equipo revisado por nuestro representante | Pendiente. |
| Enlace al feedback que entregamos al otro equipo | Pendiente. |

La revisión debe comprobar si las funciones Must Have son indispensables para el MVP propuesto, si las alternativas de las Should Have son aceptables, si las dependencias están cubiertas y si la dificultad asignada corresponde al conocimiento del equipo.

## 5. Base Documental

- Documento del proyecto: [01_requisitos.md](01_requisitos.md).
- Historias de usuario: Issues #1 a #10 de `alejo150224/panaautos`, enlazados en la matriz.
- Guía docente aportada: Unidad 2, Clase 2 — Valor de Negocio, Priorización y Estimación Empírica.

RF-23 y RF-24 siguen siendo requisitos propuestos pendientes de validación del negocio. Esta priorización no modifica por sí sola los requisitos ni los criterios de aceptación de las historias.
