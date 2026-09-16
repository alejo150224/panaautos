# PANA AUTOS — Sistema web para la gestión y comercialización de vehículos

## 1. Descripción del dominio

PANA AUTOS es una empresa dedicada a la compra y venta de vehículos. Estos ingresan mediante compra directa, importación o vehículos proporcionados por empleados. En este último caso, el vehículo puede permanecer como propiedad del empleado o ser adquirido por la empresa.

Actualmente, la consulta de disponibilidad y la comunicación de ventas dependen de verificaciones manuales y comunicación directa entre el personal y el dueño. Las propuestas de incorporación también se presentan directamente al dueño en las rutas que requieren su aprobación. Esta forma de trabajo dificulta centralizar la información, consultar las decisiones y realizar seguimiento a las solicitudes y los movimientos.

Se propone un sistema web con dos entornos:

- **Entorno público:** permite a los clientes consultar vehículos disponibles y próximos a ingresar, revisar su información y registrar solicitudes de interés.
- **Entorno interno:** permite al personal autorizado gestionar inventario, propuestas de incorporación, clientes, ventas y solicitudes, además de conservar y consultar el historial de acciones.

La venta continúa con intervención del vendedor. Las modalidades contempladas son contado, crédito externo e intercambio de vehículos o bienes. El sistema no contempla compras completas en línea ni financiación propia de PANA AUTOS.

## 2. Actores principales del sistema

| Actor | Funciones principales |
|---|---|
| Cliente | Consulta vehículos disponibles y próximos a ingresar, y registra solicitudes de interés. |
| Empleado/Vendedor | Consulta el inventario, registra propuestas de incorporación, gestiona clientes y solicitudes, y registra ventas. |
| Encargado de Inventario | Registra los vehículos aprobados, su origen y condición de propiedad. |
| Dueño | Revisa y aprueba o rechaza propuestas de incorporación, consulta reportes y revisa el historial de acciones. |
| Administrador | Gestiona usuarios, roles y permisos, y consulta información de gestión e historial de acciones. |



## 3. Mapeo de requisitos

| Problema identificado | Necesidad de software | Requisito funcional |
|---|---|---|
| **P-01 — Consulta manual de disponibilidad.** La disponibilidad de vehículos se consulta preguntando al personal o mediante verificaciones físicas, lo que dificulta obtener información consistente durante la atención al cliente. | Centralizar la consulta del inventario para conocer los vehículos registrados y su estado actual. | **RF-09 — Consultar inventario:** El sistema debe permitir a los empleados consultar de forma centralizada los vehículos registrados en el inventario y su estado actual. |
| **P-02 — Seguimiento limitado de propuestas y decisiones.** Las propuestas de incorporación y las decisiones del dueño se comunican directamente, dificultando consultar qué se propuso y qué fue aprobado o rechazado. | Registrar las propuestas de incorporación y mantener identificada la decisión del dueño. | **RF-23 — Registrar propuesta de incorporación:** El sistema debe permitir al empleado/vendedor registrar propuestas de compra directa o de vehículos proporcionados por empleados, incluyendo los datos básicos del vehículo, origen y precio estimado, asociándolas al usuario que las presenta y dejándolas pendientes de revisión.<br><br>**RF-11 — Aprobar incorporación de vehículo:** El sistema debe permitir al dueño revisar las propuestas de incorporación de vehículos y aprobarlas o rechazarlas. |
| **P-03 — Riesgo de desactualización del inventario después de una venta.** Las ventas se comunican manualmente al dueño y su registro puede quedar separado de la actualización del vehículo, generando riesgo de mantener información desactualizada. | Vincular el registro de la venta con la actualización del estado del vehículo. | **RF-14 — Registrar venta:** El sistema debe permitir al vendedor registrar una venta asociando vehículo, cliente, vendedor, fecha, precio y modalidad de compra, y actualizar el estado del vehículo como vendido. |
| **P-04 — Solicitudes de clientes sin seguimiento centralizado.** El interés del cliente se expresa mediante contacto directo y su seguimiento depende de la comunicación entre las personas, lo que dificulta conocer qué solicitudes requieren atención. | Habilitar un canal digital para recibir solicitudes de interés y organizar su seguimiento por parte del vendedor. | **RF-17 — Registrar solicitud de interés:** El sistema debe permitir al cliente registrar una solicitud de interés sobre un vehículo disponible o próximo a ingresar, proporcionando sus datos de contacto.<br><br>**RF-18 — Gestionar solicitudes de clientes:** El sistema debe permitir al vendedor consultar, gestionar y actualizar el estado de las solicitudes realizadas por los clientes. |
| **P-05 — Trazabilidad limitada de los cambios.** Es difícil identificar quién modificó la información, cuándo lo hizo y sobre qué registro, lo que limita la revisión de los movimientos. | Conservar y consultar un historial que permita identificar responsables y revisar las acciones realizadas. | **RF-22 — Registrar historial de acciones:** El sistema debe registrar las acciones relevantes realizadas por los usuarios, incluyendo el usuario responsable, la acción, la fecha y hora y el elemento afectado.<br><br>**RF-24 — Consultar historial de acciones:** El sistema debe permitir al dueño y al administrador consultar el historial de acciones y filtrarlo por usuario, rango de fechas y tipo de elemento afectado. |

