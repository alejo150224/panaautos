# Estimación Formal y Presupuesto — PANA AUTOS

**Archivo:** `DOCS/03_estimacion_y_costos.md`  
**Fecha de elaboración:** 30 de septiembre de 2026.  
**Alcance:** las diez historias HU01–HU10 de los Issues #1–#10 del repositorio `alejo150224/panaautos`. No se utiliza aquí la versión de trece historias HU-D del documento de Scrum.

**Estado:** propuesta de estimación para validar con el equipo. La simulación de votos incluida es ilustrativa; no constituye evidencia de una reunión realizada ni de consenso real.

## 1. Integrantes y Asignación de Roles

- **Product Owner (PO):** PANA AUTOS. Explica el alcance de cada historia y verifica su coherencia con las prioridades del negocio.
- **Líder Técnico:** ALEJANDRO ROSERO. Orienta la discusión técnica, aclara dependencias y riesgos y participa en la estimación.
- **Desarrollador(a) 1:** JOSE BETANCOURT. Evalúa codificación, integración, datos y pruebas de cada funcionalidad.
- **Desarrollador(a) 2:** SAMMUEL MONTAÑO. Evalúa codificación, integración, datos y pruebas, aportando una estimación independiente.
- **Desarrollador(a) 2:** JESUS MORA. Evalúa codificación, integración, datos y pruebas, aportando una estimación independiente.

Los cuatro nombres y su distribución deben completarse con la asignación acordada para este taller. Los roles del ejercicio no se trasladan automáticamente desde otros documentos del proyecto.

## 2. Parámetros Base de Estimación

- **Historia Pivote Seleccionada:** HU01 — Consultar inventario centralizado, Issue #1.
- **Puntaje Pivote Asignado:** 2 SP.
- **Escala de estimación:** 1, 2, 3, 5, 8, 13 y 20 SP.
- **Factor de Conversión ($F_c$):** 1 SP = 8 horas.
- **Tarifa Hora ($T_h$):** 45.000 COP/hora.
- **Valor equivalente de 1 SP para el ejercicio:** 8 × 45.000 = 360.000 COP.

El factor y la tarifa son los parámetros obligatorios de la guía de clase y se aplican por igual a todas las historias.

### 2.1. Justificación de la historia pivote

Se propone HU01 como referencia porque se limita a consultar vehículos existentes, mostrar sus datos y su estado actualizado y presentar un mensaje cuando el inventario está vacío. No requiere registrar ventas, modificar estados ni coordinar varias operaciones de escritura.

Se le asignan 2 SP para comparar las demás historias. HU07 tiene una carga semejante. Los formularios y validaciones adicionales reciben 3 SP; la integración transversal de auditoría recibe 5 SP; y la venta con actualización conjunta del vehículo recibe 8 SP por su mayor riesgo de inconsistencia.

Los puntos se proponen por complejidad, volumen de trabajo e incertidumbre, no por la prioridad MoSCoW. Los valores deben revisarse según el conocimiento real del equipo.

### 2.2. Simulación ilustrativa de Planning Poker

El PO explica cada historia y sus criterios. El Líder Técnico y los dos desarrolladores seleccionan una carta sin ver las de los demás y después las revelan simultáneamente. Las diferencias se discuten comparando alcance, complejidad y riesgo contra HU01; se vuelve a votar hasta llegar a un acuerdo. El puntaje no se obtiene promediando votos.

**Ejemplo simulado:** las siguientes cartas son hipotéticas y sirven como guía para realizar el ejercicio. No se atribuyen a estudiantes reales. La última columna es la propuesta que utiliza la matriz; debe confirmarse o cambiarse después de la simulación del equipo.

| Historia | Líder Técnico (simulado) | Desarrollador 1 (simulado) | Desarrollador 2 (simulado) | SP propuestos |
|---|:-:|:-:|:-:|:-:|
| HU01 | 2 | 2 | 2 | **2 SP** |
| HU02 | 3 | 5 | 3 | **3 SP** |
| HU03 | 2 | 3 | 2 | **2 SP** |
| HU04 | 2 | 2 | 3 | **2 SP** |
| HU05 | 8 | 5 | 8 | **8 SP** |
| HU06 | 3 | 3 | 5 | **3 SP** |
| HU07 | 2 | 2 | 2 | **2 SP** |
| HU08 | 3 | 2 | 3 | **3 SP** |
| HU09 | 5 | 8 | 5 | **5 SP** |
| HU10 | 3 | 5 | 3 | **3 SP** |

