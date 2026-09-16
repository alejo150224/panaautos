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
| La disponibilidad de vehículos se consulta preguntando al personal o mediante verificaciones físicas. | Centralizar la consulta del inventario para conocer la disponibilidad de los vehículos. | **RF-09 — Consultar inventario:** El sistema debe permitir a los empleados consultar de forma centralizada los vehículos registrados y su estado actual. |
| Las ventas se comunican directamente al dueño y la actualización del inventario depende de acciones manuales. | Registrar las ventas y mantener actualizado el estado de los vehículos. | **RF-14 — Registrar venta:** El sistema debe permitir al vendedor registrar una venta asociando vehículo, cliente, vendedor, fecha, precio y modalidad de compra, y actualizar el estado del vehículo como vendido. |
| El cliente depende del contacto directo con la empresa para manifestar interés por un vehículo. | Habilitar un canal digital para registrar solicitudes de interés y datos de contacto. | **RF-17 — Registrar solicitud de interés:** El sistema debe permitir al cliente registrar una solicitud de interés sobre un vehículo disponible o próximo a ingresar, proporcionando sus datos de contacto. |
