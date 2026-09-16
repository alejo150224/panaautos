# PANA AUTOS — Sistema web para la gestión y comercialización de vehículos

## 1. Descripción del dominio

PANA AUTOS es una empresa dedicada a la compra y venta de vehículos. Estos ingresan mediante compra directa, importación o vehículos proporcionados por empleados, que pueden conservar su propiedad o venderlos a la empresa.

Actualmente, la consulta de disponibilidad y la comunicación de ventas dependen de verificaciones manuales y comunicación directa entre el personal y el dueño. Esto dificulta organizar la información y realizar seguimiento a los movimientos.

Se propone un sistema web con un entorno público para consultar vehículos disponibles y próximos y registrar solicitudes de interés, y un entorno interno para gestionar inventario, clientes, ventas y trazabilidad.

La venta continúa con intervención del vendedor. El sistema no contempla compras completas en línea ni financiación propia de PANA AUTOS.

## 2. Actores principales del sistema

| Actor | Funciones principales |
|---|---|
| Cliente | Consulta vehículos y registra solicitudes de interés. |
| Empleado/Vendedor | Consulta inventario, gestiona clientes y solicitudes, y registra ventas. |
| Encargado de Inventario | Registra vehículos aprobados, su origen y condición de propiedad. |
| Dueño | Aprueba o rechaza propuestas de incorporación y consulta reportes. |
| Administrador | Gestiona usuarios, roles y permisos, y consulta información de gestión. |

## 3. Mapeo de requisitos

| Problema identificado | Necesidad de software | Requisito funcional |
|---|---|---|
| La disponibilidad se consulta mediante preguntas al personal o verificaciones físicas. | Centralizar la consulta del inventario. | **RF-09:** El sistema debe permitir a los empleados consultar los vehículos registrados y su estado actual. |
| Las decisiones de incorporación se comunican directamente y su seguimiento es limitado. | Centralizar la revisión de propuestas. | **RF-11:** El sistema debe permitir al dueño revisar propuestas de incorporación y aprobarlas o rechazarlas. |
| Las ventas se comunican manualmente al dueño y la actualización del inventario puede quedar pendiente. | Registrar la venta y actualizar el estado del vehículo. | **RF-14:** El sistema debe registrar vehículo, cliente, vendedor, fecha, precio y modalidad de compra, y marcar el vehículo como vendido. |
| El cliente depende del contacto directo para manifestar interés por un vehículo. | Habilitar un canal digital de solicitudes. | **RF-17:** El sistema debe permitir al cliente registrar una solicitud de interés por un vehículo disponible o próximo, proporcionando sus datos de contacto. |
| Es difícil identificar quién modificó la información y cuándo. | Mantener trazabilidad de las acciones. | **RF-22:** El sistema debe registrar el usuario responsable, la acción realizada, la fecha y el elemento afectado. |