En HU05, una diferencia entre 5 y 8 SP se discutiría considerando que no basta con guardar un formulario: también debe evitarse una venta parcialmente registrada o duplicada. Por eso se proponen 8 SP. En HU09, la propuesta de 5 SP contempla integrar eventos de las operaciones indicadas en sus criterios, sin incluir una plataforma externa de auditoría ni exportaciones.

**Validación de la simulación del equipo:** pendiente. Registrar fecha, participantes y ajustes después de realizarla.

### 2.3. Supuestos y alcance de la estimación

La estimación considera implementación, integración con datos y pruebas de los criterios de aceptación de cada historia. Las partes compartidas se reutilizan: HU03 y HU04 no incluyen reconstruir el registro de propuestas, y HU10 no incluye volver a desarrollar la captura automática de HU09.

Para comparar las historias se supone una base web común con acceso por roles y registros de vehículos y clientes disponibles. Es un supuesto de estimación, no una afirmación de que ya esté implementada. La construcción completa de módulos de autenticación, administración de cuentas, alta de vehículos o gestión de clientes no forma parte de estos diez Issues y deberá estimarse aparte si hace falta.

No se incluyen pasarelas de pago, aprobación de créditos, reservas automáticas ni ingreso automático al inventario de los bienes recibidos por intercambio.

## 3. Matriz Detallada de Estimación Formal y Presupuesto

Se aplican las fórmulas de la guía:

$$
E_i = SP_i \times F_c
$$

$$
C_i = E_i \times T_h
$$

| ID Issue | Historia de Usuario | Story Points ($SP$) | Factor ($F_c$) | Esfuerzo ($E_i = SP_i \times F_c$) | Tarifa ($T_h$) | Costo Total ($C_i = E_i \times T_h$) | Justificación Técnica Juicio de Expertos |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: | :--- |
| **#1** | HU01 — Consultar inventario centralizado | **2 SP** | 8 h/SP | 16 h | 45.000 COP/h | **720.000 COP** | [Historia pivote] Consulta de registros existentes, listado de campos definidos, comprobación del estado actualizado y manejo del inventario vacío. No modifica datos ni integra servicios externos. |
| **#2** | HU02 — Registrar propuesta de incorporación | **3 SP** | 8 h/SP | 24 h | 45.000 COP/h | **1.080.000 COP** | Mayor trabajo que la pivote: formulario, validación de datos obligatorios, persistencia, identificación del usuario y fecha, y estado Pendiente. No incluye registrar el vehículo ni decidir la propuesta. |
| **#3** | HU03 — Aprobar propuesta de incorporación | **2 SP** | 8 h/SP | 16 h | 45.000 COP/h | **720.000 COP** | Esfuerzo acotado, comparable con la pivote: consultar la propuesta, comprobar el rol Dueño y guardar Aprobada sin incorporar el vehículo. Reutiliza la base de propuestas y permisos. |
| **#4** | HU04 — Rechazar propuesta de incorporación | **2 SP** | 8 h/SP | 16 h | 45.000 COP/h | **720.000 COP** | Esfuerzo comparable con la pivote: validar el rol, guardar Rechazada, conservar la propuesta y excluirla de pendientes. Reutiliza la base de propuestas; no se estima construirla de nuevo. |
| **#5** | HU05 — Registrar venta y actualizar inventario | **8 SP** | 8 h/SP | 64 h | 45.000 COP/h | **2.880.000 COP** | Mayor complejidad y riesgo: relacionar vehículo, cliente y vendedor, validar datos y modalidades, guardar venta y estado Vendido como una sola operación y probar fallos e intentos simultáneos para evitar duplicados. No procesa pagos ni créditos. |
| **#6** | HU06 — Registrar solicitud de interés | **3 SP** | 8 h/SP | 24 h | 45.000 COP/h | **1.080.000 COP** | Más trabajo que la pivote: formulario público, validación de nombre y contacto, asociación con vehículo disponible o próximo, guardado y confirmación sin generar reservas ni ventas. |
| **#7** | HU07 — Consultar solicitudes de clientes | **2 SP** | 8 h/SP | 16 h | 45.000 COP/h | **720.000 COP** | Trabajo comparable con la pivote: listado, detalle de datos de contacto y vehículo asociado, acceso del vendedor y mensaje sin registros. No modifica el estado de atención. |
| **#8** | HU08 — Actualizar el estado de una solicitud | **3 SP** | 8 h/SP | 24 h | 45.000 COP/h | **1.080.000 COP** | Añade escritura y validaciones a una consulta: selección entre cinco estados permitidos, control de permisos y pruebas para conservar los datos del cliente y del vehículo. |
| **#9** | HU09 — Conservar registro automático de acciones | **5 SP** | 8 h/SP | 40 h | 45.000 COP/h | **1.800.000 COP** | Supera el alcance de una consulta o formulario aislado: integrar la auditoría en registro y decisión de propuestas, ventas y cambios de atención, conservar responsable y fecha, y probar persistencia y restricciones de modificación. |
| **#10** | HU10 — Consultar y filtrar historial de acciones | **3 SP** | 8 h/SP | 24 h | 45.000 COP/h | **1.080.000 COP** | Más trabajo que la pivote por los filtros combinables de usuario, fechas y tipo de elemento y el acceso exclusivo de dueño y administrador. Reutiliza el historial generado por HU09, sin volver a estimar su captura. |
| **TOTAL** | **Backlog completo: 10 historias** | **33 SP** | — | **264 h** | — | **11.880.000 COP** | **Estimación del alcance seleccionado, pendiente de validación del equipo.** |

### 3.1. Ejemplos de cálculo

**HU01 — Historia pivote**

- Esfuerzo: 2 SP × 8 h/SP = **16 horas**.
- Costo: 16 h × 45.000 COP/h = **720.000 COP**.

**HU05 — Registrar venta y actualizar inventario**

- Esfuerzo: 8 SP × 8 h/SP = **64 horas**.
- Costo: 64 h × 45.000 COP/h = **2.880.000 COP**.

**HU09 — Conservar registro automático de acciones**

- Esfuerzo: 5 SP × 8 h/SP = **40 horas**.
- Costo: 40 h × 45.000 COP/h = **1.800.000 COP**.

## 4. Consolidado Total del Proyecto

- **Total Story Points ($SP_{\text{total}}$):** 33 SP.
- **Esfuerzo Total ($E_{\text{total}}$):** 264 horas de esfuerzo acumulado.
- **Presupuesto Comercial Total ($C_{\text{total}}$):** 11.880.000 COP, calculado con los parámetros académicos para las diez historias seleccionadas.

### 4.1. Verificación de sumatorias

**Total de puntos:**

$$
SP_{\text{total}} = 2+3+2+2+8+3+2+3+5+3 = 33\;SP
$$

**Total de esfuerzo:**

$$
E_{\text{total}} = 16+24+16+16+64+24+16+24+40+24 = 264\;\text{horas}
$$

**Total de costos por historia, en COP:**

720.000 + 1.080.000 + 720.000 + 720.000 + 2.880.000 + 1.080.000 + 720.000 + 1.080.000 + 1.800.000 + 1.080.000 = **11.880.000 COP**.

**Comprobación global:**

$$
C_{\text{total}} = E_{\text{total}} \times T_h = 264 \times 45\,000 = 11\,880\,000\;\text{COP}
$$

### 4.2. Distribución según la priorización existente

| Alcance | Historias | Total SP | Esfuerzo | Costo |
|---|---|:-:|:-:|---:|
| Must Have | HU01, HU05, HU06, HU07, HU08 | 18 SP | 144 h | 6.480.000 COP |
| Should Have | HU02, HU03, HU04, HU09, HU10 | 15 SP | 120 h | 5.400.000 COP |
| **Total** | **HU01–HU10** | **33 SP** | **264 h** | **11.880.000 COP** |

El subconjunto Must Have corresponde al MVP propuesto en la priorización anterior. Estos subtotales distribuyen el mismo presupuesto: no son costos adicionales.

### 4.3. Interpretación del presupuesto

Las 264 horas representan esfuerzo acumulado del trabajo, no duración calendario ni 264 horas por integrante. No se multiplica otra vez el total por cuatro personas. La duración real requiere conocer disponibilidad, reparto de tareas y dependencias.

El valor calculado cubre el desarrollo estimado de estas diez historias bajo los supuestos indicados. No se han añadido costos de infraestructura, licencias, impuestos, mantenimiento ni margen comercial. No constituye una cotización integral de todas las funcionalidades de PANA AUTOS.
